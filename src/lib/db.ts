import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

/** Allows PrismaClient init during builds before DATABASE_URL is set. */
const BUILD_PLACEHOLDER_URL =
  "postgresql://build:build@127.0.0.1:5432/build?schema=public";

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

function withConnectTimeout(url: string): string {
  if (/[?&]connect_timeout=/.test(url)) return url;
  return `${url}${url.includes("?") ? "&" : "?"}connect_timeout=30`;
}

function resolveDatabaseUrl(): string {
  const raw = process.env.DATABASE_URL?.trim();
  return withConnectTimeout(raw || BUILD_PLACEHOLDER_URL);
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: resolveDatabaseUrl(),
      },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/** Retry once on transient DB connectivity blips (P1001). */
export async function withDbRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    const code = (error as { code?: string })?.code;
    if (code !== "P1001") throw error;
    await new Promise((r) => setTimeout(r, 750));
    return fn();
  }
}

/** Skip DB when URL missing; swallow connect blips during build/preview. */
export async function withDbFallback<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  if (!isDatabaseConfigured()) return fallback;
  try {
    return await withDbRetry(fn);
  } catch (error) {
    console.error("[db] query failed, using fallback", error);
    return fallback;
  }
}
