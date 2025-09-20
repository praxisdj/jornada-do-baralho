import prisma from "@/lib/prisma";
import { UserService } from "@/services/user.service";
import { faker } from "@faker-js/faker";
import { User, CreateUserSchema } from "@/types/user.type";
import { z } from "zod";
import { readFileSync } from "fs";
import { join } from "path";

export async function setupTests() {
  await clearDatabase();
  await seedCards();
}

async function seedCards() {
  try {
    const migrationPath = join(
      process.cwd(),
      "infra/prisma/migrations/20250920132705_insert_cards/migration.sql",
    );
    const migrationSQL = readFileSync(migrationPath, "utf-8");
    await prisma.$executeRawUnsafe(migrationSQL);
  } catch (error) {
    throw error;
  }
}

export async function clearDatabase() {
  try {
    if (!prisma.$queryRaw) {
      throw new Error(
        `⚠️ Prisma client not available. This is probably caused by mocks.`,
      );
    }

    const tableNames =
      (await prisma.$queryRaw`SELECT tablename FROM pg_tables WHERE schemaname = 'public';`) as {
        tablename: string;
      }[];

    const clearedTables = [];
    for (const { tablename } of tableNames) {
      if (tablename === "_prisma_migrations") continue;
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" CASCADE;`);
      clearedTables.push(tablename);
    }
  } catch (error) {
    console.error(`⚠️🚨 Error clearing database`);
    throw error;
  }
}

export async function createUser(
  userData: Partial<z.infer<typeof CreateUserSchema>> = {},
): Promise<User> {
  const userService = new UserService();

  const validatedData = CreateUserSchema.parse({
    name: userData.name || faker.person.fullName(),
    email: userData.email || faker.internet.email(),
    image: userData.image || faker.image.avatar(),
    ...userData,
  });

  return await userService.createUser(validatedData);
}

export async function createMultipleUsers(
  count: number,
  userData: Partial<z.infer<typeof CreateUserSchema>> = {},
): Promise<User[]> {
  const users: User[] = [];
  for (let i = 0; i < count; i++) {
    const user = await createUser(userData);
    users.push(user);
  }
  return users;
}

export function isValidISODate(dateString: string): boolean {
  if (!dateString) return false;

  const isoRegex: RegExp = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

  if (!isoRegex.test(dateString)) {
    return false;
  }

  const date = new Date(dateString);
  const dateTime = date.getTime();
  const isDateTimeNAN = isNaN(dateTime);

  if (isDateTimeNAN) {
    return false;
  }

  return true;
}
