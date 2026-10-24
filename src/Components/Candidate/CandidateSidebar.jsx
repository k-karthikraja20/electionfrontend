import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaUserTie,
  FaFileAlt,
  FaClipboardCheck,
  FaCalendarAlt,
  FaBell,
  FaSignOutAlt,
  FaTimes,
  FaVoteYea,
} from "react-icons/fa";
import { useAuth } from "../Context/AuthContext";

function CandidateSidebar({ open, onClose }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out of the Candidate Portal?")) {
      await logout();
      navigate("/login");
    }
  };

  const navItems = [
    { to: "/candidate/dashboard", label: "Dashboard", icon: <FaHome /> },
    { to: "/candidate/profile", label: "Candidate Profile", icon: <FaUserTie /> },
    { to: "/candidate/eligibility", label: "Candidate Eligibility Form", icon: <FaFileAlt /> },
    {
      to: "/candidate/application-status",
      label: "Application Status",
      icon: <FaClipboardCheck />,
    },
    { to: "/candidate/election-status", label: "Election Schedule", icon: <FaCalendarAlt /> },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {open && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-lg-none"
          style={{ zIndex: 1040 }}
          onClick={onClose}
        />
      )}

      <aside
        className={`sidebar-container ${open ? "open" : ""}`}
        style={{
          backgroundColor: "#0f172a",
          color: "#e2e8f0",
          zIndex: 1045,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Sidebar Header */}
        <div className="d-flex align-items-center justify-content-between p-3 border-bottom border-secondary border-opacity-25">
          <div className="d-flex align-items-center gap-2">
            <div
              className="rounded-3 bg-primary text-white d-flex align-items-center justify-content-center shadow-sm"
              style={{ width: "38px", height: "38px", fontSize: "20px" }}
            >
              🗳️
            </div>
            <div>
              <h6 className="fw-bold mb-0 text-white" style={{ letterSpacing: "0.5px" }}>
                Campus Vote
              </h6>
              <small className="text-secondary" style={{ fontSize: "11px" }}>
                Candidate Portal
              </small>
            </div>
          </div>
          {onClose && (
            <button className="btn btn-sm btn-link text-white d-lg-none p-0" onClick={onClose}>
              <FaTimes size={18} />
            </button>
          )}
        </div>

        {/* Sidebar Navigation */}
        <div className="d-flex flex-column gap-1 p-3 flex-grow-1 overflow-auto">
          <div
            className="text-uppercase text-secondary fw-bold mb-2 px-2"
            style={{ fontSize: "11px", letterSpacing: "1px" }}
          >
            Candidate Menu
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

          {/* 6. Notifications in Menu */}
          <button
            type="button"
            className="btn d-flex align-items-center justify-content-between text-start gap-3 px-3 py-2 rounded-3 text-decoration-none text-light text-opacity-75 hover-bg-dark border-0 w-100"
            style={{ fontSize: "14px", background: "transparent" }}
            onClick={() => alert("Notification center: All official updates regarding your candidacy appear here.")}
          >
            <div className="d-flex align-items-center gap-3">
              <span style={{ fontSize: "16px" }}>
                <FaBell />
              </span>
              <span>Notifications</span>
            </div>
            <span className="badge bg-danger rounded-pill" style={{ fontSize: "10px" }}>
              2
            </span>
          </button>

          <hr className="border-secondary border-opacity-25 my-2" />

          {/* Student Voter Portal Switch Link */}
          <NavLink
            to="/student/dashboard"
            onClick={onClose}
            className="d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-decoration-none text-info text-opacity-75"
            style={{ fontSize: "13px" }}
          >
            <span style={{ fontSize: "15px" }}>
              <FaVoteYea />
            </span>
            <span>Switch to Student Voting</span>
          </NavLink>
        </div>

        {/* 7. Profile & Logout Footer */}
        <div className="p-3 border-top border-secondary border-opacity-25 bg-black bg-opacity-25">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2 overflow-hidden">
              <div
                className="rounded-circle bg-warning text-dark fw-bold d-flex align-items-center justify-content-center shadow-sm"
                style={{ width: "34px", height: "34px", minWidth: "34px", fontSize: "14px" }}
              >
                {user?.name?.charAt(0) || "C"}
              </div>
              <div className="overflow-hidden">
                <p className="mb-0 text-white text-truncate fw-semibold" style={{ fontSize: "13px" }}>
                  {user?.name || "Candidate"}
                </p>
                <small className="text-warning fw-semibold" style={{ fontSize: "11px" }}>
                  Nominated Candidate
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
    </>
  );
}

export default CandidateSidebar;