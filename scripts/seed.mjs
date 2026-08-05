/**
 * Seed script for CognoDB.
 *
 * Usage:
 *   node -r dotenv/config scripts/seed.mjs
 *
 * Loads environment variables from .env (COGNODB_URI, COGNODB_USER, COGNODB_PASSWORD)
 * and populates the graph with seed data. Replace the sample nodes/relationships
 * below with your actual use case's data model once it's decided.
 */
import "dotenv/config";
import neo4j from "neo4j-driver";

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

async function seed() {
  const session = driver.session();
  try {
    // TODO: Replace with real seed data once the use case is chosen.
    await session.run(`
      MERGE (a:Person {name: $name1})
      MERGE (b:Person {name: $name2})
      MERGE (a)-[:KNOWS]->(b)
    `, { name1: "Alice", name2: "Bob" });

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
