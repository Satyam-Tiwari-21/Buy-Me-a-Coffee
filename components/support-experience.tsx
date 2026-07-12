"use client";

import { AnimatePresence, motion, useInView } from "framer-motion";
import {
  ArrowDownRight, ArrowRight, BadgeCheck, BrainCircuit, BriefcaseBusiness, Check,
  Code2, Coffee, Command, ExternalLink, Github, Heart, Laptop, Linkedin,
  Mail, Menu, Rocket, Send, ShieldCheck, Sparkles, WandSparkles, X, Zap,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { PaymentForm, Supporter } from "@/types";

const tiers = [
  { amount: 50, title: "Buy me a coffee", note: "A small boost for a big idea.", icon: Coffee, shade: "violet" },
  { amount: 100, title: "Fuel a coding session", note: "A focused evening, powered by you.", icon: Code2, shade: "blue", popular: true },
  { amount: 250, title: "Support a project", note: "Help turn one experiment into a tool.", icon: Sparkles, shade: "cyan" },
  { amount: 500, title: "Help build my startup", note: "A meaningful vote for the long game.", icon: Rocket, shade: "pink" },
];

const defaultSupporters: Supporter[] = [
  { name: "Ananya", amount: 250, message: "Keep shipping useful things. Rooting for you!", date: "2 days ago", initial: "A" },
  { name: "Rohit M.", amount: 100, message: "The automation ideas are seriously impressive.", date: "5 days ago", initial: "R" },
  { name: "Anonymous Supporter", amount: 500, message: "One builder backing another. Go for it.", date: "1 week ago", initial: "♥", anonymous: true },
];

const fadeUp = { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0 } };
const navItems = ["Story", "Mission", "Support", "Wall of love"];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

function ScrollReveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return <motion.div ref={ref} className={className} variants={fadeUp} initial="hidden" animate={inView ? "visible" : "hidden"} transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>;
}

function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const duration = 1300;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setCurrent(Math.floor((1 - Math.pow(1 - progress, 3)) * value));
      if (progress < 1) requestAnimationFrame(tick);
    };
    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [value]);
  return <>{current.toLocaleString("en-IN")}{suffix}</>;
}

export function SupportExperience() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [amount, setAmount] = useState(100);
  const [customAmount, setCustomAmount] = useState("");
  const [status, setStatus] = useState("");
  const [checkoutReady, setCheckoutReady] = useState(false);
  const [supporters, setSupporters] = useState(defaultSupporters);
  const [form, setForm] = useState<PaymentForm>({ name: "", email: "", message: "", isAnonymous: false });
  const selectedLabel = useMemo(() => tiers.find((tier) => tier.amount === amount)?.title ?? "Custom contribution", [amount]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setCheckoutReady(true);
    script.onerror = () => setStatus("Secure checkout could not load. Please check your connection and retry.");
    document.body.appendChild(script);
    fetch("/api/supporters").then((res) => res.ok ? res.json() : []).then((items: Supporter[]) => { if (items.length) setSupporters(items); }).catch(() => undefined);
    return () => { document.body.removeChild(script); };
  }, []);

  function openSupport(nextAmount = amount) {
    setAmount(nextAmount);
    setCustomAmount("");
    setStatus("");
    setModalOpen(true);
  }

  async function startPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!checkoutReady || !window.Razorpay) {
      setStatus("Secure checkout is still loading. Please try again in a moment.");
      return;
    }
    setStatus("Creating your secure payment…");
    const payload = { amount, ...form };
    try {
      const response = await fetch("/api/payments/order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const order = await response.json() as { error?: string; orderId?: string; key?: string; amount?: number };
      if (!response.ok || !order.orderId || !order.key || !order.amount) throw new Error(order.error || "Unable to begin checkout.");
      setStatus("");
      const razorpay = new window.Razorpay({
        key: order.key,
        amount: order.amount,
        currency: "INR",
        name: "Satyam Tiwari",
        description: selectedLabel,
        order_id: order.orderId,
        prefill: { name: form.isAnonymous ? "" : form.name, email: form.email },
        theme: { color: "#7c5cff" },
        modal: { ondismiss: () => setStatus("") },
        handler: (payment) => { void verifyPayment({ ...payload, ...payment }); },
      });
      razorpay.open();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to start checkout.");
    }
  }

  async function verifyPayment(payload: Record<string, unknown>) {
    setStatus("Confirming your contribution…");
    try {
      const response = await fetch("/api/payments/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json() as { error?: string; name?: string; amount?: number };
      if (!response.ok) throw new Error(result.error || "Payment verification failed.");
      const params = new URLSearchParams({ name: result.name || "Friend", amount: String(result.amount || amount) });
      window.location.assign(`/success?${params.toString()}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "We couldn't confirm the contribution.");
    }
  }

  function chooseCustom(value: string) {
    setCustomAmount(value);
    const number = Number(value);
    if (Number.isInteger(number) && number >= 10 && number <= 100000) setAmount(number);
  }

  return (
    <main>
      <div className="ambient ambient-one" /><div className="ambient ambient-two" /><div className="noise" />
      <nav className="nav shell" aria-label="Primary navigation">
        <a href="#top" className="brand" aria-label="Satyam Tiwari home"><span className="brand-mark">ST</span><span>Satyam <i>Tiwari</i></span></a>
        <div className={`nav-links ${menuOpen ? "open" : ""}`}>{navItems.map((item) => <a href={`#${item.toLowerCase().replaceAll(" ", "-")}`} key={item} onClick={() => setMenuOpen(false)}>{item}</a>)}</div>
        <button className="nav-cta" onClick={() => openSupport()}><Heart size={15} fill="currentColor" /> Support the journey</button>
        <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">{menuOpen ? <X /> : <Menu />}</button>
      </nav>

      <section id="top" className="hero shell">
        <div className="hero-copy">
          <motion.div className="eyebrow hero-eyebrow" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}><span className="status-dot" /> Building in public, one idea at a time</motion.div>
          <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75, delay: 0.08 }}>
            Let&apos;s build the<br /><em>next idea</em> together.
          </motion.h1>
          <motion.p className="hero-lede" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.16 }}>
            I&apos;m Satyam, an AI-focused developer turning curious experiments into useful software — and working toward a company of my own.
          </motion.p>
          <motion.div className="hero-actions" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.24 }}>
            <button className="button button-primary" onClick={() => openSupport()}><Coffee size={19} /> Support the developer <ArrowRight size={18} /></button>
            <a className="button button-quiet" href="#story">See what I&apos;m building <ArrowDownRight size={18} /></a>
          </motion.div>
          <motion.div className="trust-row" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}><ShieldCheck size={17} /> Safe, secure payments via Razorpay <span /> <Coffee size={16} /> Every amount has an impact</motion.div>
        </div>
        <motion.div className="hero-art" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}>
          <div className="orbit orbit-a" /><div className="orbit orbit-b" />
          <motion.div className="mini-card code-card" animate={{ y: [0, -9, 0], rotate: [-2, 1, -2] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}><span className="card-label"><Code2 size={13} /> working on</span><code><span>def</span> make_impact():<br />&nbsp;&nbsp;return <b>"real"</b></code></motion.div>
          <motion.div className="mini-card ai-card" animate={{ y: [0, 11, 0] }} transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut" }}><BrainCircuit size={24} /><div><strong>AI + intent</strong><small>always learning</small></div></motion.div>
          <div className="portrait-shell"><div className="portrait-glow" /><div className="portrait"><span className="portrait-initials">ST</span><span className="portrait-role">Python · AI · Automation</span></div></div>
          <motion.div className="coffee-widget" animate={{ rotate: [0, -3, 2, 0], y: [0, -6, 0] }} transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}><span className="steam steam-one" /><span className="steam steam-two" /><Coffee size={41} /><strong>Powered by<br />possibility</strong></motion.div>
          <motion.div className="spark spark-a" animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.35, 1, 0.35] }} transition={{ duration: 2.5, repeat: Infinity }}><Sparkles size={21} /></motion.div>
          <motion.div className="spark spark-b" animate={{ y: [0, -9, 0], opacity: [0.3, 1, 0.3] }} transition={{ duration: 3.1, repeat: Infinity }}><Command size={18} /></motion.div>
        </motion.div>
      </section>

      <section className="metrics-band shell" aria-label="Impact statistics">
        {[{ value: 24, suffix: "+", label: "kind supporters" }, { value: 7400, suffix: "+", label: "in project fuel", currency: true }, { value: 9, suffix: "", label: "projects shipped" }, { value: 128, suffix: "", label: "late-night coffees" }].map((stat) => <div className="metric" key={stat.label}><strong>{stat.currency ? "₹" : ""}<CountUp value={stat.value} suffix={stat.suffix} /></strong><span>{stat.label}</span></div>)}
      </section>

      <section id="story" className="story section shell">
        <ScrollReveal className="section-intro"><span className="eyebrow">A little about me</span><h2>Curiosity is my<br /><em>favorite framework.</em></h2></ScrollReveal>
        <div className="story-grid">
          <ScrollReveal className="story-copy" delay={0.08}><p>I&apos;m a final-year Computer Science student specializing in Artificial Intelligence. I love the moment a stubborn problem becomes a clean, small solution.</p><p>Right now, I&apos;m exploring Python, AI, and automation — building in public, sharing what I learn, and steadily working toward an AI company that solves real problems.</p><a className="inline-link" href="#support">Come along for the ride <ArrowRight size={16} /></a></ScrollReveal>
          <ScrollReveal className="skill-grid" delay={0.14}>
            {[{ icon: Code2, name: "Python", detail: "Make it useful" }, { icon: BrainCircuit, name: "AI systems", detail: "Make it smart" }, { icon: Zap, name: "Automation", detail: "Make it flow" }, { icon: Heart, name: "Open source", detail: "Make it shared" }, { icon: BriefcaseBusiness, name: "Problem-solving", detail: "Make it matter" }, { icon: Rocket, name: "The long game", detail: "Make it real" }].map(({ icon: Icon, name, detail }, index) => <motion.div className="skill-card" key={name} whileHover={{ y: -6, scale: 1.02 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}><span className={`skill-icon skill-${index}`}><Icon size={20} /></span><strong>{name}</strong><small>{detail}</small></motion.div>)}
          </ScrollReveal>
        </div>
      </section>

      <section id="mission" className="mission section shell">
        <ScrollReveal className="mission-card"><div className="mission-orb" /><div className="mission-content"><span className="eyebrow">This is bigger than coffee</span><h2>You&apos;re not making a donation.<br /><em>You&apos;re backing a dream.</em></h2><p>Every contribution gives a young builder a little more room to learn, experiment, ship, and share the results with the world.</p><div className="mission-list">{["Build thoughtful AI projects", "Use better development tools", "Learn the right technologies", "Move closer to a software startup"].map((item) => <span key={item}><span><Check size={14} /></span>{item}</span>)}</div></div><div className="mission-visual"><div className="road-line" /><div className="road-node node-one"><Laptop size={20} /><small>Now</small></div><div className="road-node node-two"><WandSparkles size={20} /><small>Building</small></div><div className="road-node node-three"><Rocket size={20} /><small>Future</small></div></div></ScrollReveal>
      </section>

      <section id="support" className="support section shell">
        <ScrollReveal className="support-header"><div><span className="eyebrow">Make today count</span><h2>Choose your kind of<br /><em>encouragement.</em></h2></div><p>Small or substantial — every contribution keeps the momentum moving.</p></ScrollReveal>
        <div className="tier-grid">{tiers.map((tier, index) => { const Icon = tier.icon; return <ScrollReveal key={tier.amount} delay={index * 0.06}><motion.button className={`tier-card ${tier.shade}`} onClick={() => openSupport(tier.amount)} whileHover={{ y: -9 }} whileTap={{ scale: 0.98 }}><div className="tier-top">{tier.popular && <span className="popular">most loved</span>}<span className="tier-icon"><Icon size={22} /></span></div><strong>{formatCurrency(tier.amount)}</strong><h3>{tier.title}</h3><p>{tier.note}</p><span className="tier-action">Choose this <ArrowRight size={16} /></span></motion.button></ScrollReveal>; })}</div>
        <ScrollReveal className="custom-support" delay={0.12}><div><span className="custom-icon"><Heart size={20} fill="currentColor" /></span><div><strong>Have another amount in mind?</strong><p>Every rupee is a vote of confidence.</p></div></div><button className="button button-secondary" onClick={() => openSupport()}>Set a custom amount <ArrowRight size={17} /></button></ScrollReveal>
      </section>

      <section id="wall-of-love" className="love section shell">
        <ScrollReveal className="love-heading"><span className="eyebrow">The wall of love</span><h2>Good people make<br /><em>good things possible.</em></h2></ScrollReveal>
        <div className="supporter-grid">{supporters.slice(0, 3).map((supporter, index) => <ScrollReveal delay={index * 0.08} key={`${supporter.name}-${index}`}><article className="supporter-card"><div className={`avatar ${supporter.anonymous ? "anonymous" : ""}`}>{supporter.initial}</div><div className="supporter-meta"><strong>{supporter.name}</strong><span>{supporter.date}</span></div><b>{formatCurrency(supporter.amount)}</b><p>“{supporter.message}”</p><Heart className="heart-mark" size={17} fill="currentColor" /></article></ScrollReveal>)}</div>
      </section>

      <section className="final-cta shell"><ScrollReveal className="final-cta-card"><div><span className="eyebrow">One last thing</span><h2>Thanks for believing<br />in <em>possibility.</em></h2><p>Whether you contribute, share the page, or simply cheer from the sidelines — it all means more than you know.</p><button className="button button-primary" onClick={() => openSupport()}><Coffee size={18} /> Fuel the next idea <ArrowRight size={18} /></button></div><div className="cta-art"><div className="big-cup"><span className="steam steam-one" /><span className="steam steam-two" /><Coffee size={70} /></div><span className="orbit-dot dot-a" /><span className="orbit-dot dot-b" /><Sparkles className="cta-spark" size={31} /></div></ScrollReveal></section>

      <footer className="footer shell"><div className="brand"><span className="brand-mark">ST</span><span>Satyam <i>Tiwari</i></span></div><p>Built with <Heart size={14} fill="currentColor" /> and a lot of curiosity.</p><div className="social-links"><a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub"><Github size={18} /></a><a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin size={18} /></a><a href="mailto:hello@example.com" aria-label="Email"><Mail size={18} /></a></div></footer>

      <AnimatePresence>{modalOpen && <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={() => setModalOpen(false)}><motion.section className="support-modal" initial={{ opacity: 0, y: 28, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.98 }} transition={{ type: "spring", stiffness: 330, damping: 28 }} onMouseDown={(event) => event.stopPropagation()} aria-modal="true" role="dialog" aria-labelledby="support-title"><button className="close-modal" onClick={() => setModalOpen(false)} aria-label="Close support form"><X size={19} /></button><div className="modal-heading"><span className="modal-heart"><Heart size={18} fill="currentColor" /></span><span className="eyebrow">You&apos;re awesome</span><h2 id="support-title">Make a little<br /><em>momentum.</em></h2><p>Your contribution is securely processed through Razorpay.</p></div><div className="amount-picker">{tiers.map((tier) => <button key={tier.amount} type="button" className={amount === tier.amount && !customAmount ? "selected" : ""} onClick={() => { setAmount(tier.amount); setCustomAmount(""); }}>₹{tier.amount}</button>)}<label className={customAmount ? "selected" : ""}>₹<input aria-label="Custom amount" value={customAmount} onChange={(event) => chooseCustom(event.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="Custom" /></label></div><form onSubmit={startPayment}><div className="form-row"><label>Your name <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="What should I call you?" maxLength={80} /></label><label>Email <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" maxLength={120} /></label></div><label>Leave a note <textarea value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} placeholder="A few kind words go a long way…" maxLength={500} /></label><label className="check-label"><input type="checkbox" checked={form.isAnonymous} onChange={(event) => setForm({ ...form, isAnonymous: event.target.checked })} /><span><Check size={12} /></span> Keep my name private</label>{status && <p className="form-status">{status}</p>}<button className="button button-primary checkout-button" type="submit" disabled={amount < 10 || amount > 100000}><ShieldCheck size={18} /> Continue securely · {formatCurrency(amount)}</button></form><small className="payment-note"><BadgeCheck size={14} /> Payments are verified before they appear on the wall.</small></motion.section></motion.div>}</AnimatePresence>
    </main>
  );
}
