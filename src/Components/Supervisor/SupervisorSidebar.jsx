import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaUserCheck,
  FaShieldAlt,
  FaChartBar,
  FaSignOutAlt,
  FaTimes,
} from "react-icons/fa";
import { useAuth } from "../Context/AuthContext";

function SupervisorSidebar({ open, onClose }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out of the Supervisor Portal?")) {
      await logout();
      navigate("/login");
    }
  };

  const navItems = [
    { to: "/supervisor/dashboard", label: "Dashboard", icon: <FaHome /> },
    { to: "/supervisor/manage-candidates", label: "Candidate Applications", icon: <FaUserCheck /> },
    { to: "/supervisor/approve-votes", label: "Election Monitoring", icon: <FaShieldAlt /> },
    { to: "/supervisor/election-results", label: "Results & Turnout", icon: <FaChartBar /> },
  ];

  return (
    <aside className={`sidebar-container ${open ? "open" : ""}`}>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between p-3 border-bottom border-secondary border-opacity-25">
        <div className="d-flex align-items-center gap-2">
          <div className="rounded-3 bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: 38, height: 38, fontSize: 20 }}>
            🗳️
          </div>
          <div>
            <h6 className="fw-bold mb-0 text-white">Campus Vote</h6>
            <small className="text-secondary" style={{ fontSize: "11px" }}>Election Supervisor</small>
          </div>
        </div>
        {onClose && (
          <button className="btn btn-sm btn-link text-white d-lg-none p-0" onClick={onClose}>
            <FaTimes size={18} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="d-flex flex-column gap-1 p-3 flex-grow-1 overflow-auto">
        <div className="text-uppercase text-secondary fw-bold mb-2 px-2" style={{ fontSize: "10px", letterSpacing: "1px" }}>
          Supervisor Menu
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              `d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-decoration-none transition-all ${
                isActive
                  ? "bg-primary text-white fw-bold shadow-sm"
                  : "text-light text-opacity-75 hover-bg-dark"
              }`
            }
            style={{ fontSize: "14px" }}
          >
            <span style={{ fontSize: "16px" }}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>

      {/* Profile & Logout */}
      <div className="p-3 border-top border-secondary border-opacity-25 bg-black bg-opacity-25">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2 overflow-hidden">
            <div className="rounded-circle bg-success text-white fw-bold d-flex align-items-center justify-content-center" style={{ width: 34, height: 34, minWidth: 34 }}>
              {user?.name?.charAt(0) || "S"}
            </div>
            <div className="overflow-hidden">
              <p className="mb-0 text-white text-truncate fw-semibold" style={{ fontSize: "13px" }}>
                {user?.name || "Supervisor"}
              </p>
              <small className="text-secondary" style={{ fontSize: "11px" }}>
                Election Officer
              </small>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center p-2 rounded-2"
            title="Sign Out"
          >
            <FaSignOutAlt />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default SupervisorSidebar;