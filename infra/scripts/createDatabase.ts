import { Client } from "pg";
import { parse } from "pg-connection-string";
import { EnvConfigurationError } from "@/lib/utils/errors";

const dbName = process.env.POSTGRES_DB;
const connectionString = process.env.DATABASE_URL;

function getAdminConnectionString(connectionString: string): string {
  const config = parse(connectionString);
  const { user, password, host, port } = config;
  return `postgresql://${user}:${password}@${host}:${port}/postgres`;
}

async function main() {
  if (!connectionString)
    throw new EnvConfigurationError("DATABASE_URL is not set");
  if (!dbName) throw new EnvConfigurationError("POSTGRES_DB is not set");

  const adminConnectionString = getAdminConnectionString(connectionString);
  const client = new Client({ connectionString: adminConnectionString });
  await client.connect();

  const res = await client.query(
    `SELECT 1 FROM pg_database WHERE datname = $1`,
    [dbName],
  );
  if (res.rowCount === 0) {
    await client.query(`CREATE DATABASE "${dbName}"`);
    console.log(`🗃️ Database "${dbName}" created`);
  } else {
    console.log(`🗃️ Database "${dbName}" already exists, skipping...`);
  }
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
