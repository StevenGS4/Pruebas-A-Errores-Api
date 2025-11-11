import React, { useEffect, useState } from "react";
import ErrorCard from "../components/ErrorCard";
import { fetchErrors, createError } from "../services/errorService";
import "../styles/errorlog.css";

const ErrorLog = () => {
  const [errors, setErrors] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [lastUpdate, setLastUpdate] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔹 Cargar errores desde CAP
  const loadErrors = async () => {
    try {
      setLoading(true);
      const { ok, rows } = await fetchErrors();
      if (ok && Array.isArray(rows)) {
        setErrors(rows);
        setLastUpdate(new Date().toLocaleTimeString());
      } else {
        console.warn("⚠️ No se pudieron cargar los errores");
      }
    } catch (err) {
      console.error("❌ Error al cargar errores:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Cargar al iniciar y refrescar cada 10 segundos
  useEffect(() => {
    loadErrors();
    const interval = setInterval(loadErrors, 10000);
    return () => clearInterval(interval);
  }, []);

  // 🔹 Crear error de ejemplo
  const handleCreateError = async () => {
    const nuevo = {
      ERRORMESSAGE: "Error simulado desde frontend",
      ERRORCODE: "ERR-FRONT",
      ERRORSOURCE: "ReactUI",
      SEVERITY: "ERROR",
      MODULE: "Interfaz",
      APPLICATION: "ErrorManager",
      USER: "Admin",
    };

    const { ok, rows, message } = await createError(nuevo);
    if (ok) {
      alert("✅ Error creado exitosamente");
      setErrors((prev) => [rows[0], ...prev]);
    } else {
      alert(`❌ Falló al crear el error: ${message}`);
    }
  };

  // 🔹 Filtros
  const filteredErrors = errors
    .filter((e) =>
      e.ERRORMESSAGE?.toLowerCase().includes(search.toLowerCase())
    )
    .filter((e) => {
      if (filter === "ALL") return true;
      if (filter === "UNRESOLVED")
        return e.STATUS === "NEW" || e.STATUS === "IN_PROGRESS";
      if (filter === "RESOLVED") return e.STATUS === "RESOLVED";
      if (filter === "IGNORED") return e.STATUS === "IGNORED";
      return true;
    });

  return (
    <div className="errorlog-container">
      <h2>Error Log</h2>

      {/* 🔹 Filtros */}
      <div className="error-filters">
        <div className="filter-buttons">
          {["ALL", "UNRESOLVED", "RESOLVED", "IGNORED"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={filter === type ? "active" : ""}
            >
              {type === "ALL"
                ? "All Errors"
                : type.charAt(0) + type.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="search-section">
          <input
            type="text"
            placeholder="Search by message, code, or source..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value.toUpperCase())}
          >
            <option value="ALL">All</option>
            <option value="RESOLVED">Resolved</option>
            <option value="UNRESOLVED">Unresolved</option>
            <option value="IGNORED">Ignored</option>
          </select>
        </div>
      </div>

      {/* 🔹 Botones de acción */}
      <div className="error-actions">
        <button onClick={loadErrors} disabled={loading}>
          {loading ? "⏳ Loading..." : "🔄 Refresh"}
        </button>
        <button onClick={handleCreateError}>➕ Add Example Error</button>
        <span className="timestamp">
          Última actualización: {lastUpdate || "Nunca"}
        </span>
      </div>

      {/* 🔹 Lista de errores */}
      <div className="timeline">
        {filteredErrors.length === 0 ? (
          <p>{loading ? "Cargando errores..." : "No errors found"}</p>
        ) : (
          filteredErrors.map((err) => (
            <ErrorCard key={err.ERRORID || err._id} error={err} />
          ))
        )}
      </div>
    </div>
  );
};

export default ErrorLog;
