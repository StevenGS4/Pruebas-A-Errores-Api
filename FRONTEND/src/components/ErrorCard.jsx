import React from "react";
import { Link } from "react-router-dom";
import "../styles/errorlog.css";

/**
 * 🔹 Muestra cada error con su título, usuario, fecha y descripción
 */
const ErrorCard = ({ error }) => {
  // Formatear fecha legible
  const fecha = error.ERRORDATETIME
    ? new Date(error.ERRORDATETIME).toLocaleString("es-MX", {
        dateStyle: "short",
        timeStyle: "medium",
      })
    : "Fecha desconocida";

  // Determinar color según estado
  const statusClass =
    error.STATUS === "RESOLVED"
      ? "resolved"
      : error.STATUS === "IGNORED"
      ? "ignored"
      : "unresolved";

  return (
    <div className="error-item">
      <div className="dot"></div>
      <div className="error-card">
        <Link to={`/errors/${error._id || error.ERRORID}`} className="error-link">

          <div className="error-card-header">
            {/* Avatar dinámico */}
            <img
              src={`https://i.pravatar.cc/50?u=${error.USER || "user"}`}
              alt={error.USER || "Usuario"}
              className="error-avatar"
            />
            <div>
              <h3 className="error-title">
                {error.ERRORCODE || "Sin código"} —{" "}
                {error.ERRORSOURCE || "Origen desconocido"}
              </h3>
              <p className="error-user">
                {error.USER || "Sin usuario"} — {fecha}
              </p>
            </div>
            <span className={`status ${statusClass}`}>
              {error.STATUS || "NEW"}
            </span>
          </div>

          <p className="error-message">
            {error.ERRORMESSAGE || "Sin descripción del error"}
          </p>
        </Link>
      </div>
    </div>
  );
};

export default ErrorCard;
