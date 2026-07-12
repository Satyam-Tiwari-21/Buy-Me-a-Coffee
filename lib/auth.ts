import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "satyam_admin";
const MAX_AGE = 60 * 60 * 12;

function secret() {
  const value = process.env.ADMIN_COOKIE_SECRET;
  if (!value || value.length < 32) throw new Error("ADMIN_COOKIE_SECRET must be at least 32 characters.");
  return value;
}

function signature(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createAdminToken() {
  const payload = Buffer.from(JSON.stringify({ role: "admin", exp: Date.now() + MAX_AGE * 1000 })).toString("base64url");
  return `${payload}.${signature(payload)}`;
}

export function verifyAdminToken(token?: string) {
  if (!token) return false;
  const [payload, receivedSignature] = token.split(".");
  if (!payload || !receivedSignature) return false;
  const expectedSignature = signature(payload);
  const received = Buffer.from(receivedSignature);
  const expected = Buffer.from(expectedSignature);
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as { role?: string; exp?: number };
    return data.role === "admin" && typeof data.exp === "number" && data.exp > Date.now();
  } catch {
    return false;
  }
}

export { COOKIE_NAME, MAX_AGE };
