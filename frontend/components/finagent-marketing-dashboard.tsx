// finagent-marketing-dashboard.tsx
"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Upload, FileText, FileImage, FileJson, X,
  Shield, BookOpen, TrendingUp, ChevronRight,
  Download, Eye, LogOut, BarChart2, Table,
  FileOutput, AlertCircle, ArrowUpRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type View = "landing" | "dashboard";
type DashTab = "graphs" | "tables" | "reports";
interface UploadedFile { id: string; name: string; type: string; size: string; }

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_FILES: UploadedFile[] = [
  { id: "1", name: "Q3_Statement_2024.pdf",   type: "PDF",  size: "284 KB" },
  { id: "2", name: "invoice_batch_oct.docx",  type: "Word", size: "61 KB"  },
  { id: "3", name: "transactions_raw.json",   type: "JSON", size: "18 KB"  },
];
const SPEND_DATA = [
  { month: "Jul", amount: 18400 }, { month: "Aug", amount: 21200 },
  { month: "Sep", amount: 19800 }, { month: "Oct", amount: 24500 },
  { month: "Nov", amount: 22100 }, { month: "Dec", amount: 27300 },
];
const TREND_DATA = [
  { week: "W1", income: 9200,  expenses: 6100 }, { week: "W2", income: 8800,  expenses: 7400 },
  { week: "W3", income: 10500, expenses: 6900 }, { week: "W4", income: 9700,  expenses: 8200 },
  { week: "W5", income: 11200, expenses: 7600 }, { week: "W6", income: 10800, expenses: 8900 },
];
const TRANSACTIONS = [
  { date: "2024-12-03", merchant: "AWS Infrastructure",  category: "Technology", amount: -4218.00 },
  { date: "2024-12-02", merchant: "Stripe Payout",       category: "Revenue",    amount: 14500.00 },
  { date: "2024-11-30", merchant: "Notion Teams",         category: "Software",   amount: -240.00  },
  { date: "2024-11-29", merchant: "FedEx Logistics",      category: "Shipping",   amount: -892.50  },
  { date: "2024-11-28", merchant: "Client Invoice #1042", category: "Revenue",    amount: 8750.00  },
  { date: "2024-11-27", merchant: "OpenAI API",           category: "Technology", amount: -318.44  },
  { date: "2024-11-25", merchant: "WeWork HQ",            category: "Office",     amount: -3200.00 },
];
const REPORTS = [
  { id: "r1", title: "Q4 Cash Flow Summary",  range: "Oct 1 – Dec 31, 2024", status: "Ready"      },
  { id: "r2", title: "Vendor Spend Analysis", range: "Nov 1 – Nov 30, 2024", status: "Ready"      },
  { id: "r3", title: "Annual P&L Overview",   range: "Jan 1 – Dec 31, 2024", status: "Processing" },
  { id: "r4", title: "Budget vs. Actuals Q3", range: "Jul 1 – Sep 30, 2024", status: "Ready"      },
];
const KPI = [
  { label: "Net Cash Flow",  value: "$18,239", delta: "+12.4%", up: true  },
  { label: "Total Revenue",  value: "$23,250", delta: "+8.1%",  up: true  },
  { label: "Total Expenses", value: "$8,869",  delta: "+3.2%",  up: false },
  { label: "Open Invoices",  value: "4",       delta: "−2",     up: true  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fileIcon(type: string) {
  if (type === "PDF")  return <FileText  className="w-3.5 h-3.5 text-gray-500" />;
  if (type === "JSON") return <FileJson  className="w-3.5 h-3.5 text-gray-500" />;
  if (type === "PNG")  return <FileImage className="w-3.5 h-3.5 text-gray-500" />;
  return <FileText className="w-3.5 h-3.5 text-gray-500" />;
}
function fmt(n: number) {
  const s = Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2 });
  return n < 0 ? `\u2212$${s}` : `+$${s}`;
}

// ─── Animated counter ─────────────────────────────────────────────────────────
function Counter({ target }: { target: string }) {
  const [display, setDisplay] = useState("—");
  useEffect(() => {
    const num = parseFloat(target.replace(/[^0-9.]/g, ""));
    if (isNaN(num)) { setDisplay(target); return; }
    const prefix = target.match(/^[^0-9]*/)?.[0] ?? "";
    let cur = 0;
    const steps = 40;
    const inc = num / steps;
    let i = 0;
    const id = setInterval(() => {
      i++; cur = Math.min(cur + inc, num);
      const disp = num >= 1000
        ? cur.toLocaleString("en-US", { maximumFractionDigits: 0 })
        : cur.toFixed(0);
      setDisplay(`${prefix}${disp}`);
      if (i >= steps) clearInterval(id);
    }, 18);
    return () => clearInterval(id);
  }, [target]);
  return <>{display}</>;
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
function Nav({ view, onLogin, onSignOut }: { view: View; onLogin: () => void; onSignOut: () => void }) {
  return (
    <header className="fixed top-0 inset-x-0 z-50 h-14 flex items-center border-b border-white/[0.06] bg-[#0a0d14]/90 backdrop-blur-md">
      <div className="w-full max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-white flex items-center justify-center shrink-0">
            <span className="text-[10px] font-black text-[#0a0d14] tracking-tight">FA</span>
          </div>
          <span className="text-sm font-semibold tracking-tight text-white">FinAgent</span>
        </div>
        {view === "landing" ? (
          <nav className="flex items-center gap-2">
            <button onClick={onLogin}
              className="text-xs text-gray-400 hover:text-white px-3.5 py-1.5 rounded transition-colors duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-white/40">
              Log in
            </button>
            <button onClick={onLogin}
              className="text-xs font-medium text-[#0a0d14] bg-white hover:bg-gray-100 px-4 py-1.5 rounded transition-colors duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-white/40">
              Get started
            </button>
          </nav>
        ) : (
          <nav className="flex items-center gap-4">
            <button onClick={onSignOut}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-200 transition-colors duration-150 focus:outline-none">
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}

// ─── Landing ──────────────────────────────────────────────────────────────────
function Landing({ onLogin }: { onLogin: () => void }) {
  return (
    <main className="pt-14 min-h-screen bg-[#0a0d14] text-white">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-28 pb-24 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 border border-white/10 rounded-full px-3 py-1 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-medium text-gray-400 tracking-widest uppercase">Now in beta</span>
          </div>
          <h1 className="text-[52px] font-bold leading-[1.05] tracking-[-0.03em] text-white mb-6"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
            Your finances,<br />
            <span className="text-gray-400">finally legible.</span>
          </h1>
          <p className="text-[15px] text-gray-500 leading-relaxed max-w-md mb-10">
            FinAgent reads your statements, invoices, and exports — then surfaces what matters:
            trends, anomalies, and clear decisions. No spreadsheet required.
          </p>
          <div className="flex items-center gap-3">
            <button onClick={onLogin}
              className="inline-flex items-center gap-2 text-sm font-medium text-[#0a0d14] bg-white hover:bg-gray-100 px-5 py-2.5 rounded-md transition-all duration-150 focus:outline-none group">
              Open dashboard <ChevronRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-0.5" />
            </button>
            <button onClick={onLogin}
              className="text-sm text-gray-500 hover:text-gray-200 px-5 py-2.5 rounded-md border border-white/10 hover:border-white/20 transition-all duration-150 focus:outline-none">
              Learn more
            </button>
          </div>
        </div>

        {/* Preview card */}
        <div className="hidden lg:block">
          <div className="rounded-2xl border border-white/[0.07] bg-[#111520] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Cash flow · Dec 2024</p>
              <span className="text-[10px] text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">↑ 12.4%</span>
            </div>
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={SPEND_DATA} barSize={18}>
                  <Bar dataKey="amount" fill="#1e293b" radius={[3,3,0,0]} />
                  <XAxis dataKey="month" tick={{ fontSize: 9, fill: "#374151" }} axisLine={false} tickLine={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3">
              {[{ l: "Revenue", v: "$23.2k" }, { l: "Expenses", v: "$8.9k" }, { l: "Net", v: "$14.3k" }].map((s) => (
                <div key={s.l} className="bg-[#0d1117] rounded-lg p-3">
                  <p className="text-[10px] text-gray-600 mb-1">{s.l}</p>
                  <p className="text-sm font-semibold text-white font-mono">{s.v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-6"><div className="border-t border-white/[0.06]" /></div>

      {/* Trust pillars */}
      <section className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-3 gap-px bg-white/[0.04] rounded-xl overflow-hidden border border-white/[0.04] mt-4">
        {[
          { icon: <Shield className="w-4 h-4" />,     title: "Data stays yours",       body: "Files are processed in your own environment. Nothing touches FinAgent servers without explicit authorization." },
          { icon: <BookOpen className="w-4 h-4" />,   title: "Plain-language outputs", body: "Every report is written to be understood — not to impress with jargon. Numbers with context, not numbers alone." },
          { icon: <TrendingUp className="w-4 h-4" />, title: "No estimates, no hype",  body: "FinAgent draws conclusions only from your actual data. Projections are labeled and assumptions made explicit." },
        ].map((t) => (
          <div key={t.title} className="bg-[#0d1117] px-8 py-10">
            <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.07] flex items-center justify-center text-gray-400 mb-5">
              {t.icon}
            </div>
            <h3 className="text-sm font-semibold text-white mb-2">{t.title}</h3>
            <p className="text-[13px] text-gray-500 leading-relaxed">{t.body}</p>
          </div>
        ))}
      </section>

      {/* Plans */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="mb-10">
          <h2 className="text-3xl font-bold tracking-tight text-white mb-2"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
            One product, two modes.
          </h2>
          <p className="text-sm text-gray-500">Switch between them inside the dashboard at any time.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Personal */}
          <div className="group rounded-2xl border border-white/[0.07] bg-[#111520] p-8 hover:border-white/[0.14] transition-colors duration-200 cursor-pointer" onClick={onLogin}>
            <div className="mb-6">
              <p className="text-[10px] font-semibold tracking-widest uppercase text-gray-600 mb-2">Personal</p>
              <h3 className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                For individuals
              </h3>
            </div>
            <ul className="space-y-3 mb-8">
              {["Upload bank statements (PDF, CSV) for auto-categorization","Spending breakdowns by category and merchant","Goal tracking with milestone notifications","Monthly summary reports, plain language"].map((f) => (
                <li key={f} className="flex items-start gap-3 text-[13px] text-gray-400">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-600 flex-shrink-0" />{f}
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-2 text-xs text-gray-500 group-hover:text-gray-300 transition-colors duration-150">
              Open Personal dashboard <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
          {/* Business */}
          <div className="group rounded-2xl border border-white/[0.12] bg-[#141b2d] p-8 hover:border-white/[0.22] transition-colors duration-200 cursor-pointer relative" onClick={onLogin}>
            <div className="absolute top-5 right-5">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-white bg-white/[0.1] border border-white/[0.15] px-2.5 py-0.5 rounded-full">Popular</span>
            </div>
            <div className="mb-6">
              <p className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-2">Business</p>
              <h3 className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                For teams
              </h3>
            </div>
            <ul className="space-y-3 mb-8">
              {["Invoice parsing and vendor spend tracking","Ledger-style insights with multi-account support","Budget vs. actuals with variance flagging","Exportable P&L and cash flow reports"].map((f) => (
                <li key={f} className="flex items-start gap-3 text-[13px] text-gray-400">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-500 flex-shrink-0" />{f}
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-2 text-xs text-gray-400 group-hover:text-white transition-colors duration-150">
              Open Business dashboard <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] max-w-7xl mx-auto px-6 py-6 flex items-center justify-between text-[11px] text-gray-600">
        <span>© 2024 FinAgent, Inc.</span>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-gray-400 transition-colors">Privacy</a>
          <a href="#" className="hover:text-gray-400 transition-colors">Terms</a>
        </div>
      </footer>
    </main>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard() {
  const [files, setFiles]   = useState<UploadedFile[]>(MOCK_FILES);
  const [dragging, setDrag] = useState(false);
  const [tab, setTab]       = useState<DashTab>("graphs");
  const inputRef            = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((fl: FileList | null) => {
    if (!fl) return;
    // TODO: POST to /api/upload (FastAPI / Supabase storage)
    const next: UploadedFile[] = Array.from(fl).map((f) => ({
      id: crypto.randomUUID(), name: f.name,
      type: f.name.split(".").pop()?.toUpperCase() ?? "File",
      size: f.size > 1048576 ? `${(f.size/1048576).toFixed(1)} MB` : `${Math.round(f.size/1024)} KB`,
    }));
    setFiles((p) => [...p, ...next]);
    console.log("Files queued:", next.map((f) => f.name));
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const TABS: { key: DashTab; label: string; icon: React.ReactNode }[] = [
    { key: "graphs",  label: "Graphs",       icon: <BarChart2  className="w-3.5 h-3.5" /> },
    { key: "tables",  label: "Transactions", icon: <Table      className="w-3.5 h-3.5" /> },
    { key: "reports", label: "Reports",      icon: <FileOutput className="w-3.5 h-3.5" /> },
  ];

  return (
    <main className="pt-14 min-h-screen bg-[#0a0d14] text-white">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>Dashboard</h1>
          <p className="text-sm text-gray-500">Upload documents and explore your financial intelligence.</p>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
          {KPI.map((k) => (
            <div key={k.label} className="rounded-xl border border-white/[0.07] bg-[#111520] p-5 hover:border-white/[0.12] transition-colors duration-200">
              <p className="text-[11px] text-gray-600 uppercase tracking-widest mb-3">{k.label}</p>
              <p className="text-2xl font-bold text-white font-mono tracking-tight mb-2"><Counter target={k.value} /></p>
              <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${k.up ? "text-emerald-400 bg-emerald-400/10" : "text-red-400 bg-red-400/10"}`}>
                {k.delta}
              </span>
            </div>
          ))}
        </div>

        {/* Upload */}
        <section aria-label="Document upload" className="mb-10">
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-gray-600 mb-3">Documents</h2>
          <div
            role="button" tabIndex={0}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-white/30 ${
              dragging ? "border-white/30 bg-white/[0.04]" : "border-white/[0.07] hover:border-white/[0.14] hover:bg-white/[0.02]"
            }`}
          >
            <Upload className={`w-6 h-6 ${dragging ? "text-white" : "text-gray-600"}`} />
            <p className="text-sm text-gray-400">
              <span className="text-white underline underline-offset-2">Browse</span> or drag files here
            </p>
            <p className="text-[11px] text-gray-600">PDF · Word · PNG · TXT · JSON</p>
            <input ref={inputRef} type="file" multiple accept=".pdf,.doc,.docx,.png,.txt,.json"
              className="hidden" onChange={(e) => addFiles(e.target.files)} />
          </div>

          {files.length > 0 && (
            <ul className="mt-3 divide-y divide-white/[0.04] border border-white/[0.07] rounded-xl overflow-hidden">
              {files.map((f) => (
                <li key={f.id} className="flex items-center gap-3 px-4 py-2.5 bg-[#111520] hover:bg-[#141b2d] transition-colors duration-100">
                  {fileIcon(f.type)}
                  <span className="flex-1 text-[13px] text-gray-300 truncate">{f.name}</span>
                  <span className="text-[11px] text-gray-600 font-mono w-14 text-right">{f.size}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-600 bg-white/[0.05] px-1.5 py-0.5 rounded">{f.type}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); setFiles((p) => p.filter((x) => x.id !== f.id)); }}
                    className="text-gray-700 hover:text-gray-300 transition-colors focus:outline-none rounded"
                    aria-label={`Remove ${f.name}`}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Tabs */}
        <section aria-label="Reporting">
          <div className="flex items-center gap-1 border-b border-white/[0.06] mb-8" role="tablist">
            {TABS.map((t) => (
              <button key={t.key} role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 text-xs px-4 py-2.5 border-b-2 transition-all duration-150 focus:outline-none rounded-t ${
                  tab === t.key ? "border-white text-white font-medium" : "border-transparent text-gray-600 hover:text-gray-300"
                }`}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* Graphs */}
          {tab === "graphs" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-xl border border-white/[0.07] bg-[#111520] p-6">
                <p className="text-[11px] uppercase tracking-widest text-gray-600 mb-1">Monthly spend</p>
                <p className="text-base font-semibold text-white mb-6" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>Jul – Dec 2024</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={SPEND_DATA} barSize={26}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e2535" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#4b5563" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#4b5563" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v) => [`$${Number(v ?? 0).toLocaleString()}`, "Spend"]}
                      contentStyle={{ background: "#141b2d", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 12, color: "#e2e8f0" }}
                      cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                    <Bar dataKey="amount" fill="#334155" radius={[3,3,0,0]} activeBar={{ fill: "#94a3b8" }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="rounded-xl border border-white/[0.07] bg-[#111520] p-6">
                <p className="text-[11px] uppercase tracking-widest text-gray-600 mb-1">Income vs. expenses</p>
                <p className="text-base font-semibold text-white mb-6" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>Last 6 weeks</p>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={TREND_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e2535" vertical={false} />
                    <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#4b5563" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#4b5563" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v, name) => [`$${Number(v ?? 0).toLocaleString()}`, name === "income" ? "Income" : "Expenses"]}
                      contentStyle={{ background: "#141b2d", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 12, color: "#e2e8f0" }}
                      cursor={{ stroke: "rgba(255,255,255,0.06)" }} />
                    <Line dataKey="income"   stroke="#e2e8f0" strokeWidth={1.5} dot={{ r: 3, fill: "#e2e8f0", strokeWidth: 0 }} />
                    <Line dataKey="expenses" stroke="#475569" strokeWidth={1.5} dot={{ r: 3, fill: "#475569", strokeWidth: 0 }} strokeDasharray="4 2" />
                  </LineChart>
                </ResponsiveContainer>
                <div className="flex gap-5 mt-4">
                  <span className="flex items-center gap-1.5 text-[11px] text-gray-500"><span className="w-4 h-px bg-gray-200 inline-block" /> Income</span>
                  <span className="flex items-center gap-1.5 text-[11px] text-gray-500"><span className="w-4 h-px bg-slate-600 inline-block" /> Expenses</span>
                </div>
              </div>
            </div>
          )}

          {/* Tables */}
          {tab === "tables" && (
            <div className="rounded-xl border border-white/[0.07] overflow-hidden bg-[#111520]">
              <div className="px-6 py-4 border-b border-white/[0.06]">
                <p className="text-sm font-semibold text-white">Recent transactions</p>
                <p className="text-[11px] text-gray-600 mt-0.5">Sourced from uploaded documents · {TRANSACTIONS.length} entries</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      {["Date","Merchant","Category","Amount"].map((h, i) => (
                        <th key={h} className={`text-[10px] font-semibold uppercase tracking-widest text-gray-600 px-6 py-3 ${i===3?"text-right":"text-left"}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {TRANSACTIONS.map((tx, i) => (
                      <tr key={i} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors duration-100">
                        <td className="px-6 py-3 text-[11px] text-gray-600 font-mono tabular-nums">{tx.date}</td>
                        <td className="px-6 py-3 text-[13px] text-gray-300">{tx.merchant}</td>
                        <td className="px-6 py-3">
                          <span className="text-[11px] text-gray-500 bg-white/[0.05] px-2 py-0.5 rounded">{tx.category}</span>
                        </td>
                        <td className={`px-6 py-3 text-right font-mono tabular-nums text-[13px] font-medium ${tx.amount < 0 ? "text-red-400" : "text-emerald-400"}`}>
                          {fmt(tx.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Reports */}
          {tab === "reports" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {REPORTS.map((r) => (
                <div key={r.id} className="rounded-xl border border-white/[0.07] bg-[#111520] hover:border-white/[0.12] transition-colors duration-200 p-6 flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[13px] font-semibold text-white leading-snug">{r.title}</p>
                      <p className="text-[11px] text-gray-600 mt-0.5">{r.range}</p>
                    </div>
                    {r.status === "Ready" ? (
                      <span className="flex-shrink-0 text-[10px] font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">Ready</span>
                    ) : (
                      <span className="flex-shrink-0 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500 bg-white/[0.05] border border-white/[0.07] px-2 py-0.5 rounded-full">
                        <AlertCircle className="w-2.5 h-2.5" /> Processing
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button disabled={r.status !== "Ready"}
                      // TODO: open report viewer → /api/reports/:id
                      className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border transition-all duration-150 focus:outline-none ${r.status === "Ready" ? "text-white border-white/[0.14] hover:bg-white/[0.06]" : "text-gray-700 border-white/[0.04] cursor-not-allowed"}`}>
                      <Eye className="w-3 h-3" /> View
                    </button>
                    <button disabled={r.status !== "Ready"}
                      // TODO: download from Supabase storage bucket
                      className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border transition-all duration-150 focus:outline-none ${r.status === "Ready" ? "text-gray-400 border-white/[0.07] hover:bg-white/[0.04] hover:text-white" : "text-gray-700 border-white/[0.04] cursor-not-allowed"}`}>
                      <Download className="w-3 h-3" /> Export
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <footer className="border-t border-white/[0.05] mt-16">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between text-[11px] text-gray-700">
          <span>© 2024 FinAgent, Inc.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gray-400 transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function FinAgentApp() {
  const [view, setView] = useState<View>("landing");
  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&display=swap'); * { box-sizing: border-box; }`}</style>
      <Nav view={view} onLogin={() => setView("dashboard")} onSignOut={() => setView("landing")} />
      {view === "landing" ? <Landing onLogin={() => setView("dashboard")} /> : <Dashboard />}
    </>
  );
}
