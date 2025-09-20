import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prisma: PrismaClient = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export interface DatabaseStatus {
  timestamp: string;
  online: boolean;
  connections: number;
  error?: string;
}

export async function getStatus(): Promise<DatabaseStatus> {
  try {
    await prisma.$connect();
    const result = await prisma.$queryRaw<
      { count: number }[]
    >`SELECT count(*) FROM pg_stat_activity WHERE datname = current_database()`;
    const connections = result[0].count;
    return {
      timestamp: new Date().toISOString(),
      online: true,
      connections,
    };
  } catch (error) {
    return {
      timestamp: new Date().toISOString(),
      online: false,
      connections: 0,
      error: error instanceof Error ? error.message : JSON.stringify(error),
    };
  }
}

export default prisma;
