"use client";

import Link from "next/link";
import { Check, Coffee, Heart, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

export default function SuccessPage() {
  const [details, setDetails] = useState({ name: "Friend", amount: "" });
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setDetails({ name: params.get("name") || "Friend", amount: params.get("amount") || "" });
  }, []);

  return (
    <main className="success-page">
      <div className="ambient ambient-one" /><div className="ambient ambient-two" />
      <div className="confetti" aria-hidden="true">{Array.from({ length: 28 }, (_, index) => <i key={index} style={{ "--i": index } as React.CSSProperties} />)}</div>
      <section className="success-card">
        <div className="success-check"><Check size={37} /></div>
        <div className="success-cup"><span className="steam steam-one" /><span className="steam steam-two" /><Coffee size={46} /><span className="coffee-fill" /></div>
        <span className="eyebrow">Contribution received</span>
        <h1>Thank you,<br /><em>{details.name}.</em></h1>
        <p>{details.amount ? <>Your <strong>₹{details.amount}</strong> contribution just added real momentum to my next idea.</> : "Your contribution just added real momentum to my next idea."}</p>
        <div className="success-note"><Heart size={17} fill="currentColor" /> I&apos;m genuinely grateful you chose to back this journey.</div>
        <Link href="/" className="button button-primary">Back to the journey <Sparkles size={18} /></Link>
      </section>
    </main>
  );
}
