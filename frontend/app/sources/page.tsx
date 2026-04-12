"use client";
import { useEffect, useRef, useState } from "react";

const API = "http://localhost:8080";
const USER = "user_987";

/* ---------------- TYPES ---------------- */

type Source = {
  id: string;
  name: string;
  source_type: string;
  host: string | null;
  port: number | null;
  source_name: string | null;
  status: string;
  metadata: Record<string, any>;
  created_at: string | null;
};

/* ---------------- UI HELPERS ---------------- */

function Modal({
  open,
  children,
  onClose,
}: {
  open: boolean;
  children: React.ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 420,
          background: "var(--bg2)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          padding: 18,
        }}
      >
        {children}
      </div>
    </div>
  );
}

/* ---------------- MAIN ---------------- */

export default function Sources() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);

  const [showDbModal, setShowDbModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  const [dbForm, setDbForm] = useState({
    name: "",
    source_type: "",
    host: "",
    port: "",
    source_name: "",
    metadata: "{}",
  });

  /* ---------------- FETCH ---------------- */

  const load = async () => {
    setLoading(true);
    const res = await fetch(`${API}/api/data-sources?userId=${USER}`);
    const data = await res.json();
    setSources(data.data_sources ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  /* ---------------- UPLOAD ---------------- */

  const uploadFile = async (file: File) => {
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", USER);

    await fetch(`${API}/api/upload`, {
      method: "POST",
      body: formData,
    });

    setUploading(false);
    await load();
  };

  /* ---------------- DB SUBMIT ---------------- */

  const submitDb = async () => {
    await fetch(`${API}/api/add_db`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: dbForm.name,
        source_type: dbForm.source_type,
        userId: USER,
        host: dbForm.host || null,
        port: dbForm.port ? Number(dbForm.port) : null,
        source_name: dbForm.source_name || null,
        metadata: JSON.parse(dbForm.metadata || "{}"),
      }),
    });

    setShowDbModal(false);
    await load();
  };

  /* ---------------- DRAG & DROP ---------------- */

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const databases = sources.filter((s) =>
    ["postgres", "database"].includes(s.source_type),
  );

  const files = sources.filter((s) => ["file", "pdf"].includes(s.source_type));

  /* ---------------- UI ---------------- */

  return (
    <div style={{ padding: "3rem", maxWidth: 820, margin: "0 auto" }}>
      {/* HEADER */}
      <div style={{ marginBottom: 30 }}>
        <h2 style={{ fontSize: 22, fontWeight: 600 }}>Data Sources</h2>
        <p style={{ color: "var(--text3)", fontSize: 13 }}>
          Databases and documents used by your AI agents
        </p>
      </div>

      {/* ---------------- DATABASE SECTION ---------------- */}
      <section style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h3>Databases</h3>

          <button
            onClick={() => setShowDbModal(true)}
            style={{
              color: "white",
              padding: "6px 12px",
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--bg3)",
              cursor: "pointer",
            }}
          >
            + Add Database
          </button>
        </div>

        <div style={{ marginTop: 12 }}>
          {databases.map((db) => (
            <div
              key={db.id}
              style={{
                padding: 12,
                border: "1px solid var(--border)",
                borderRadius: 10,
                marginBottom: 8,
                background: "var(--bg2)",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ fontWeight: 500 }}>{db.name}</div>
                <div style={{ fontSize: 12, color: "var(--text3)" }}>
                  {db.source_type}
                </div>
              </div>

              <span
                style={{
                  fontSize: 11,
                  color: db.status === "active" ? "#22c55e" : "#ef4444",
                }}
              >
                ●
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- FILE SECTION ---------------- */}
      <section>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h3>Files</h3>
        </div>

        {/* DROP ZONE */}
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
          style={{
            marginTop: 12,
            padding: 24,
            border: "2px dashed var(--border)",
            borderRadius: 12,
            textAlign: "center",
            cursor: "pointer",
            background: "var(--bg2)",
          }}
        >
          {uploading ? (
            <div>Uploading...</div>
          ) : (
            <>
              <div style={{ fontSize: 14, fontWeight: 500 }}>
                Drag & drop or click to upload
              </div>
              <div style={{ fontSize: 12, color: "var(--text3)" }}>
                PDF, bank statements, receipts
              </div>
            </>
          )}

          <input
            ref={fileRef}
            type="file"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadFile(file);
            }}
          />
        </div>

        {/* FILE LIST */}
        <div style={{ marginTop: 14 }}>
          {files.map((f) => (
            <div
              key={f.id}
              style={{
                padding: 12,
                border: "1px solid var(--border)",
                borderRadius: 10,
                marginBottom: 8,
                background: "var(--bg2)",
              }}
            >
              <div style={{ fontWeight: 500 }}>{f.name}</div>
              <div style={{ fontSize: 12, color: "var(--text3)" }}>
                {f.metadata?.page_count} pages · {f.source_type}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- DB MODAL ---------------- */}
      <Modal open={showDbModal} onClose={() => setShowDbModal(false)}>
        <h3 style={{ marginBottom: 12 }}>Add Database</h3>

        <input
          placeholder="name"
          onChange={(e) => setDbForm({ ...dbForm, name: e.target.value })}
          style={inputStyle}
        />
        <input
          placeholder="source_type"
          onChange={(e) =>
            setDbForm({ ...dbForm, source_type: e.target.value })
          }
          style={inputStyle}
        />
        <input
          placeholder="host"
          onChange={(e) => setDbForm({ ...dbForm, host: e.target.value })}
          style={inputStyle}
        />
        <input
          placeholder="port"
          onChange={(e) => setDbForm({ ...dbForm, port: e.target.value })}
          style={inputStyle}
        />
        <input
          placeholder="source_name"
          onChange={(e) =>
            setDbForm({ ...dbForm, source_name: e.target.value })
          }
          style={inputStyle}
        />
        <textarea
          placeholder="metadata JSON"
          onChange={(e) => setDbForm({ ...dbForm, metadata: e.target.value })}
          style={{ ...inputStyle, height: 80 }}
        />

        <button onClick={submitDb} style={primaryBtn}>
          Create
        </button>
      </Modal>
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: 8,
  marginBottom: 8,
  borderRadius: 8,
  border: "1px solid var(--border)",
  background: "var(--bg3)",
};

const primaryBtn: React.CSSProperties = {
  width: "100%",
  padding: 10,
  borderRadius: 8,
  border: "none",
  background: "#3b82f6",
  color: "white",
  cursor: "pointer",
  marginTop: 6,
};
