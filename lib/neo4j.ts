import neo4j, { Driver } from "neo4j-driver";

// Singleton driver instance, reused across hot reloads in dev and across
// requests in production (avoids exhausting the free-tier connection limit).
let driver: Driver | undefined;

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable "${name}". Copy .env.example to .env and fill in your CognoDB credentials.`
    );
  }
  return value;
}

export function getDriver(): Driver {
  if (driver) return driver;

  const uri = getRequiredEnv("COGNODB_URI");
  const user = process.env.COGNODB_USER || "cognodb";
  const password = getRequiredEnv("COGNODB_PASSWORD");

  driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
  return driver;
}

/**
 * Runs a parameterised Cypher query and returns the raw Neo4j records.
 * Always use parameters ($param) — never string-concatenate Cypher.
 */
export async function runQuery<T = Record<string, unknown>>(
  cypher: string,
  params: Record<string, unknown> = {}
): Promise<T[]> {
  const session = getDriver().session();
  try {
    const result = await session.run(cypher, params);
    return result.records.map((record) => record.toObject() as T);
  } finally {
    await session.close();
  }
}

export async function verifyConnectivity(): Promise<boolean> {
  try {
    await getDriver().verifyConnectivity();
    return true;
  } catch {
    return false;
  }
}
