#!/usr/bin/env bun

import { readFileSync, existsSync } from "fs";

/**
 * Script to check if .env.test has all environment variables declared in .env
 * Variables should be on the same lines, but values don't need to match
 * This is to ensure we are not forgetting to add new variables to .env.test, which you are if you are reading this
 */

const ENV_FILE = ".env";
const ENV_TEST_FILE = ".env.test";

function parseEnvFile(filePath: string): {
  variables: string[];
  lines: string[];
} {
  if (!existsSync(filePath)) {
    console.error(`❌ File ${filePath} does not exist`);
    process.exit(1);
  }

  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const variables: string[] = [];

  lines.forEach((line) => {
    const trimmedLine = line.trim();
    // Skip empty lines and comments
    if (!trimmedLine || trimmedLine.startsWith("#")) {
      variables.push(""); // Keep empty slots for line alignment
      return;
    }

    // Extract variable name from KEY=VALUE format
    const match = trimmedLine.match(/^([A-Z_][A-Z0-9_]*)=/);
    if (match) {
      variables.push(match[1]);
    } else {
      variables.push(""); // Invalid format, keep empty slot
    }
  });

  return { variables, lines };
}

function checkEnvSync(): void {
  const envData = parseEnvFile(ENV_FILE);
  const envTestData = parseEnvFile(ENV_TEST_FILE);

  let hasErrors = false;
  const maxLines = Math.max(envData.lines.length, envTestData.lines.length);

  // Check each line
  for (let i = 0; i < maxLines; i++) {
    const envLine = envData.lines[i] || "";
    const envTestLine = envTestData.lines[i] || "";
    const envVar = envData.variables[i] || "";
    const envTestVar = envTestData.variables[i] || "";

    const envTrimmed = envLine.trim();
    const envTestTrimmed = envTestLine.trim();

    // Skip if both lines are empty or comments
    if (
      (!envTrimmed || envTrimmed.startsWith("#")) &&
      (!envTestTrimmed || envTestTrimmed.startsWith("#"))
    ) {
      continue;
    }

    // Check if .env has a variable but .env.test doesn't
    if (envVar && !envTestVar) {
      console.error(
        `❌ Line ${i + 1}: Variable '${envVar}' exists in .env but missing in .env.test`,
      );
      console.error(`   .env:      ${envLine}`);
      console.error(`   .env.test: ${envTestLine || "(empty)"}\n`);
      hasErrors = true;
    }
    // Check if .env.test has a variable but .env doesn't
    else if (!envVar && envTestVar) {
      console.error(
        `❌ Line ${i + 1}: Variable '${envTestVar}' exists in .env.test but missing in .env`,
      );
      console.error(`   .env:      ${envLine || "(empty)"}`);
      console.error(`   .env.test: ${envTestLine}\n`);
      hasErrors = true;
    }
    // Check if variable names don't match
    else if (envVar && envTestVar && envVar !== envTestVar) {
      console.error(`❌ Line ${i + 1}: Variable names don't match`);
      console.error(`   .env:      '${envVar}' (${envLine})`);
      console.error(`   .env.test: '${envTestVar}' (${envTestLine})\n`);
      hasErrors = true;
    }
  }

  if (hasErrors) {
    console.error("💥 Environment files are not in sync!");
    console.error("\nTo fix this:");
    console.error("1. Make sure .env.test has the same variable names as .env");
    console.error("2. Variables should be on the same line numbers");
    console.error("3. Comments and empty lines should match between files");
    console.error(
      "4. Values can be different, but variable names must match\n",
    );
    process.exit(1);
  }

  console.log("✅ Environment files are in sync!");
}

// Run the check
try {
  checkEnvSync();
} catch (error) {
  console.error("❌ Error checking environment files:", error);
  process.exit(1);
}
