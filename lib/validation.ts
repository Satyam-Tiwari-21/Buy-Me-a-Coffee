import { z } from "zod";

export const supportSchema = z.object({
  amount: z.number().int().min(10).max(100000),
  name: z.string().trim().max(80).optional().or(z.literal("")),
  email: z.string().trim().email().max(120).optional().or(z.literal("")),
  message: z.string().trim().max(500).optional().or(z.literal("")),
  isAnonymous: z.boolean().optional().default(false),
});

export const verifySchema = supportSchema.extend({
  razorpay_order_id: z.string().min(1).max(120),
  razorpay_payment_id: z.string().min(1).max(120),
  razorpay_signature: z.string().min(1).max(200),
});
