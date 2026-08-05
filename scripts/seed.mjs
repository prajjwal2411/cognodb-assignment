/**
 * Seed script for CognoDB — Skill & Career Path Navigator.
 *
 * Loads Person, Skill, Job and Company nodes plus their relationships
 * (HAS_SKILL, REQUIRES_SKILL, WORKED_AT, LEADS_TO, NEXT_ROLE) from
 * ./data.mjs. Safe to re-run: every write uses MERGE, so re-seeding
 * does not create duplicates.
 *
 * Usage:
 *   npm run seed
 */
import "dotenv/config";
import neo4j from "neo4j-driver";
import {
  skills,
  skillProgressions,
  jobs,
  jobProgressions,
  jobSkillRequirements,
  companies,
  people,
} from "./data.mjs";

const uri = process.env.COGNODB_URI;
const user = process.env.COGNODB_USER || "cognodb";
const password = process.env.COGNODB_PASSWORD;

if (!uri || !password) {
  console.error(
    "Missing COGNODB_URI or COGNODB_PASSWORD. Copy .env.example to .env and fill in your credentials."
  );
  process.exit(1);
}

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

async function run(session, cypher, params) {
  await session.run(cypher, params);
}

async function seed() {
  const session = driver.session();
  try {
    console.log("Clearing existing data...");
    await run(session, "MATCH (n) DETACH DELETE n");

    console.log(`Loading ${skills.length} skills...`);
    await run(
      session,
      `UNWIND $rows AS row
       MERGE (s:Skill {name: row.name})
       SET s.category = row.category`,
      { rows: skills }
    );

    console.log(`Loading ${skillProgressions.length} skill progressions...`);
    await run(
      session,
      `UNWIND $rows AS row
       MATCH (a:Skill {name: row[0]}), (b:Skill {name: row[1]})
       MERGE (a)-[r:LEADS_TO]->(b)
       SET r.strength = row[2]`,
      { rows: skillProgressions }
    );

    console.log(`Loading ${jobs.length} jobs...`);
    await run(
      session,
      `UNWIND $rows AS row
       MERGE (j:Job {title: row.title})
       SET j.level = row.level`,
      { rows: jobs }
    );

    console.log(`Loading ${jobProgressions.length} job progressions...`);
    await run(
      session,
      `UNWIND $rows AS row
       MATCH (a:Job {title: row[0]}), (b:Job {title: row[1]})
       MERGE (a)-[:NEXT_ROLE]->(b)`,
      { rows: jobProgressions }
    );

    console.log(`Loading ${jobSkillRequirements.length} job skill requirements...`);
    await run(
      session,
      `UNWIND $rows AS row
       MATCH (j:Job {title: row[0]}), (s:Skill {name: row[1]})
       MERGE (j)-[r:REQUIRES_SKILL]->(s)
       SET r.importance = row[2]`,
      { rows: jobSkillRequirements }
    );

    console.log(`Loading ${companies.length} companies...`);
    await run(
      session,
      `UNWIND $rows AS row
       MERGE (c:Company {name: row.name})
       SET c.industry = row.industry`,
      { rows: companies }
    );

    console.log(`Loading ${people.length} people...`);
    await run(
      session,
      `UNWIND $rows AS row
       MERGE (p:Person {name: row.name})
       SET p.currentTitle = row.currentTitle`,
      { rows: people }
    );

    console.log("Loading person-skill relationships...");
    await run(
      session,
      `UNWIND $rows AS row
       MATCH (p:Person {name: row.name})
       UNWIND row.skills AS skill
       MATCH (s:Skill {name: skill.name})
       MERGE (p)-[r:HAS_SKILL]->(s)
       SET r.proficiency = skill.proficiency`,
      { rows: people }
    );

    console.log("Loading person work history...");
    await run(
      session,
      `UNWIND $rows AS row
       MATCH (p:Person {name: row.name})
       UNWIND row.workHistory AS job
       MATCH (c:Company {name: job.company})
       MERGE (p)-[r:WORKED_AT]->(c)
       SET r.role = job.role, r.years = job.years`,
      { rows: people }
    );

    console.log("Seed data loaded successfully.");
  } finally {
    await session.close();
    await driver.close();
  }
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
