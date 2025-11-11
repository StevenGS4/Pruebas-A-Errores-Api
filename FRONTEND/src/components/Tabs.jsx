import React, { useState } from "react";
import "../styles/errordetail.css";

/**
 * 🔹 Componente de pestañas estilizado
 */
const Tabs = ({ tabs }) => {
  const [active, setActive] = useState(0);

  return (
    <div className="tabs-container">
      {/* Botones de pestañas */}
      <div className="tab-buttons">
        {tabs.map((tab, i) => (
          <button
            key={i}
            className={`tab-btn ${active === i ? "active" : ""}`}
            onClick={() => setActive(i)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      <div className="tab-content">{tabs[active].content}</div>
    </div>
  );
};

export default Tabs;
