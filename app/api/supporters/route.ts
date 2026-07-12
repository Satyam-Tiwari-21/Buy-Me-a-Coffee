import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET() {
  try {
    const payments = await getPrisma().payment.findMany({
      where: { status: "PAID" },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: { name: true, amount: true, message: true, createdAt: true, isAnonymous: true },
    });
    return NextResponse.json(payments.map((payment) => ({
      name: payment.isAnonymous ? "Anonymous Supporter" : payment.name || "A kind supporter",
      amount: payment.amount,
      message: payment.message || "Cheering you on!",
      date: payment.createdAt.toISOString(),
      initial: payment.isAnonymous ? "♥" : (payment.name || "S").charAt(0).toUpperCase(),
      anonymous: payment.isAnonymous,
    })));
  } catch {
    return NextResponse.json([]);
  }
}
