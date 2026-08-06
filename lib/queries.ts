import { runQuery } from "./neo4j";

/**
 * All Cypher lives here, one function per query, always parameterised.
 * API routes call these functions rather than embedding Cypher inline.
 *
 * The visiting user is NOT stored as a Person node — they pick their current
 * role and skills through the UI, and those are passed straight into the
 * queries below as an ephemeral profile. Only the seeded Person nodes exist
 * in the graph; the visitor's own name is display-only.
 */

export interface PersonSummary {
  name: string;
  currentTitle: string;
}

export interface JobSummary {
  title: string;
  level: string;
}

export interface SkillSummary {
  name: string;
  category: string;
}

export async function listPeople(): Promise<PersonSummary[]> {
  return runQuery<PersonSummary>(
    `MATCH (p:Person)
     RETURN p.name AS name, p.currentTitle AS currentTitle
     ORDER BY p.name`
  );
}

export async function listJobs(): Promise<JobSummary[]> {
  return runQuery<JobSummary>(
    `MATCH (j:Job)
     RETURN j.title AS title, j.level AS level
     ORDER BY j.title`
  );
}

export async function listSkills(): Promise<SkillSummary[]> {
  return runQuery<SkillSummary>(
    `MATCH (s:Skill)
     RETURN s.name AS name, s.category AS category
     ORDER BY s.category, s.name`
  );
}

export interface CareerPathResult {
  found: boolean;
  path: { title: string; level: string }[];
  hops: number;
}

/**
 * Multi-hop traversal (2+ hops): the shortest chain of NEXT_ROLE steps from
 * the visitor's current job to a target job. Variable-length path matching
 * like this needs a recursive CTE (and a stop condition) in SQL; in Cypher
 * it's a single pattern.
 */
export async function getCareerPath(
  currentTitle: string,
  targetJobTitle: string
): Promise<CareerPathResult> {
  const rows = await runQuery<{ titles: string[]; levels: string[] }>(
    `MATCH (start:Job {title: $currentTitle})
     MATCH (target:Job {title: $targetJobTitle})
     MATCH path = shortestPath((start)-[:NEXT_ROLE*1..6]->(target))
     RETURN [n IN nodes(path) | n.title] AS titles,
            [n IN nodes(path) | n.level] AS levels`,
    { currentTitle, targetJobTitle }
  );

  if (rows.length === 0) {
    return { found: false, path: [], hops: 0 };
  }

  const { titles, levels } = rows[0];
  const path = titles.map((title, i) => ({ title, level: levels[i] }));
  return { found: true, path, hops: path.length - 1 };
}

export interface SkillGapResult {
  missingSkills: { name: string; importance: number }[];
  suggestedNextSkills: { from: string; to: string; strength: number }[];
}

/**
 * Skills required by the target job that aren't in the visitor's chosen
 * skill list, plus a "what to learn next" suggestion: skills they already
 * have that lead (via LEADS_TO) directly into one of the missing skills.
 */
export async function getSkillGap(
  skills: string[],
  targetJobTitle: string
): Promise<SkillGapResult> {
  const missing = await runQuery<{ name: string; importance: number }>(
    `MATCH (j:Job {title: $targetJobTitle})-[r:REQUIRES_SKILL]->(s:Skill)
     WHERE NOT s.name IN $skills
     RETURN s.name AS name, r.importance AS importance
     ORDER BY r.importance DESC`,
    { skills, targetJobTitle }
  );

  const suggestions = await runQuery<{ from: string; to: string; strength: number }>(
    `MATCH (have:Skill)-[l:LEADS_TO]->(missing:Skill)<-[:REQUIRES_SKILL]-(:Job {title: $targetJobTitle})
     WHERE have.name IN $skills AND NOT missing.name IN $skills
     RETURN have.name AS from, missing.name AS to, l.strength AS strength
     ORDER BY l.strength DESC`,
    { skills, targetJobTitle }
  );

  return { missingSkills: missing, suggestedNextSkills: suggestions };
}

export interface SimilarPerson {
  name: string;
  currentTitle: string;
  sharedSkillCount: number;
  sharedSkills: string[];
}

/**
 * Seeded people who share at least `minShared` skills with the visitor's
 * chosen skill list. A self-join + GROUP BY/HAVING in SQL; a single pattern
 * match with aggregation in Cypher.
 */
export async function getSimilarPeople(
  skills: string[],
  minShared = 3
): Promise<SimilarPerson[]> {
  return runQuery<SimilarPerson>(
    `MATCH (s:Skill)<-[:HAS_SKILL]-(other:Person)
     WHERE s.name IN $skills
     WITH other, collect(DISTINCT s.name) AS sharedSkills
     WHERE size(sharedSkills) >= $minShared
     RETURN other.name AS name,
            other.currentTitle AS currentTitle,
            size(sharedSkills) AS sharedSkillCount,
            sharedSkills
     ORDER BY sharedSkillCount DESC`,
    { skills, minShared }
  );
}

export interface CompanyRecommendation {
  company: string;
  industry: string;
  connectedVia: string[];
}

/**
 * Companies where at least one "skill twin" (a seeded person sharing 2+
 * skills with the visitor's chosen skill list) currently works. A 3-hop
 * pattern (Skill <- Person -> Company) — the kind of query that turns into
 * several nested self-joins in a relational schema.
 */
export async function getCompanyRecommendations(
  skills: string[],
  minShared = 2
): Promise<CompanyRecommendation[]> {
  return runQuery<CompanyRecommendation>(
    `MATCH (s:Skill)<-[:HAS_SKILL]-(twin:Person)
     WHERE s.name IN $skills
     WITH twin, count(DISTINCT s) AS shared
     WHERE shared >= $minShared
     MATCH (twin)-[:WORKED_AT]->(c:Company)
     RETURN c.name AS company, c.industry AS industry,
            collect(DISTINCT twin.name) AS connectedVia
     ORDER BY size(connectedVia) DESC`,
    { skills, minShared }
  );
}
