import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { COOKIE_NAME, verifyAdminToken } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const token = (await cookies()).get(COOKIE_NAME)?.value;
    if (!verifyAdminToken(token)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const prisma = getPrisma();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const month = new Date(now.getFullYear(), now.getMonth(), 1);
    const paid = { status: "PAID" as const };
    const [total, todayTotal, monthTotal, recent, supporters] = await Promise.all([
      prisma.payment.aggregate({ where: paid, _sum: { amount: true }, _count: true }),
      prisma.payment.aggregate({ where: { ...paid, createdAt: { gte: today } }, _sum: { amount: true }, _count: true }),
      prisma.payment.aggregate({ where: { ...paid, createdAt: { gte: month } }, _sum: { amount: true } }),
      prisma.payment.findMany({ orderBy: { createdAt: "desc" }, take: 40, select: { id: true, name: true, email: true, amount: true, status: true, createdAt: true, isAnonymous: true, razorpayPaymentId: true } }),
      prisma.payment.groupBy({ by: ["email", "name"], where: paid, _sum: { amount: true }, _count: true, orderBy: { _sum: { amount: "desc" } }, take: 5 }),
    ]);
    return NextResponse.json({
      totals: { raised: total._sum.amount || 0, count: total._count, today: todayTotal._sum.amount || 0, todayCount: todayTotal._count, month: monthTotal._sum.amount || 0 },
      recent,
      supporters: supporters.map((supporter) => ({ name: supporter.name || "Anonymous Supporter", amount: supporter._sum.amount || 0, count: supporter._count })),
    });
  } catch (error) {
    console.error("Admin dashboard failed", error);
    return NextResponse.json({ error: "Could not load dashboard data." }, { status: 500 });
  }
}
