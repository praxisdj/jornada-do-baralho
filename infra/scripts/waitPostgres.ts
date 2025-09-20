import { EnvConfigurationError } from "@/lib/utils/errors";
import { exec } from "node:child_process";
import { setTimeout } from "timers/promises";

let attempts = 0;
const maxAttempts = 60; // Increased for CI environments

async function checkPostgres(
  containerName: string,
  postgresHost: string,
  postgresPort: string,
): Promise<void> {
  // First check if container is running
  exec(
    `docker ps --filter "name=${containerName}" --format "{{.Names}}"`,
    async (error, stdout) => {
      if (error || !stdout.trim()) {
        console.log(`\n❌ Container ${containerName} is not running`);
        process.exit(1);
        return;
      }

      // Then check if postgres is ready
      // Inside the container, postgres always runs on port 5432
      const dockerExecCommand = `docker exec ${containerName} pg_isready --host localhost --port 5432`;
      exec(`${dockerExecCommand}`, async (_error, stdout) => {
        if (stdout.includes("accepting connections")) {
          console.log("\n🟢 Postgres is ready!\n");
          process.exit(0);
        } else {
          console.log(
            `\n🔴 Postgres is not ready yet. Attempt ${attempts + 1}/${maxAttempts} - Command: ${dockerExecCommand} | Output ${stdout}`,
          );
        }

        attempts++;
        if (attempts >= maxAttempts) {
          console.error("\n❌ Postgres did not become ready in time.");
          process.exit(1);
        }

        await setTimeout(2000); // Increased wait time for CI
        await checkPostgres(containerName, postgresHost, postgresPort);
      });
    },
  );
}

const containerName = process.env.DOCKER_CONTAINER_NAME_DB;
const postgresHost = process.env.POSTGRES_HOST;
const postgresPort = process.env.POSTGRES_PORT;

if (!containerName) {
  throw new EnvConfigurationError("DOCKER_CONTAINER_NAME_DB is not set");
}

if (!postgresHost) {
  throw new EnvConfigurationError("POSTGRES_HOST is not set");
}

if (!postgresPort) {
  throw new EnvConfigurationError("POSTGRES_PORT is not set");
}

console.log(`┗ on ${containerName} - ${postgresHost}:${postgresPort}`);

console.log(
  `🔴 Waiting for Postgres to accept connections on ${containerName} - ${postgresHost}:${postgresPort}...`,
);
await checkPostgres(containerName, postgresHost, postgresPort);
