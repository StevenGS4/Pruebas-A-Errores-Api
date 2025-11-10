import React from "react";
import { NavLink } from "react-router-dom";
import "../styles/main.css";

const Sidebar = () => (
  <aside className="sidebar">
    <h2>☰ Menu</h2>
    <nav>
      <NavLink to="/" end>Dashboard</NavLink>
      <NavLink to="/errors">Error Log</NavLink>
    </nav>
  </aside>
);

export default Sidebar;
