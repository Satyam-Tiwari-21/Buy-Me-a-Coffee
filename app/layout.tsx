import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Satyam Tiwari — Build the next idea with me",
  description: "Support Satyam's journey building practical AI products, open-source tools, and a future software company.",
  keywords: ["Satyam Tiwari", "AI", "Python developer", "support", "Razorpay", "open source"],
  openGraph: {
    title: "Support Satyam's AI journey",
    description: "Every contribution powers projects, learning, and the next big idea.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#080b18", colorScheme: "dark" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
