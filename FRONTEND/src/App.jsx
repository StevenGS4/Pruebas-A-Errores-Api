import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ErrorLog from "./pages/ErrorLog.jsx";
import ErrorDetail from "./pages/ErrorDetail.jsx";
import "./styles/main.css";

function App() {
  return (
    <Router>
      <div className="layout">
        {/* Barra lateral persistente */}
        <Sidebar />

        {/* Contenido principal */}
        <div className="content">
          <Navbar />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/errors" element={<ErrorLog />} />
            <Route path="/errors/:id" element={<ErrorDetail />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

