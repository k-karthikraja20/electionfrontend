import React from "react";
import { FaBars, FaEye } from "react-icons/fa";
import { useAuth } from "../Context/AuthContext";

function SupervisorNavbar({ onToggleSidebar }) {
  const { user } = useAuth();

  return (
    <header className="top-navbar">
      <div className="d-flex align-items-center gap-3">
        <button
          className="btn btn-outline-secondary d-lg-none d-flex align-items-center justify-content-center p-2 rounded-2"
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation"
        >
          <FaBars />
        </button>
        <span className="badge-custom badge-approved">
          <FaEye /> Supervisory Watch Active
        </span>
        <span className="d-none d-md-inline text-muted" style={{ fontSize: "13px" }}>
          Campus Election Monitoring & Compliance
        </span>
      </div>

      <div className="d-flex align-items-center gap-3">
        <div className="text-end d-none d-sm-block">
          <div className="fw-bold" style={{ fontSize: "14px", color: "var(--color-primary-dark)" }}>
            {user?.name || "Election Supervisor"}
          </div>
          <small className="text-muted" style={{ fontSize: "12px" }}>
            Faculty Election Officer
          </small>
        </div>
        <div
          className="rounded-circle bg-success text-white fw-bold d-flex align-items-center justify-content-center shadow-sm"
          style={{ width: 38, height: 38, fontSize: "15px" }}
        >
          {user?.name?.charAt(0) || "S"}
        </div>
      </div>
    </header>
  );
}

export default SupervisorNavbar;