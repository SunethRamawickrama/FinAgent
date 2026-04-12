"use client";
import { useState, useRef, useEffect } from "react";

type Message = { role: "agent" | "user"; content: string };

const SUGGESTIONS = [
  "Summarize my January transactions",
  "What are my top spending categories?",
  "Show any overdue invoices",
  "Find transactions over $200",
  "What databases are connected?",
];

const INITIAL: Message[] = [
  {
    role: "agent",
    content:
      "Hello. I'm FinAgent — connect your financial databases and documents, then ask me anything about your data.",
  },
];

export default function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>(INITIAL);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text?: string) => {
    const msg = text ?? input.trim();
    if (!msg || loading) return;
    setInput("");
    setMessages((p) => [...p, { role: "user", content: msg }]);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8080/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, keep_history: true }),
      });
      const data = await res.json();
      setMessages((p) => [
        ...p,
        { role: "agent", content: data.response ?? "No response." },
      ]);
    } catch {
      setMessages((p) => [
        ...p,
        {
          role: "agent",
          content:
            "Could not reach the backend. Make sure the server is running on port 8000.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const reset = async () => {
    setMessages(INITIAL);
    await fetch("http://localhost:8000/api/reset", { method: "POST" }).catch(
      () => {},
    );
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 240px",
        gap: "1.25rem",
        height: "calc(100vh - 10rem)",
      }}
    >
      {/* Chat */}
      <div
        style={{
          background: "var(--bg2)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "0.85rem 1rem",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "var(--bg3)",
              border: "1px solid var(--border2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 600,
              color: "var(--accent)",
            }}
          >
            FA
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>
              FinAgent Orchestrator
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--accent)",
                fontFamily: "var(--mono)",
              }}
            >
              ● online
            </div>
          </div>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "1rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: "0.6rem",
                flexDirection: m.role === "user" ? "row-reverse" : "row",
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 9,
                  fontWeight: 600,
                  background: m.role === "agent" ? "var(--bg3)" : "var(--bg4)",
                  border: "1px solid var(--border2)",
                  color: m.role === "agent" ? "var(--accent)" : "var(--text2)",
                }}
              >
                {m.role === "agent" ? "FA" : "ME"}
              </div>
              <div
                style={{
                  maxWidth: "72%",
                  padding: "0.6rem 0.85rem",
                  borderRadius:
                    m.role === "agent" ? "2px 8px 8px 8px" : "8px 2px 8px 8px",
                  fontSize: 13,
                  lineHeight: 1.65,
                  background:
                    m.role === "agent" ? "var(--bg3)" : "rgba(34,197,94,0.06)",
                  border: `1px solid ${m.role === "agent" ? "var(--border)" : "rgba(34,197,94,0.12)"}`,
                  color: "var(--text)",
                  whiteSpace: "pre-wrap",
                }}
              >
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", gap: "0.6rem" }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: "var(--bg3)",
                  border: "1px solid var(--border2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 9,
                  fontWeight: 600,
                  color: "var(--accent)",
                }}
              >
                FA
              </div>
              <div
                style={{
                  padding: "0.65rem 0.85rem",
                  background: "var(--bg3)",
                  border: "1px solid var(--border)",
                  borderRadius: "2px 8px 8px 8px",
                  display: "flex",
                  gap: 4,
                  alignItems: "center",
                }}
              >
                {[0, 0.15, 0.3].map((delay, i) => (
                  <div
                    key={i}
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: "var(--text3)",
                      animation: `typing 1.2s ${delay}s infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div
          style={{
            padding: "0.85rem",
            borderTop: "1px solid var(--border)",
            display: "flex",
            gap: "0.6rem",
          }}
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Ask about your financial data..."
            rows={1}
            style={{
              flex: 1,
              background: "var(--bg3)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              color: "var(--text)",
              fontSize: 13,
              padding: "0.55rem 0.8rem",
              resize: "none",
              outline: "none",
              fontFamily: "var(--font)",
              minHeight: 38,
              maxHeight: 100,
            }}
          />
          <button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            style={{
              width: 38,
              height: 38,
              flexShrink: 0,
              background: "var(--accent)",
              border: "none",
              borderRadius: "var(--radius)",
              cursor: "pointer",
              fontSize: 14,
              color: "#000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: loading || !input.trim() ? 0.4 : 1,
            }}
          >
            ↑
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <div
          style={{
            background: "var(--bg2)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "1rem",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--text3)",
              marginBottom: "0.75rem",
            }}
          >
            Suggestions
          </div>
          {SUGGESTIONS.map((s) => (
            <div
              key={s}
              onClick={() => send(s)}
              style={{
                fontSize: 12,
                fontFamily: "var(--mono)",
                color: "var(--text2)",
                padding: "0.5rem 0.65rem",
                borderRadius: "var(--radius)",
                border: "1px solid var(--border)",
                marginBottom: "0.4rem",
                cursor: "pointer",
                lineHeight: 1.4,
                background: "var(--bg3)",
              }}
            >
              {s}
            </div>
          ))}
        </div>

        <div
          style={{
            background: "var(--bg2)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "1rem",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--text3)",
              marginBottom: "0.75rem",
            }}
          >
            Session
          </div>
          {[
            ["Messages", messages.length],
            ["Sources", 3],
            ["Model", "qwen2.5:7b"],
          ].map(([label, val]) => (
            <div
              key={label as string}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "0.35rem 0",
                borderBottom: "1px solid var(--border)",
                fontSize: 12,
              }}
            >
              <span style={{ color: "var(--text3)" }}>{label}</span>
              <span
                style={{ fontFamily: "var(--mono)", color: "var(--text2)" }}
              >
                {val}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={reset}
          style={{
            background: "transparent",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            color: "var(--text3)",
            fontSize: 12,
            padding: "0.55rem",
            cursor: "pointer",
            fontFamily: "var(--font)",
          }}
        >
          ↺ Clear session
        </button>
      </div>

      <style>{`
        @keyframes typing {
          0%, 80%, 100% { opacity: 0.3; }
          40% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
