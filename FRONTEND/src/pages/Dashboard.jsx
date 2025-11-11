import React, { useEffect, useState } from "react";
import { fetchErrors } from "../services/errorService"; // tu servicio CAP
import "../styles/dashboard.css";

const Dashboard = () => {
  const [stats, setStats] = useState({
    unresolved: 0,
    resolved: 0,
    reported: 0,
    ignored: 0,
  });
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const { ok, rows } = await fetchErrors();
      if (!ok || !Array.isArray(rows)) return;

      const unresolved = rows.filter(
        (e) => e.STATUS === "NEW" || e.STATUS === "IN_PROGRESS"
      ).length;
      const resolved = rows.filter((e) => e.STATUS === "RESOLVED").length;
      const ignored = rows.filter((e) => e.STATUS === "IGNORED").length;
      const reported = rows.length;

      setStats({ unresolved, resolved, reported, ignored });
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("❌ Error al cargar estadísticas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard-body">
      <h2>Welcome back, Administrator 👋</h2>
      <p>Here you can monitor and manage your application errors in real time.</p>

      {loading && <p className="loading">Loading data...</p>}

      <div className="dashboard-cards">
        <div className="card unresolved">
          <h3>{stats.unresolved}</h3>
          <p>Unresolved Errors</p>
        </div>

        <div className="card resolved">
          <h3>{stats.resolved}</h3>
          <p>Resolved</p>
        </div>

        <div className="card reported">
          <h3>{stats.reported}</h3>
          <p>Total Reported</p>
        </div>
      </div>

      <div className="dashboard-cards" style={{ marginTop: "1.5rem" }}>
        <div className="card ignored">
          <h3>{stats.ignored}</h3>
          <p>Ignored</p>
        </div>
      </div>

      <p className="last-update">
        ⏱️ Last update: {lastUpdate || "Pending..."}
      </p>
    </div>
  );
};

export default Dashboard;
