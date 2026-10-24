import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../Services/api";
import {
  FaUserShield,
  FaVoteYea,
  FaUserTie,
  FaClipboardList,
  FaChartLine,
  FaHistory,
  FaCheckCircle,
} from "react-icons/fa";
import Loader from "../card/Loader";

function SupervisorDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get("/supervisor/dashboard");
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load supervisor dashboard.");
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
        <Loader text="Loading Supervisor Analytics..." />
      </div>
    );
  }

  const statCards = [
    {
      title: "Active Elections",
      value: data?.activeElections ?? 0,
      icon: <FaVoteYea />,
      bg: "#EFF6FF",
      color: "#2563EB",
    },
    {
      title: "Approved Candidates",
      value: data?.approvedCandidates ?? 0,
      icon: <FaUserTie />,
      bg: "#DCFCE7",
      color: "#16A34A",
    },
    {
      title: "Pending Nominations",
      value: data?.pendingApplications ?? 0,
      icon: <FaClipboardList />,
      bg: "#FEF3C7",
      color: "#D97706",
    },
    {
      title: "Overall Voter Turnout",
      value: `${data?.turnoutRate ?? 0}%`,
      icon: <FaChartLine />,
      bg: "#F3E8FF",
      color: "#9333EA",
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="page-header-box">
        <div>
          <h1 className="page-title">
            <FaUserShield className="text-primary" /> Election Supervisor Dashboard
          </h1>
          <p className="page-subtitle">
            Oversee nomination eligibility, monitor voting integrity, and inspect privacy-preserving audit logs
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            onClick={() => navigate("/supervisor/manage-candidates")}
            className="btn btn-primary d-flex align-items-center gap-2 fw-semibold"
          >
            <FaClipboardList /> Review Nominations ({data?.pendingApplications ?? 0})
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger py-2 px-3 small rounded-3 mb-4">
          {error}
        </div>
      )}

      {/* Stats Grid */}
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

      {/* Requirement 25: Supervisor Dashboard Election Result Status Card */}
      <div className="modern-card mb-4 border border-secondary border-opacity-25">
        <div className="modern-card-header bg-light d-flex align-items-center justify-content-between">
          <h5 className="modern-card-title mb-0">
            <FaChartLine className="text-primary" /> Official Election Results Status
          </h5>
          <button
            onClick={() => navigate("/supervisor/election-results")}
            className="btn btn-sm btn-outline-primary"
          >
            Open Results Portal →
          </button>
        </div>
        <div className="modern-card-body p-4">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
            <div>
              <h6 className="fw-bold text-dark mb-1">Commission Certification & Result Gate</h6>
              <p className="text-muted small mb-0">
                Official vote counts and winner standings remain confidential until the Election Administrator publishes the certified tally.
              </p>
            </div>
            <div className="flex-shrink-0">
              <span className="badge bg-secondary text-white py-2 px-3 fs-6">
                🔒 Subject to Administrator Publication
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Monitored Elections & Turnout */}
      <div className="row g-4 mb-4">
        <div className="col-lg-7">
          <div className="modern-card h-100">
            <div className="modern-card-header">
              <h5 className="modern-card-title">
                <FaVoteYea /> Monitored Elections & Turnout
              </h5>
            </div>
            <div className="modern-card-body p-0">
              {data?.monitoredElections && data.monitoredElections.length > 0 ? (
                <div className="table-responsive-wrapper">
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th>Election</th>
                        <th>Status</th>
                        <th>Ballots Cast</th>
                        <th>Voter Turnout</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.monitoredElections.map((el) => (
                        <tr key={el._id}>
                          <td className="fw-semibold">{el.title}</td>
                          <td>
                            <span className={`badge-custom badge-${el.status}`}>
                              {el.status}
                            </span>
                          </td>
                          <td className="fw-bold text-primary">{el.totalVotes}</td>
                          <td style={{ minWidth: "160px" }}>
                            <div className="d-flex align-items-center gap-2">
                              <div className="progress flex-grow-1" style={{ height: "6px" }}>
                                <div
                                  className="progress-bar bg-success"
                                  style={{ width: `${el.turnoutPercent}%` }}
                                ></div>
                              </div>
                              <span className="small fw-semibold">{el.turnoutPercent}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 text-center text-muted">No monitored elections at this time.</div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Audit Events */}
        <div className="col-lg-5">
          <div className="modern-card h-100">
            <div className="modern-card-header">
              <h5 className="modern-card-title">
                <FaHistory /> Recent Supervisory Audit Events
              </h5>
            </div>
            <div className="modern-card-body p-0">
              {data?.recentAuditLogs && data.recentAuditLogs.length > 0 ? (
                <div className="table-responsive-wrapper">
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th>Action</th>
                        <th>Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentAuditLogs.map((log) => (
                        <tr key={log._id}>
                          <td>
                            <div className="fw-semibold font-monospace small">{log.action}</div>
                            <small className="text-muted">{log.performedByName} ({log.role})</small>
                          </td>
                          <td className="small text-muted">
                            {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 text-center text-muted">No audit events recorded.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SupervisorDashboard;