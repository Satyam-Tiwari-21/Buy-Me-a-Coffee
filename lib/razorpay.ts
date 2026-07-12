import Razorpay from "razorpay";

export function getRazorpay() {
  const keyId = process.env.rzp_test_TCYYNdffybZopR;
  const keySecret = process.env.hKm9tuCTRORVkm7WWMR3KSSg;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}
