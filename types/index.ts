export type Supporter = {
  name: string;
  amount: number;
  message: string;
  date: string;
  initial: string;
  anonymous?: boolean;
};

export type PaymentForm = {
  name: string;
  email: string;
  message: string;
  isAnonymous: boolean;
};

declare global {
  interface Window {
    Razorpay?: new (options: {
      key: string;
      amount: number;
      currency: string;
      name: string;
      description: string;
      image?: string;
      order_id: string;
      prefill?: { name?: string; email?: string };
      theme?: { color: string };
      modal?: { ondismiss?: () => void };
      handler: (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => void;
    }) => { open: () => void };
  }
}
