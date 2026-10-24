import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaBars,
  FaBell,
  FaUserCircle,
  FaSignOutAlt,
  FaCheckCircle,
  FaInfoCircle,
} from "react-icons/fa";
import { useAuth } from "../Context/AuthContext";

function CandidateNavbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to sign out of the Candidate Portal?")) {
      await logout();
      navigate("/login");
    }
  };

  return (
    <header className="navbar navbar-expand-lg bg-white border-bottom shadow-sm sticky-top px-3 py-2">
      <div className="container-fluid px-0 d-flex align-items-center justify-content-between">
        {/* Left: Mobile Toggle & Brand / Title */}
        <div className="d-flex align-items-center gap-2 gap-md-3">
          <button
            className="btn btn-outline-primary d-lg-none p-2 rounded-2"
            onClick={onToggleSidebar}
            aria-label="Toggle Navigation"
          >
            <FaBars />
          </button>

          <Link
            to="/candidate/dashboard"
            className="navbar-brand d-flex align-items-center gap-2 mb-0 text-decoration-none"
          >
            <span
              className="rounded-3 bg-primary text-white d-inline-flex align-items-center justify-content-center shadow-sm"
              style={{ width: "36px", height: "36px", fontSize: "18px" }}
            >
              🗳️
            </span>
            <span className="fw-bold text-primary d-none d-sm-inline" style={{ fontSize: "18px" }}>
              Campus Election
            </span>
          </Link>

          <span className="text-secondary d-none d-md-inline small border-start ps-3">
            Campus Election Voting System
          </span>
        </div>

        {/* Right: Notifications, Profile, and Logout */}
        <div className="d-flex align-items-center gap-2 gap-sm-3">
          {/* Notifications Dropdown */}
          <div className="position-relative">
            <button
              className="btn btn-light position-relative p-2 rounded-circle border text-secondary"
              onClick={() => setShowNotifications(!showNotifications)}
              title="Notifications"
              type="button"
            >
              <FaBell />
              <span
                className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle"
                style={{ width: "10px", height: "10px" }}
              >
                <span className="visually-hidden">New alerts</span>
              </span>
            </button>

            {showNotifications && (
              <div
                className="dropdown-menu dropdown-menu-end show position-absolute mt-2 shadow-lg border-0 rounded-3 p-3"
                style={{ width: "300px", right: 0, zIndex: 1050 }}
              >
                <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-2">
                  <h6 className="fw-bold mb-0 text-dark">Election Alerts</h6>
                  <span className="badge bg-primary-subtle text-primary small">Recent</span>
                </div>
                <div className="small text-muted mb-2 d-flex align-items-start gap-2">
                  <FaCheckCircle className="text-success mt-1 flex-shrink-0" />
                  <div>Candidate application submitted successfully. Dual review in progress.</div>
                </div>
                <div className="small text-muted d-flex align-items-start gap-2">
                  <FaInfoCircle className="text-primary mt-1 flex-shrink-0" />
                  <div>Make sure your academic transcripts are verified with the Supervisor.</div>
                </div>
              </div>
            )}
          </div>

          {/* Candidate Profile Info */}
          <div className="d-flex align-items-center gap-2 border-start ps-2 ps-sm-3">
            <div
              className="rounded-circle bg-primary text-white fw-bold d-flex align-items-center justify-content-center shadow-sm"
              style={{ width: "36px", height: "36px", fontSize: "14px" }}
              title={user?.name || "Candidate"}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : <FaUserCircle />}
            </div>

            <div className="d-none d-md-block text-start">
              <div className="fw-bold text-dark lh-sm" style={{ fontSize: "14px" }}>
                {user?.name || "Candidate"}
              </div>
              <small className="text-muted d-block" style={{ fontSize: "11px" }}>
                {user?.regNo || user?.department || "Candidate"}
              </small>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1 rounded-2 px-2 py-1 ms-1"
            title="Log Out"
          >
            <FaSignOutAlt />
            <span className="d-none d-sm-inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default CandidateNavbar;