import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const REF_W = 1440, REF_H = 900;

function App() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [events, setEvents] = useState([]);
  const [pageUrl, setPageUrl] = useState("/demo.html");
  const [clicks, setClicks] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [view, setView] = useState("overview");

  useEffect(() => {
    fetch("http://localhost:5000/api/sessions").then(r => r.json()).then(setSessions).catch(console.log);
  }, []);

  function handleSessionClick(id) {
    setSelectedSession(id);
    fetch(`http://localhost:5000/api/sessions/${id}/events`)
      .then(r => r.json()).then(d => { setEvents(d); setAllEvents(d); }).catch(console.log);
  }
  function loadHeatmap() {
    fetch(`http://localhost:5000/api/clicks?page_url=${pageUrl}`).then(r => r.json()).then(setClicks).catch(console.log);
  }

  const totalEvents = sessions.reduce((s, x) => s + x.eventCount, 0);
  const totalClicks = clicks.length;

  // build "events over time" data from the selected session's events
  const chartData = events.map((e, i) => ({
    name: `#${i + 1}`,
    time: new Date(e.timestamp).toLocaleTimeString(),
    value: i + 1,
  }));

  return (
    <div style={S.app}>
      {/* SIDEBAR */}
      <aside style={S.sidebar}>
        <div style={S.logo}> ClickStream Analytics</div>
        <nav style={{ marginTop: 24 }}>
              {["Overview", "Sessions", "Heatmap"].map((n) => {
                const key = n.toLowerCase();
                return (
                  <div key={n} onClick={() => setView(key)}
                    style={{ ...S.navItem, ...(view === key ? S.navActive : {}) }}>
                    {n}
                  </div>
                );
              })}
            </nav>
      </aside>

      {/* MAIN */}
      <div style={S.content}>
        <header style={S.topbar}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>Overview</div>
            <div style={{ fontSize: 13, color: "#6b7280" }}>User session & click analytics</div>
          </div>
        </header>

        <div style={S.scroll}>
          {/* STAT CARDS */}
          <div style={S.statGrid}>
            <StatCard label="Total Sessions" value={sessions.length} accent="#6366f1" />
            <StatCard label="Total Events" value={totalEvents} accent="#10b981" />
            <StatCard label="Clicks Loaded" value={totalClicks} accent="#f59e0b" />
            <StatCard label="Avg Events / Session" value={sessions.length ? Math.round(totalEvents / sessions.length) : 0} accent="#ef4444" />
          </div>

          {/* CHART */}
          {view === "overview" && (
          <div style={S.card}>
            <div style={S.cardTitle}>Session Journey {selectedSession && `— ${selectedSession}`}</div>
            {chartData.length === 0 ? (
              <div style={S.empty}>Select a session below to view its journey graph</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef0f3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
          )}

          {/* TWO COLUMNS: sessions + heatmap */}
          <div style={S.twoCol}>
            {(view === "overview" || view === "sessions") && (
            <div style={S.card}>
              <div style={S.cardTitle}>Sessions</div>
              <div style={{ maxHeight: 340, overflowY: "auto" }}>
                {sessions.map(s => {
                  const active = selectedSession === s._id;
                  return (
                    <div key={s._id} onClick={() => handleSessionClick(s._id)}
                      style={{ ...S.sessRow, ...(active ? S.sessActive : {}) }}>
                      <span style={S.sessId}>{s._id}</span>
                      <span style={S.badge}>{s.eventCount}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            )}

            {(view === "overview" || view === "heatmap") && (
            <div style={S.card}>
              <div style={S.cardTitle}>Click Heatmap</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                <input value={pageUrl} onChange={e => setPageUrl(e.target.value)}
                  placeholder="/demo.html" style={S.input} />
                <button onClick={loadHeatmap} style={S.btn}>Load</button>
              </div>
              <div style={S.board}>
                {clicks.length === 0 && <div style={S.empty}>No clicks loaded</div>}
                {clicks.map(c => (
                  <div key={c._id} style={{
                    ...S.dot,
                    left: `${Math.min((c.x / REF_W) * 100, 98)}%`,
                    top: `${Math.min((c.y / REF_H) * 100, 98)}%`,
                  }} />
                ))}
              </div>
            </div>
            )}
          </div>
              
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div style={S.statCard}>
      <div style={{ ...S.statBar, background: accent }} />
      <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: "#111827", fontVariantNumeric: "tabular-nums" }}>{value}</div>
    </div>
  );
}

const S = {
  app: { display: "flex", height: "100vh", overflow: "hidden" },
  sidebar: { width: 220, flexShrink: 0, background: "#fff", borderRight: "1px solid #eceef1", padding: "22px 16px" },
  logo: { display: "flex", alignItems: "center", gap: 9, fontSize: 17, fontWeight: 700, color: "#111827" },
  logoDot: { width: 22, height: 22, borderRadius: 6, background: "linear-gradient(135deg,#6366f1,#8b5cf6)" },
  navItem: { padding: "10px 12px", borderRadius: 8, fontSize: 14, color: "#6b7280", cursor: "pointer", marginBottom: 4 },
  navActive: { background: "#f3f4f6", color: "#111827", fontWeight: 600 },
  content: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  topbar: { padding: "20px 28px", borderBottom: "1px solid #eceef1", background: "#fff" },
  scroll: { flex: 1, overflowY: "auto", padding: 28 },
  statGrid: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 20 },
  statCard: { position: "relative", background: "#fff", border: "1px solid #eceef1", borderRadius: 14, padding: "18px 20px", overflow: "hidden" },
  statBar: { position: "absolute", top: 0, left: 0, width: 4, height: "100%" },
  card: { background: "#fff", border: "1px solid #eceef1", borderRadius: 14, padding: 20, marginBottom: 20 },
  cardTitle: { fontSize: 15, fontWeight: 600, color: "#111827", marginBottom: 16 },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 },
  sessRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 12px", borderRadius: 8, cursor: "pointer", marginBottom: 4 },
  sessActive: { background: "#f5f3ff", outline: "1px solid #ddd6fe" },
  sessId: { fontFamily: "ui-monospace,monospace", fontSize: 12, color: "#4b5563", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  badge: { background: "#eef2ff", color: "#6366f1", fontSize: 12, fontWeight: 600, padding: "2px 9px", borderRadius: 20, marginLeft: 8 },
  input: { flex: 1, padding: "9px 12px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13, outline: "none" },
  btn: { padding: "9px 18px", borderRadius: 8, border: "none", background: "#6366f1", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  board: { position: "relative", width: "100%", aspectRatio: "16/10", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fafafa", backgroundImage: "radial-gradient(#eceef1 1px,transparent 1px)", backgroundSize: "22px 22px", overflow: "hidden" },
  dot: { position: "absolute", width: 16, height: 16, borderRadius: "50%", background: "radial-gradient(circle,rgba(239,68,68,0.6),rgba(239,68,68,0))", transform: "translate(-50%,-50%)", pointerEvents: "none" },
  empty: { color: "#9ca3af", fontSize: 13, padding: "40px 0", textAlign: "center" },
};

export default App;