import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Tabs from "../components/Tabs";
import {
  fetchErrorById,
  updateError
} from "../services/errorService";
import "../styles/errordetail.css";

const ErrorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 🔹 Cargar detalle del error desde backend CAP
  const loadError = async () => {
  try {
    setLoading(true);
    const { ok, rows, message } = await fetchErrorById(id);

    // 🔹 Aceptar tanto un array como un objeto
    const data = Array.isArray(rows) ? rows : [rows];
    if (!ok || !data.length) throw new Error(message || "No encontrado");

    setError(data[0]);
  } catch (err) {
    console.error("❌ Error al cargar detalle:", err);
    alert("No se pudo cargar el detalle del error.");
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    loadError();
  }, [id]);

  // 🔹 Actualizar estado (IGNORED / RESOLVED)
  const handleStatusChange = async (status) => {
    const confirmMsg =
      status === "RESOLVED"
        ? "¿Marcar este error como RESUELTO?"
        : "¿Ignorar este error?";
    if (!window.confirm(confirmMsg)) return;

    try {
      setSaving(true);
      const { ok, message } = await updateError({ ...error, STATUS: status });
      if (ok) {
        alert(`✅ Error marcado como ${status}`);
        navigate("/errors");
      } else {
        alert(`⚠️ No se pudo actualizar: ${message}`);
      }
    } catch (err) {
      console.error("❌ Error al actualizar:", err);
      alert("Error interno al actualizar el estado.");
    } finally {
      setSaving(false);
    }
  };

  // 🔹 Obtener solución IA desde el backend
  const handleAISolution = async () => {
    try {
      const prompt = error.ERRORMESSAGE || "Error sin descripción";
      const context = JSON.stringify(error.CONTEXT || {});
      const aiText = await getAISolution(prompt, context);
      alert("💡 Solución sugerida:\n\n" + aiText);
    } catch (err) {
      console.error("❌ Error IA:", err);
      alert("No se pudo generar una solución con IA.");
    }
  };

  if (loading) return <p className="loading">Cargando detalle...</p>;
  if (!error)
    return <p className="loading">No se encontró información del error.</p>;

  const fecha = error.ERRORDATETIME
    ? new Date(error.ERRORDATETIME).toLocaleString("es-MX", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Fecha desconocida";

  // 🔹 Definición de pestañas
  const tabs = [
    {
      label: "Descripción del Error",
      content: (
        <div className="error-summary">
          <p><strong>Mensaje:</strong> {error.ERRORMESSAGE}</p>
          <p><strong>Código:</strong> {error.ERRORCODE}</p>
          <p><strong>Origen:</strong> {error.ERRORSOURCE}</p>
          <p><strong>Severidad:</strong> {error.SEVERITY}</p>
          <p><strong>Módulo:</strong> {error.MODULE}</p>
          <p><strong>Aplicación:</strong> {error.APPLICATION}</p>
          <p><strong>Usuario:</strong> {error.USER}</p>
          <p><strong>Fecha:</strong> {fecha}</p>
        </div>
      ),
    },
    {
      label: "Contexto Técnico",
      content: (
        <pre className="context-pre">
          {JSON.stringify(error.CONTEXT, null, 2) ||
            "Sin información de contexto"}
        </pre>
      ),
    },
    {
      label: "Asistencia IA",
      content: (
        <div className="ai-container">
          <div className="ai-header">
            <h4>Asistencia generada por IA</h4>
            <button
              className="ai-fix-btn"
              disabled={saving}
              onClick={handleAISolution}
            >
              💡 Solucionar error
            </button>
          </div>

          <div className="ai-response">
            {error.AI_RESPONSE ||
              "No se generó respuesta de inteligencia artificial."}
          </div>

          <div className="comment-box">
            <div className="comment-header">
              <img
                src="https://i.pravatar.cc/45?u=Admin"
                alt="Usuario"
                className="comment-avatar"
              />
              <div>
                <p className="comment-user">Admin (Tú)</p>
                <p className="comment-hint">
                  Describe cómo solucionaste el error:
                </p>
              </div>
            </div>
            <textarea
              className="comment-input"
              placeholder="Ejemplo: Reemplacé la llamada fetchData() por fetchUsers()..."
              rows="3"
            ></textarea>
            <button className="comment-send">💾 Guardar comentario</button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="detail-container">
      <h2>
        🧩 Detalle del Error —{" "}
        <span className="error-id">{error.ERRORCODE}</span>
      </h2>

      <div className="detail-header">
        <img
          src={`https://i.pravatar.cc/70?u=${error.USER || "user"}`}
          alt="Avatar"
          className="detail-avatar"
        />
        <div>
          <h3>{error.ERRORMESSAGE}</h3>
          <p className="detail-sub">
            {error.USER || "Sin usuario"} — {fecha}
          </p>
        </div>
        <span className={`status-tag ${error.STATUS?.toLowerCase()}`}>
          {error.STATUS}
        </span>
      </div>

      <Tabs tabs={tabs} />

      <div className="buttons">
        <button
          className="ignore"
          disabled={saving}
          onClick={() => handleStatusChange("IGNORED")}
        >
          🚫 Ignorar
        </button>
        <button
          className="resolve"
          disabled={saving}
          onClick={() => handleStatusChange("RESOLVED")}
        >
          ✅ Marcar Resuelto
        </button>
      </div>
    </div>
  );
};

export default ErrorDetail;
