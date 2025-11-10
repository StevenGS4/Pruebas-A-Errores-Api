import React from "react";
import "../styles/main.css";

const Navbar = () => (
  <header className="navbar">
    <h1>Error Manager</h1>
    <div className="user-info">
      <img src="https://i.imgur.com/JqEuJ6t.png" alt="Admin" />
      <span>Administrator ▾</span>
    </div>
  </header>
);

export default Navbar;
