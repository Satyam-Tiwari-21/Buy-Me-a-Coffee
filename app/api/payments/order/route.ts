import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getRazorpay } from "@/lib/razorpay";
import { supportSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const parsed = supportSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Please check the support details." }, { status: 400 });

    const support = parsed.data;
    const order = await getRazorpay().orders.create({
      amount: support.amount * 100,
      currency: "INR",
      receipt: `support_${Date.now()}`,
      notes: { source: "satyam-support" },
    });

    await getPrisma().payment.create({
      data: {
        amount: support.amount,
        name: support.isAnonymous ? null : support.name || null,
        email: support.email || null,
        message: support.message || null,
        isAnonymous: support.isAnonymous,
        razorpayOrderId: order.id,
      },
    });

    return NextResponse.json({ orderId: order.id, amount: order.amount, key: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    console.error("Could not create Razorpay order", error);
    const message = error instanceof Error ? error.message : "Unable to start checkout.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
