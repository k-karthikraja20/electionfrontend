import React, { useEffect, useState } from "react";
import api from "../Services/api";
import {
  FaShieldAlt,
  FaSearch,
  FaCheckCircle,
  FaLock,
  FaInfoCircle,
  FaFileInvoice,
} from "react-icons/fa";
import Loader from "../card/Loader";

function SupervisorElectionMonitoring() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchMonitoringLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get("/supervisor/vote-monitoring", {
        params: { search },
      });
      if (res.data.success) {
        setLogs(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load vote monitoring audit trail.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitoringLogs();
  }, [search]);

  return (
    <div>
      {/* Header */}
      <div className="page-header-box">
        <div>
          <h1 className="page-title">
            <FaShieldAlt className="text-primary" /> Election Monitoring & Vote Audit Trail
          </h1>
          <p className="page-subtitle">
            Inspect real-time verified ballot receipts and voter turnout logs without compromising secret-ballot privacy
          </p>
        </div>
      </div>

      {/* Secret-Ballot Privacy Alert Banner */}
      <div className="alert alert-info border border-info-subtle rounded-3 p-3 mb-4 d-flex align-items-start gap-3">
        <div className="rounded-circle bg-info text-white p-2 mt-1" style={{ fontSize: "18px" }}>
          <FaLock />
        </div>
        <div>
          <h6 className="fw-bold mb-1 text-dark">Secret-Ballot Privacy Guarantee</h6>
          <p className="small mb-0 text-secondary">
            In compliance with campus election governance rules, individual student ballot selections are
            cryptographically decoupled from voter identity at the instant of submission. Supervisors monitor
            submission timestamps, election positions, and receipt hashes to prevent fraud and ensure
            one-vote-per-position enforcement, while strictly preserving voter secrecy.
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3">
          {error}
        </div>
      )}

      {/* Search Filter */}
      <div className="modern-card p-3 mb-4">
        <div className="input-group input-group-sm">
          <span className="input-group-text bg-light text-muted">
            <FaSearch />
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Search by student name, register number, or receipt ID (e.g. RCPT-)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="modern-card">
        <div className="modern-card-header">
          <h5 className="modern-card-title">
            <FaFileInvoice /> Verified Ballot Submissions ({logs.length})
          </h5>
        </div>
        <div className="modern-card-body p-0">
          {loading ? (
            <div className="p-4 text-center">
              <Loader text="Fetching Verified Ballots..." />
            </div>
          ) : (
            <div className="table-responsive-wrapper">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Receipt Reference</th>
                    <th>Voter Name</th>
                    <th>Register Number</th>
                    <th>Department</th>
                    <th>Election</th>
                    <th>Position</th>
                    <th>Submission Timestamp</th>
                    <th>Ballot Status</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td className="fw-bold font-monospace text-primary">
                        {log.receiptId}
                      </td>
                      <td className="fw-semibold">{log.studentName}</td>
                      <td className="text-muted small">{log.regNo}</td>
                      <td>{log.department}</td>
                      <td className="small">{log.election}</td>
                      <td className="fw-semibold">{log.position}</td>
                      <td className="small text-muted">
                        {new Date(log.timestamp).toLocaleString([], {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </td>
                      <td>
                        <span className="badge-custom badge-approved">
                          <FaCheckCircle /> {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {logs.length === 0 && (
                    <tr>
                      <td colSpan="8" className="text-center py-4 text-muted">
                        No vote records found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SupervisorElectionMonitoring;