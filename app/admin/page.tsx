"use client";

import { Download, LogOut, Search, ShieldCheck, TrendingUp, UsersRound, WalletCards } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

type Payment = { id: string; name: string | null; email: string | null; amount: number; status: "CREATED" | "PAID" | "FAILED"; createdAt: string; isAnonymous: boolean; razorpayPaymentId: string | null };
type Dashboard = { totals: { raised: number; count: number; today: number; todayCount: number; month: number }; recent: Payment[]; supporters: { name: string; amount: number; count: number }[] };

const money = (amount: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [data, setData] = useState<Dashboard | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"ALL" | Payment["status"]>("ALL");

  const load = async () => {
    const response = await fetch("/api/admin/payments");
    if (response.ok) setData(await response.json() as Dashboard);
  };
  useEffect(() => { void load(); }, []);

  async function login(event: FormEvent) {
    event.preventDefault(); setError("");
    const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    if (!response.ok) { const result = await response.json() as { error?: string }; setError(result.error || "Unable to sign in."); return; }
    setPassword(""); await load();
  }
  async function logout() { await fetch("/api/admin/logout", { method: "POST" }); setData(null); }
  const rows = useMemo(() => data?.recent.filter((payment) => (filter === "ALL" || payment.status === filter) && `${payment.name} ${payment.email} ${payment.razorpayPaymentId}`.toLowerCase().includes(query.toLowerCase())) || [], [data, query, filter]);
  function exportCsv() {
    const csv = ["Name,Email,Amount,Status,Date,Payment ID", ...rows.map((row) => [row.isAnonymous ? "Anonymous Supporter" : row.name || "", row.email || "", row.amount, row.status, new Date(row.createdAt).toISOString(), row.razorpayPaymentId || ""].map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); const link = document.createElement("a"); link.href = url; link.download = "satyam-support-payments.csv"; link.click(); URL.revokeObjectURL(url);
  }
  if (!data) return <main className="admin-login"><section><span className="admin-mark">ST</span><span className="eyebrow">Private dashboard</span><h1>Welcome back.</h1><p>Sign in to see the impact behind the kindness.</p><form onSubmit={login}><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Admin password" autoFocus /><button className="button button-primary" type="submit"><ShieldCheck size={18} /> Unlock dashboard</button>{error && <small className="login-error">{error}</small>}</form></section></main>;
  const maxSupport = Math.max(...data.supporters.map((person) => person.amount), 1);
  return <main className="admin-page"><header className="admin-header"><div><span className="admin-mark">ST</span><span className="admin-title">Support dashboard <i>· private</i></span></div><button className="admin-logout" onClick={logout}><LogOut size={16} /> Sign out</button></header><section className="admin-content"><div className="admin-greeting"><div><span className="eyebrow">Live from Razorpay + Neon</span><h1>Your impact, <em>at a glance.</em></h1></div><button className="button button-secondary" onClick={exportCsv}><Download size={17} /> Export CSV</button></div><div className="admin-stats">{[{ icon: WalletCards, label: "Total raised", value: money(data.totals.raised), foot: `${data.totals.count} verified contributions` }, { icon: TrendingUp, label: "This month", value: money(data.totals.month), foot: "Paid payments only" }, { icon: UsersRound, label: "Today", value: money(data.totals.today), foot: `${data.totals.todayCount} contribution${data.totals.todayCount === 1 ? "" : "s"}` }].map(({ icon: Icon, label, value, foot }) => <article className="admin-stat" key={label}><span><Icon size={20} /></span><small>{label}</small><strong>{value}</strong><p>{foot}</p></article>)}</div><div className="admin-grid"><section className="admin-panel payments-panel"><div className="panel-head"><div><h2>Recent payments</h2><p>Latest payment activity and verification status.</p></div><div className="filters"><label><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search" /></label><select value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)}><option value="ALL">All status</option><option value="PAID">Paid</option><option value="CREATED">Created</option><option value="FAILED">Failed</option></select></div></div><div className="table-wrap"><table><thead><tr><th>Supporter</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead><tbody>{rows.length ? rows.map((payment) => <tr key={payment.id}><td><strong>{payment.isAnonymous ? "Anonymous Supporter" : payment.name || "Unnamed supporter"}</strong><small>{payment.email || payment.razorpayPaymentId || "—"}</small></td><td>{money(payment.amount)}</td><td><span className={`payment-status ${payment.status.toLowerCase()}`}>{payment.status.toLowerCase()}</span></td><td>{new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(payment.createdAt))}</td></tr>) : <tr><td colSpan={4} className="empty-row">No payments match this view yet.</td></tr>}</tbody></table></div></section><aside className="admin-panel top-supporters"><div className="panel-head"><div><h2>Top supporters</h2><p>People powering the journey.</p></div></div>{data.supporters.length ? data.supporters.map((person, index) => <div className="supporter-rank" key={`${person.name}-${index}`}><span className="rank-number">0{index + 1}</span><div><strong>{person.name}</strong><small>{person.count} contribution{person.count === 1 ? "" : "s"}</small><i><b style={{ width: `${(person.amount / maxSupport) * 100}%` }} /></i></div><b>{money(person.amount)}</b></div>) : <p className="empty-copy">Verified supporters will appear here after the first contribution.</p>}</aside></div></section></main>;
}
