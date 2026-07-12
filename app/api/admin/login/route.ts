import { NextResponse } from "next/server";
import { COOKIE_NAME, createAdminToken, MAX_AGE } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { password?: string };
    if (!process.env.ADMIN_PASSWORD || body.password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
    }
    const response = NextResponse.json({ ok: true });
    response.cookies.set({ name: COOKIE_NAME, value: createAdminToken(), httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: MAX_AGE });
    return response;
  } catch {
    return NextResponse.json({ error: "Unable to sign in." }, { status: 400 });
  }
}
