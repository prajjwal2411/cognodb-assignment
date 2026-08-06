import { runQuery } from "./neo4j";

/**
 * All Cypher lives here, one function per query, always parameterised.
 * API routes call these functions rather than embedding Cypher inline.
 */

export interface PersonSummary {
  name: string;
  currentTitle: string;
}

export interface JobSummary {
  title: string;
  level: string;
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

export interface CareerPathResult {
  found: boolean;
  path: { title: string; level: string }[];
  hops: number;
}

/**
 * Multi-hop traversal (2+ hops): the shortest chain of NEXT_ROLE steps from
 * a person's current job to a target job. Variable-length path matching like
 * this needs a recursive CTE (and a stop condition) in SQL; in Cypher it's
 * a single pattern.
 */
export async function getCareerPath(
  personName: string,
  targetJobTitle: string
): Promise<CareerPathResult> {
  const rows = await runQuery<{ titles: string[]; levels: string[] }>(
    `MATCH (p:Person {name: $personName})
     MATCH (start:Job {title: p.currentTitle})
     MATCH (target:Job {title: $targetJobTitle})
     MATCH path = shortestPath((start)-[:NEXT_ROLE*1..6]->(target))
     RETURN [n IN nodes(path) | n.title] AS titles,
            [n IN nodes(path) | n.level] AS levels`,
    { personName, targetJobTitle }
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
 * Skills required by the target job that the person doesn't have yet, plus
 * a "what to learn next" suggestion: skills the person already has that lead
 * (via LEADS_TO) directly into one of the missing skills.
 */
export async function getSkillGap(
  personName: string,
  targetJobTitle: string
): Promise<SkillGapResult> {
  const missing = await runQuery<{ name: string; importance: number }>(
    `MATCH (j:Job {title: $targetJobTitle})-[r:REQUIRES_SKILL]->(s:Skill)
     WHERE NOT EXISTS {
       MATCH (:Person {name: $personName})-[:HAS_SKILL]->(s)
     }
     RETURN s.name AS name, r.importance AS importance
     ORDER BY r.importance DESC`,
    { personName, targetJobTitle }
  );

  const suggestions = await runQuery<{ from: string; to: string; strength: number }>(
    `MATCH (p:Person {name: $personName})-[:HAS_SKILL]->(have:Skill)
     MATCH (have)-[l:LEADS_TO]->(missing:Skill)<-[:REQUIRES_SKILL]-(:Job {title: $targetJobTitle})
     WHERE NOT EXISTS {
       MATCH (p)-[:HAS_SKILL]->(missing)
     }
     RETURN have.name AS from, missing.name AS to, l.strength AS strength
     ORDER BY l.strength DESC`,
    { personName, targetJobTitle }
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
 * People who share at least `minShared` skills with the given person
 * (excluding themselves). A same-table self-join + GROUP BY/HAVING in SQL;
 * a single pattern match with aggregation in Cypher.
 */
export async function getSimilarPeople(
  personName: string,
  minShared = 3
): Promise<SimilarPerson[]> {
  return runQuery<SimilarPerson>(
    `MATCH (me:Person {name: $personName})-[:HAS_SKILL]->(s:Skill)<-[:HAS_SKILL]-(other:Person)
     WHERE other.name <> $personName
     WITH other, collect(DISTINCT s.name) AS sharedSkills
     WHERE size(sharedSkills) >= $minShared
     RETURN other.name AS name,
            other.currentTitle AS currentTitle,
            size(sharedSkills) AS sharedSkillCount,
            sharedSkills
     ORDER BY sharedSkillCount DESC`,
    { personName, minShared }
  );
}

export interface CompanyRecommendation {
  company: string;
  industry: string;
  connectedVia: string[];
}

/**
 * Companies the person hasn't worked at, where at least one "skill twin"
 * (someone sharing 2+ skills) currently works. A 3-hop pattern
 * (Person -> Skill <- Person -> Company) with an anti-join against the
 * person's own work history — the kind of query that turns into several
 * nested self-joins in a relational schema.
 */
export async function getCompanyRecommendations(
  personName: string,
  minShared = 2
): Promise<CompanyRecommendation[]> {
  return runQuery<CompanyRecommendation>(
    `MATCH (me:Person {name: $personName})-[:HAS_SKILL]->(s:Skill)<-[:HAS_SKILL]-(twin:Person)
     WHERE twin.name <> $personName
     WITH twin, count(DISTINCT s) AS shared
     WHERE shared >= $minShared
     MATCH (twin)-[:WORKED_AT]->(c:Company)
     WHERE NOT EXISTS {
       MATCH (:Person {name: $personName})-[:WORKED_AT]->(c)
     }
     RETURN c.name AS company, c.industry AS industry,
            collect(DISTINCT twin.name) AS connectedVia
     ORDER BY size(connectedVia) DESC`,
    { personName, minShared }
  );
}
