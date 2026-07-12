import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { verifySchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const parsed = verifySchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid payment response." }, { status: 400 });

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) throw new Error("Razorpay is not configured.");

    const expected = createHmac("sha256", secret).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
    const valid = expected.length === razorpay_signature.length && timingSafeEqual(Buffer.from(expected), Buffer.from(razorpay_signature));
    if (!valid) return NextResponse.json({ error: "Payment signature could not be verified." }, { status: 400 });

    const payment = await getPrisma().payment.update({
      where: { razorpayOrderId: razorpay_order_id },
      data: { razorpayPaymentId: razorpay_payment_id, status: "PAID" },
    });

    return NextResponse.json({ ok: true, name: payment.isAnonymous ? "Anonymous Supporter" : payment.name || "Friend", amount: payment.amount });
  } catch (error) {
    console.error("Could not verify Razorpay payment", error);
    return NextResponse.json({ error: "We could not verify the payment. If you were charged, please contact Satyam with your payment ID." }, { status: 500 });
  }
}
