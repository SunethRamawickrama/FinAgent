import ChatPanel from "@/components/Chatpanel";

export default function QueryPage() {
  return (
    <div style={{ padding: "3rem" }}>
      <div style={{ marginBottom: "1.75rem" }}>
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: 600,
            letterSpacing: "-0.02em",
            marginBottom: 6,
          }}
        >
          Query Agent
        </h2>
        <p
          style={{
            fontSize: 13,
            color: "var(--text2)",
            fontFamily: "var(--mono)",
          }}
        >
          Ask anything about your connected financial data
        </p>
      </div>
      <ChatPanel />
    </div>
  );
}
