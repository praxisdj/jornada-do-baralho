/* eslint-disable @typescript-eslint/no-unused-vars */

import { readdir, stat } from "fs/promises";
import { join } from "path";

/**
 * By definition, this project only allows specific .env files.
 * If this changes, update the allowed files below and also the .husky scripts.
 */

const ALLOWED_ENV_FILES = [".env", ".env.test"];
const SEARCH_DIRECTORIES = [".", "src", "infra", "scripts"];

async function findEnvFiles(directory: string): Promise<string[]> {
  const envFiles: string[] = [];

  try {
    const items = await readdir(directory);

    for (const item of items) {
      const fullPath = join(directory, item);

      try {
        const stats = await stat(fullPath);

        if (stats.isFile() && item.startsWith(".env")) {
          envFiles.push(fullPath);
        }
      } catch (error) {
        // Skip files we can't access
        continue;
      }
    }
  } catch (error) {
    // Directory doesn't exist or can't be read, skip it
  }

  return envFiles;
}

async function checkUnauthorizedEnvFiles(): Promise<void> {
  const allEnvFiles: string[] = [];

  // Search in specified directories
  for (const dir of SEARCH_DIRECTORIES) {
    const envFiles = await findEnvFiles(dir);
    allEnvFiles.push(...envFiles);
  }

  // Normalize paths and filter
  const normalizedAllowed = ALLOWED_ENV_FILES.map((file) => `./${file}`);
  const unauthorizedFiles = allEnvFiles.filter((file) => {
    const normalizedFile = file.startsWith("./") ? file : `./${file}`;
    return !normalizedAllowed.includes(normalizedFile);
  });

  if (unauthorizedFiles.length > 0) {
    console.error("🚨 UNAUTHORIZED .ENV FILES DETECTED!\n");

    unauthorizedFiles.forEach((file) => {
      console.error(`❌ Found: ${file}`);
    });

    console.error("\n💥 Only .env and .env.test files are allowed!");
    console.error("\n🔧 To fix this:");
    console.error("1. Remove unauthorized .env files");
    console.error("2. Move sensitive data to .env (for development)");
    console.error("3. Move test data to .env.test (for testing)");
    console.error(
      "4. Use environment-specific deployment configs instead of additional .env files",
    );

    console.error("\n📋 Allowed files:");
    ALLOWED_ENV_FILES.forEach((file) => {
      console.error(`   ✅ ${file}`);
    });

    console.error("\n🚫 Common unauthorized files to avoid:");
    console.error("   ❌ .env.local");
    console.error("   ❌ .env.development");
    console.error("   ❌ .env.production");
    console.error("   ❌ .env.staging");
    console.error("   ❌ .env.example (use README.md instead)\n");

    process.exit(1);
  }

  console.log("✅ No unauthorized .env files found!");
}

// Run the check
try {
  await checkUnauthorizedEnvFiles();
} catch (error) {
  console.error("❌ Error checking for unauthorized .env files:", error);
  process.exit(1);
}
