import Link from "next/link";

const cards = [
  {
    accent: "#22c55e",
    dimBg: "rgba(34,197,94,0.06)",
    label: "Personal finance",
    title: "Understand your money",
    desc: "Connect bank accounts and upload statements. Get spending breakdowns, budget analysis, recurring payment detection, and savings tracking — all through natural language.",
    tags: ["Transactions", "Budgets", "Bank statements"],
    tagColor: "rgba(34,197,94,0.08)",
    tagText: "#22c55e",
  },
  {
    accent: "#3b82f6",
    dimBg: "rgba(59,130,246,0.06)",
    label: "Business finance",
    title: "Audit and compliance",
    desc: "Connect your general ledger, invoice database, and vendor records. Flag overdue invoices, identify expense policy violations, and run compliance audits automatically.",
    tags: ["General ledger", "Invoices", "Audit trail"],
    tagColor: "rgba(59,130,246,0.08)",
    tagText: "#3b82f6",
  },
  {
    accent: "#f59e0b",
    dimBg: "rgba(245,158,11,0.06)",
    label: "Agent architecture",
    title: "Multi-agent routing",
    desc: "A central orchestrator dynamically routes queries to specialized sub-agents — database, file, and Nessie agents — each with dedicated MCP servers and tools.",
    tags: ["MCP protocol", "RAG retrieval", "Dynamic routing"],
    tagColor: "rgba(245,158,11,0.08)",
    tagText: "#f59e0b",
  },
];

export default function Home() {
  return (
    <div style={{ padding: "4rem 3rem", maxWidth: 900 }}>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: "rgba(34,197,94,0.08)",
          border: "1px solid rgba(34,197,94,0.18)",
          borderRadius: 20,
          padding: "4px 12px",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "#22c55e",
          }}
        />
        <span
          style={{
            fontSize: 11,
            color: "#22c55e",
            fontFamily: "var(--mono)",
            fontWeight: 500,
          }}
        >
          MULTI-AGENT FINANCIAL INTELLIGENCE
        </span>
      </div>

      <h1
        style={{
          fontSize: "clamp(2rem, 4vw, 3.2rem)",
          fontWeight: 600,
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
          color: "var(--text)",
          marginBottom: "1.25rem",
        }}
      >
        Financial data,
        <br />
        <span style={{ color: "var(--accent)" }}>understood by agents</span>
      </h1>

      <p
        style={{
          fontSize: "15px",
          color: "var(--text2)",
          maxWidth: 480,
          lineHeight: 1.7,
          marginBottom: "2.5rem",
          fontFamily: "var(--mono)",
          fontWeight: 400,
        }}
      >
        Connect your databases and documents. Ask anything. FinAgent routes your
        query to the right specialized agent and returns structured financial
        insights.
      </p>

      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          marginBottom: "4rem",
          flexWrap: "wrap",
        }}
      >
        <Link
          href="/query"
          style={{
            background: "var(--accent)",
            color: "#000",
            fontSize: "13px",
            fontWeight: 600,
            padding: "0.6rem 1.25rem",
            borderRadius: "var(--radius)",
            textDecoration: "none",
          }}
        >
          Query the agent
        </Link>
        <Link
          href="/sources"
          style={{
            background: "transparent",
            color: "var(--text)",
            fontSize: "13px",
            fontWeight: 500,
            padding: "0.6rem 1.25rem",
            borderRadius: "var(--radius)",
            border: "1px solid var(--border2)",
            textDecoration: "none",
          }}
        >
          View sources
        </Link>
      </div>

      <div
        style={{
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--text3)",
          marginBottom: "1.25rem",
        }}
      >
        Capabilities
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "1px",
          background: "var(--border)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
        }}
      >
        {cards.map((c) => (
          <div
            key={c.label}
            style={{
              background: "var(--bg2)",
              padding: "1.75rem",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "2px",
                background: c.accent,
                opacity: 0.6,
              }}
            />
            <div
              style={{
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: c.accent,
                marginBottom: "0.6rem",
                fontFamily: "var(--mono)",
              }}
            >
              {c.label}
            </div>
            <div
              style={{
                fontSize: "15px",
                fontWeight: 600,
                color: "var(--text)",
                marginBottom: "0.75rem",
                letterSpacing: "-0.01em",
              }}
            >
              {c.title}
            </div>
            <p
              style={{
                fontSize: "13px",
                color: "var(--text2)",
                lineHeight: 1.7,
                marginBottom: "1.25rem",
              }}
            >
              {c.desc}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {c.tags.map((t) => (
                <span
                  key={t}
                  style={{
                    fontSize: "11px",
                    fontFamily: "var(--mono)",
                    background: c.tagColor,
                    color: c.tagText,
                    padding: "2px 8px",
                    borderRadius: 4,
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
