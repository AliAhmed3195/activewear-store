import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

const COOKIE = "vifactive_customer";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export type CustomerSession = {
  id: string;
  email: string;
  name: string;
};

function secret() {
  return process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "vifactive-dev-secret";
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function encodeCustomerSession(session: CustomerSession): string {
  const payload = Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function decodeCustomerSession(token: string | undefined | null): CustomerSession | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = sign(payload);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as CustomerSession;
    if (!data?.id || !data?.email || !data?.name) return null;
    return data;
  } catch {
    return null;
  }
}

export async function getCustomerSession(): Promise<CustomerSession | null> {
  const jar = await cookies();
  return decodeCustomerSession(jar.get(COOKIE)?.value);
}

export async function setCustomerSessionCookie(session: CustomerSession) {
  const jar = await cookies();
  jar.set(COOKIE, encodeCustomerSession(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearCustomerSessionCookie() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getCustomerFromSession() {
  const session = await getCustomerSession();
  if (!session) return null;
  return prisma.customer.findUnique({ where: { id: session.id } });
}
