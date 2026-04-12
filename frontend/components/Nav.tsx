"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const API = "http://localhost:8000";
const USER = "user_987";

const links = [
  { href: "/", label: "Overview", icon: "▣" },
  { href: "/sources", label: "Data Sources", icon: "◈" },
  { href: "/query", label: "Query Agent", icon: "◎" },
];

export default function Nav() {
  const pathname = usePathname();
  const [agentReady, setAgentReady] = useState<boolean | null>(null);
  const [sourceCount, setSourceCount] = useState<number | null>(null);

  useEffect(() => {
    fetch(`${API}/api/health`)
      .then((r) => r.json())
      .then((d) => setAgentReady(d.agent_ready))
      .catch(() => setAgentReady(false));

    fetch(`${API}/api/data-sources?userId=${USER}`)
      .then((r) => r.json())
      .then((d) => setSourceCount(d.count ?? 0))
      .catch(() => setSourceCount(0));
  }, []);

  const statusColor =
    agentReady === null ? "var(--text3)" : agentReady ? "#22c55e" : "#ef4444";
  const statusLabel =
    agentReady === null
      ? "connecting..."
      : agentReady
        ? "agent online"
        : "agent offline";

  return (
    <aside
      style={{
        width: 200,
        minHeight: "100vh",
        background: "var(--bg2)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
      }}
    >
      <div
        style={{
          padding: "1.5rem 1.25rem 1.75rem",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            fontSize: "15px",
            fontWeight: 600,
            color: "var(--text)",
            letterSpacing: "-0.01em",
          }}
        >
          Fin<span style={{ color: "var(--accent)" }}>Agent</span>
        </div>
        <div
          style={{
            fontSize: "11px",
            color: "var(--text3)",
            fontFamily: "var(--mono)",
            marginTop: "3px",
          }}
        >
          financial intelligence
        </div>
      </div>

      <nav style={{ padding: "0.75rem 0", flex: 1 }}>
        {links.map(({ href, label, icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                padding: "0.5rem 1.25rem",
                fontSize: "13px",
                fontWeight: active ? 500 : 400,
                color: active ? "var(--text)" : "var(--text2)",
                background: active ? "var(--bg3)" : "transparent",
                borderLeft: `2px solid ${active ? "var(--accent)" : "transparent"}`,
                transition: "all 0.15s",
                textDecoration: "none",
              }}
            >
              <span style={{ fontSize: "12px", opacity: 0.7 }}>{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      <div
        style={{
          padding: "1rem 1.25rem",
          borderTop: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "4px",
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: statusColor,
              boxShadow: agentReady ? `0 0 5px ${statusColor}` : "none",
            }}
          />
          <span
            style={{
              fontSize: "11px",
              color: "var(--text2)",
              fontFamily: "var(--mono)",
            }}
          >
            {statusLabel}
          </span>
        </div>
        <div
          style={{
            fontSize: "11px",
            color: "var(--text3)",
            fontFamily: "var(--mono)",
          }}
        >
          {sourceCount === null ? "..." : `${sourceCount} sources connected`}
        </div>
      </div>
    </aside>
  );
}
