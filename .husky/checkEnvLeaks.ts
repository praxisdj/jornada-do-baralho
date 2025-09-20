#!/usr/bin/env bun

import { readFileSync, existsSync } from "fs";

/**
 * Script to check if .env.test contains any API keys, tokens, or sensitive data
 * Ensures that test environment files don't accidentally leak real credentials
 * Blame AI for this script 🤖
 */

const ENV_TEST_FILE = ".env.test";

// Patterns that indicate potentially leaked credentials
const SENSITIVE_PATTERNS = [
  // General API Keys and Tokens
  {
    pattern: /^[A-Z_]*(?:API_?KEY|TOKEN|SECRET|PASSWORD)[A-Z_]*=.+$/i,
    name: "API Key/Token/Secret",
  },

  // Specific service patterns
  { pattern: /^SLACK_OAUTH_TOKEN=xoxb-.+$/i, name: "Slack Bot Token" },
  { pattern: /^SLACK_OAUTH_TOKEN=xoxa-.+$/i, name: "Slack App Token" },
  { pattern: /^SLACK_OAUTH_TOKEN=xoxp-.+$/i, name: "Slack User Token" },
  { pattern: /^STRIPE_.*=sk_.+$/i, name: "Stripe Secret Key" },
  { pattern: /^STRIPE_.*=pk_.+$/i, name: "Stripe Public Key" },
  { pattern: /^AWS_.*=AKIA.+$/i, name: "AWS Access Key" },
  { pattern: /^GITHUB_.*=ghp_.+$/i, name: "GitHub Personal Access Token" },

  // Google OAuth
  {
    pattern: /^GOOGLE_CLIENT_ID=(?!test|example|your-client-id).{24,}$/i,
    name: "Google Client ID",
  },
  {
    pattern:
      /^GOOGLE_CLIENT_SECRET=(?!test|example|your-client-secret).{24,}$/i,
    name: "Google Client Secret",
  },

  // NextAuth
  {
    pattern:
      /^NEXTAUTH_SECRET=(?!secret$|test$|password$|development$).{32,}$/i,
    name: "NextAuth Secret",
  },
  {
    pattern:
      /^NEXTAUTH_URL=(?!http:\/\/localhost)(?!http:\/\/127\.0\.0\.1)https?:\/\/.+$/i,
    name: "NextAuth Production URL",
  },

  // API Keys
  { pattern: /^OPENAI_API_KEY=sk-.+$/i, name: "OpenAI API Key" },
  {
    pattern: /^IMAGE_UPLOAD_API_KEY=(?!test|example|your-api-key).{10,}$/i,
    name: "Image Upload API Key",
  },
  {
    pattern:
      /^IMAGE_UPLOAD_API_KEY_CLOUDINARY=(?!test|example|your-api-key).{15,}$/i,
    name: "Cloudinary API Key",
  },
  {
    pattern:
      /^IMAGE_UPLOAD_API_SECRET_CLOUDINARY=(?!test|example|your-api-secret).{20,}$/i,
    name: "Cloudinary API Secret",
  },
  {
    pattern: /^ADMIN_API_KEY=(?!test|example|admin|your-api-key).{10,}$/i,
    name: "Admin API Key",
  },
  {
    pattern: /^NEXT_PUBLIC_FAVO_API_KEY=(?!test|example|your-api-key).{10,}$/i,
    name: "Favo API Key",
  },

  // Email credentials
  {
    pattern: /^EMAIL_USER=(?!test|example|user)[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/i,
    name: "Email User",
  },
  {
    pattern: /^EMAIL_PASS=(?!test|password|secret).{8,}$/i,
    name: "Email Password",
  },

  // Firebase
  {
    pattern:
      /^NEXT_PUBLIC_FIREBASE_API_KEY=(?!test|example|your-api-key)AIza.+$/i,
    name: "Firebase API Key",
  },
  {
    pattern: /^FIREBASE_SERVICE_ACCOUNT_BASE64=(?!test|example).{100,}$/i,
    name: "Firebase Service Account",
  },

  // New Relic
  {
    pattern: /^NEW_RELIC_LICENSE_KEY=(?!test|example).{40,}$/i,
    name: "New Relic License Key",
  },

  // Database credentials (production patterns)
  {
    pattern: /^POSTGRES_PASSWORD=(?!password$|test$|secret$).{8,}$/i,
    name: "Production Postgres Password",
  },
  {
    pattern:
      /^DATABASE_URL=postgres:\/\/(?!.*localhost)(?!.*127\.0\.0\.1)(?!.*\$\{).+$/i,
    name: "Production Database URL",
  },
  {
    pattern:
      /^REDIS_URL=redis:\/\/(?!.*localhost)(?!.*127\.0\.0\.1)(?!.*\$\{).+$/i,
    name: "Production Redis URL",
  },
  {
    pattern:
      /^REDIS_URL_DOCKER=redis:\/\/(?!.*localhost)(?!.*127\.0\.0\.1)(?!.*redis:6379).+$/i,
    name: "Production Redis Docker URL",
  },
];

// Safe values that are allowed even if they match patterns
const SAFE_VALUES = [
  "",
  "test",
  "secret",
  "password",
  "development",
  "testing",
  "localhost",
  "127.0.0.1",
  "user",
  "admin",
  "debug",
  "info",
  "warn",
  "error",
  "true",
  "false",
  "your-api-key-here",
  "your-token-here",
  "your-secret-here",
  "your-client-id",
  "your-client-secret",
  "embed_roadmap_app_db",
  "embed_roadmap_app_db_test",
  "embed_roadmap-db",
  "embed_roadmap-redis",
  "embed_roadmap-dev",
  "http://localhost:3000",
  "http://localhost:3005",
  "linux/amd64",
  "linux/arm64",
  "amd64",
  "arm64",
  "5050",
  "5051",
  "6379",
];

// Safe patterns for test values
const SAFE_PATTERNS = [
  /^test[_-]?.*/i,
  /^fake[_-]?.*/i,
  /^mock[_-]?.*/i,
  /^dummy[_-]?.*/i,
  /^placeholder[_-]?.*/i,
  /^example[_-]?.*/i,
  /^localhost/i,
  /^127\.0\.0\.1/i,
  /^http:\/\/localhost/i,
  /^http:\/\/127\.0\.0\.1/i,
  // Environment variable interpolation patterns
  /\$\{[^}]+\}/, // Contains ${VARIABLE} syntax
  // Database URLs with localhost or variable interpolation
  /^postgres:\/\/.*localhost/i,
  /^postgres:\/\/.*127\.0\.0\.1/i,
  /^postgres:\/\/.*\$\{/i, // Contains variables
  /^redis:\/\/.*localhost/i,
  /^redis:\/\/.*127\.0\.0\.1/i,
  /^redis:\/\/.*\$\{/i, // Contains variables
  /embed_roadmap/i,
  /^user$/i,
  /^admin$/i,
  /^development$/i,
  /^testing$/i,
  /^debug$/i,
  /^info$/i,
  /^warn$/i,
  /^error$/i,
  /^true$/i,
  /^false$/i,
  /^[0-9]+$/, // Pure numbers (ports, etc.)
  /^linux\//i, // Docker platform
  // Common test/dev values
  /your-.*-here/i,
  /example\.com/i,
  /test\.com/i,
  /localhost:\d+/i,
];

function isSafeValue(value: string): boolean {
  // Check if it's in the safe values list
  if (SAFE_VALUES.includes(value.toLowerCase())) {
    return true;
  }

  // Check if it matches safe patterns
  return SAFE_PATTERNS.some((pattern) => pattern.test(value));
}

function checkEnvTestForLeaks(): void {
  if (!existsSync(ENV_TEST_FILE)) {
    console.error(`❌ File ${ENV_TEST_FILE} does not exist`);
    process.exit(1);
  }

  const content = readFileSync(ENV_TEST_FILE, "utf-8");
  const lines = content.split("\n");

  let hasLeaks = false;
  const findings: Array<{
    line: number;
    variable: string;
    value: string;
    type: string;
  }> = [];

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    // Skip empty lines and comments
    if (!trimmedLine || trimmedLine.startsWith("#")) {
      return;
    }

    // Parse KEY=VALUE format
    const match = trimmedLine.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (!match) {
      return;
    }

    const [, variable, value] = match;

    // Skip if value is empty or safe
    if (!value || isSafeValue(value)) {
      return;
    }

    // Check against sensitive patterns
    for (const { pattern, name } of SENSITIVE_PATTERNS) {
      if (pattern.test(trimmedLine)) {
        findings.push({
          line: index + 1,
          variable,
          value,
          type: name,
        });
        hasLeaks = true;
        break;
      }
    }
  });

  if (hasLeaks) {
    console.error("🚨 POTENTIAL CREDENTIAL LEAKS DETECTED!\n");

    findings.forEach(({ line, variable, value, type }) => {
      console.error(`❌ Line ${line}: ${type}`);
      console.error(`   Variable: ${variable}`);
      console.error(
        `   Value: ${value.substring(0, 20)}${value.length > 20 ? "..." : ""}`,
      );
      console.error("");
    });

    console.error("💥 .env.test contains potentially sensitive data!");
    console.error("\n🔧 To fix this:");
    console.error("1. Replace real API keys/tokens with placeholder values");
    console.error("2. Use empty values or test-specific credentials");
    console.error("3. Ensure no production secrets are in test files");
    console.error("\n📋 Safe examples:");
    console.error("   OPENAI_API_KEY=");
    console.error("   GOOGLE_CLIENT_SECRET=test-secret");
    console.error("   NEXTAUTH_SECRET=test-secret");
    console.error("   EMAIL_PASS=test-password");
    console.error("   SLACK_OAUTH_TOKEN=");
    console.error("   FIREBASE_SERVICE_ACCOUNT_BASE64=");
    console.error(
      "   DATABASE_URL=postgres://user:password@localhost:5432/test_db",
    );
    console.error("   NEXTAUTH_URL=http://localhost:3000\n");

    process.exit(1);
  }

  console.log("✅ No credential leaks detected in .env.test!");
}

// Run the check
try {
  checkEnvTestForLeaks();
} catch (error) {
  console.error("❌ Error checking .env.test for leaks:", error);
  process.exit(1);
}
