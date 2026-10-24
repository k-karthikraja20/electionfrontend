import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../Services/api";
import {
  FaUsers,
  FaVoteYea,
  FaUserTie,
  FaClipboardCheck,
  FaUserShield,
  FaHourglassHalf,
  FaHistory,
  FaArrowRight,
} from "react-icons/fa";
import Loader from "../card/Loader";

function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/dashboard");
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="py-5 text-center">
        <Loader text="Loading Admin Statistics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger d-flex align-items-center justify-content-between p-3 rounded-3 my-4">
        <div>{error}</div>
        <button className="btn btn-sm btn-outline-danger" onClick={loadDashboard}>
          Retry
        </button>
      </div>
    );
  }

  const statCards = [
    {
      title: "Enrolled Students",
      value: data?.totalStudents ?? 0,
      icon: <FaUsers />,
      bg: "#EFF6FF",
      color: "#2563EB",
    },
    {
      title: "Active Elections",
      value: data?.activeElections ?? 0,
      icon: <FaVoteYea />,
      bg: "#FEF3C7",
      color: "#D97706",
    },
    {
      title: "Approved Candidates",
      value: data?.totalCandidates ?? 0,
      icon: <FaUserTie />,
      bg: "#DCFCE7",
      color: "#16A34A",
    },
    {
      title: "Total Ballots Cast",
      value: data?.totalVotes ?? 0,
      icon: <FaClipboardCheck />,
      bg: "#F3E8FF",
      color: "#9333EA",
    },
    {
      title: "Pending Nominations",
      value: data?.pendingApplications ?? 0,
      icon: <FaHourglassHalf />,
      bg: "#FEE2E2",
      color: "#DC2626",
    },
    {
      title: "Supervisors",
      value: data?.totalSupervisors ?? 0,
      icon: <FaUserShield />,
      bg: "#E0F2FE",
      color: "#0284C7",
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="page-header-box">
        <div>
          <h1 className="page-title">
            <span role="img" aria-label="admin">🗳️</span> Election Commission Dashboard
          </h1>
          <p className="page-subtitle">
            Real-time analytics, governance controls, and campus election oversight
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            onClick={() => navigate("/admin/manage-elections")}
            className="btn btn-primary d-flex align-items-center gap-2 fw-semibold"
          >
            <FaVoteYea /> Manage Elections
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        {statCards.map((card, idx) => (
          <div key={idx} className="stat-card">
            <div className="stat-header">
              <span className="stat-title">{card.title}</span>
              <div
                className="stat-icon"
                style={{ backgroundColor: card.bg, color: card.color }}
              >
                {card.icon}
              </div>
            </div>
            <div className="stat-value">{card.value}</div>
          </div>
        ))}
      </div>

      {/* Quick Management Actions */}
      <div className="modern-card mb-4">
        <div className="modern-card-header">
          <h5 className="modern-card-title">⚡ Quick Management Portals</h5>
        </div>
        <div className="modern-card-body">
          <div className="row g-3">
            <div className="col-md-3 col-sm-6">
              <button
                onClick={() => navigate("/admin/manage-students")}
                className="btn btn-outline-primary w-100 p-3 text-start rounded-3 d-flex flex-column gap-2"
              >
                <div className="d-flex align-items-center justify-content-between">
                  <FaUsers size={22} />
                  <FaArrowRight size={14} />
                </div>
                <strong className="text-dark">Manage Students</strong>
                <small className="text-muted">Register, edit, or search enrolled student records</small>
              </button>
            </div>

            <div className="col-md-3 col-sm-6">
              <button
                onClick={() => navigate("/admin/candidates")}
                className="btn btn-outline-primary w-100 p-3 text-start rounded-3 d-flex flex-column gap-2"
              >
                <div className="d-flex align-items-center justify-content-between">
                  <FaUserTie size={22} />
                  <FaArrowRight size={14} />
                </div>
                <strong className="text-dark">Candidate Applications</strong>
                <small className="text-muted">Review nominations, verify eligibility & assign symbols</small>
              </button>
            </div>

            <div className="col-md-3 col-sm-6">
              <button
                onClick={() => navigate("/admin/manage-supervisors")}
                className="btn btn-outline-primary w-100 p-3 text-start rounded-3 d-flex flex-column gap-2"
              >
                <div className="d-flex align-items-center justify-content-between">
                  <FaUserShield size={22} />
                  <FaArrowRight size={14} />
                </div>
                <strong className="text-dark">Manage Supervisors</strong>
                <small className="text-muted">Configure election officer and faculty supervisor access</small>
              </button>
            </div>

            <div className="col-md-3 col-sm-6">
              <button
                onClick={() => navigate("/admin/election-results")}
                className="btn btn-outline-primary w-100 p-3 text-start rounded-3 d-flex flex-column gap-2"
              >
                <div className="d-flex align-items-center justify-content-between">
                  <FaVoteYea size={22} />
                  <FaArrowRight size={14} />
                </div>
                <strong className="text-dark">Publish Results</strong>
                <small className="text-muted">Review calculated winners and publish official outcomes</small>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Requirement 24: Admin Dashboard Election Results Card */}
      <div className="modern-card mb-4 border border-primary border-opacity-25 shadow-sm">
        <div className="modern-card-header bg-light d-flex align-items-center justify-content-between">
          <h5 className="modern-card-title mb-0">
            <FaVoteYea className="text-primary" /> Election Results & Commission Publishing
          </h5>
          <span className="badge bg-secondary text-white py-1 px-3">
            Commission Status
          </span>
        </div>
        <div className="modern-card-body p-4">
          <div className="row align-items-center g-4">
            <div className="col-md-7">
              <h4 className="fw-bold text-dark mb-1">Campus Election Outcome Control</h4>
              <p className="text-muted small mb-3">
                Total Ballots Recorded: <strong>{data?.totalVotes ?? 0}</strong> • Active Contests: <strong>{data?.activeElections ?? 0}</strong>
              </p>
              <div className="d-flex align-items-center gap-3">
                <span className="text-muted small">Result Status:</span>
                <span className="badge bg-warning text-dark py-1 px-2">
                  Interim / Verification Mode
                </span>
              </div>
            </div>
            <div className="col-md-5 text-md-end">
              <div className="d-flex flex-wrap gap-2 justify-content-md-end">
                <button
                  onClick={() => navigate("/admin/election-results")}
                  className="btn btn-outline-primary fw-semibold"
                >
                  [Preview Results]
                </button>
                <button
                  onClick={() => navigate("/admin/election-results")}
                  className="btn btn-success fw-semibold shadow-sm"
                >
                  [Publish Results]
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Elections & Audit Trail */}
      <div className="row g-4">
        {/* Recent Elections */}
        <div className="col-lg-6">
          <div className="modern-card h-100">
            <div className="modern-card-header">
              <h5 className="modern-card-title">
                <FaVoteYea /> Active & Recent Elections
              </h5>
              <button
                className="btn btn-sm btn-link text-decoration-none"
                onClick={() => navigate("/admin/manage-elections")}
              >
                View all
              </button>
            </div>
            <div className="modern-card-body p-0">
              {data?.recentElections?.length > 0 ? (
                <div className="table-responsive-wrapper">
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Status</th>
                        <th>Dates</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentElections.map((el) => (
                        <tr key={el._id}>
                          <td className="fw-semibold">{el.title}</td>
                          <td>
                            <span className={`badge-custom badge-${el.status}`}>
                              {el.status}
                            </span>
                          </td>
                          <td className="text-muted small">
                            {new Date(el.startDate).toLocaleDateString()} –{" "}
                            {new Date(el.endDate).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 text-center text-muted">No elections created yet.</div>
              )}
            </div>
          </div>
        </div>

        {/* Audit Trail */}
        <div className="col-lg-6">
          <div className="modern-card h-100">
            <div className="modern-card-header">
              <h5 className="modern-card-title">
                <FaHistory /> Real-Time Governance Audit Trail
              </h5>
            </div>
            <div className="modern-card-body p-0">
              {data?.recentAudits?.length > 0 ? (
                <div className="table-responsive-wrapper">
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th>Action</th>
                        <th>User</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentAudits.map((audit) => (
                        <tr key={audit._id}>
                          <td>
                            <span className="badge bg-light text-dark border font-monospace" style={{ fontSize: "11px" }}>
                              {audit.action}
                            </span>
                          </td>
                          <td className="small">
                            {audit.performedByName} ({audit.role})
                          </td>
                          <td className="text-muted small">
                            {new Date(audit.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 text-center text-muted">No audit events recorded yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;