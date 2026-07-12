import Razorpay from "razorpay";

export function getRazorpay() {
  const keyId = process.env.rzp_test_TCYFkyxtpjVw19;
  const keySecret = process.env.LDuIXL2JdPWSOZWy8zFO3tyf;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}
