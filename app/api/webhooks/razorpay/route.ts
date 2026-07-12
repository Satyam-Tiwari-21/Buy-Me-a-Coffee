import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

type RazorpayWebhook = {
  event?: string;
  payload?: {
    payment?: { entity?: { id?: string; order_id?: string } };
    order?: { entity?: { id?: string } };
  };
};

/**
 * Reconciles payments if a visitor closes the checkout before the browser can
 * call the verification endpoint. Configure payment.captured and payment.failed
 * events in the Razorpay dashboard, using RAZORPAY_WEBHOOK_SECRET.
 */
export async function POST(request: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = request.headers.get("x-razorpay-signature");
  if (!secret || !signature) return NextResponse.json({ error: "Webhook is not configured." }, { status: 503 });

  try {
    const body = await request.text();
    const expected = createHmac("sha256", secret).update(body).digest("hex");
    const valid = expected.length === signature.length && timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
    if (!valid) return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });

    const webhook = JSON.parse(body) as RazorpayWebhook;
    const payment = webhook.payload?.payment?.entity;
    const orderId = payment?.order_id || webhook.payload?.order?.entity?.id;
    if (!orderId) return NextResponse.json({ ok: true, ignored: true });

    const prisma = getPrisma();
    if (webhook.event === "payment.captured" || webhook.event === "order.paid") {
      await prisma.payment.updateMany({
        where: { razorpayOrderId: orderId },
        data: { status: "PAID", ...(payment?.id ? { razorpayPaymentId: payment.id } : {}) },
      });
    } else if (webhook.event === "payment.failed") {
      await prisma.payment.updateMany({
        where: { razorpayOrderId: orderId, status: "CREATED" },
        data: { status: "FAILED", ...(payment?.id ? { razorpayPaymentId: payment.id } : {}) },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Razorpay webhook failed", error);
    return NextResponse.json({ error: "Unable to process webhook." }, { status: 500 });
  }
}
