import React, { useEffect, useState } from "react";
import api from "../Services/api";
import {
  FaUserTie,
  FaCheckCircle,
  FaTimesCircle,
  FaSearch,
  FaInfoCircle,
  FaAward,
} from "react-icons/fa";
import Loader from "../card/Loader";

function ManageCandidates() {
  const [candidates, setCandidates] = useState([]);
  const [symbols, setSymbols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Approval modal state
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedSymbolCode, setSelectedSymbolCode] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewModalMode, setReviewModalMode] = useState("approve"); // 'approve' | 'reject'

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appRes, symRes] = await Promise.all([
        api.get("/candidate-applications"),
        api.get("/candidate-applications/supported-symbols"),
      ]);

      if (appRes.data.success) {
        setCandidates(appRes.data.data);
      }
      if (symRes.data.success) {
        setSymbols(symRes.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load candidate applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openReviewModal = (cand, mode) => {
    setSelectedCandidate(cand);
    setReviewModalMode(mode);
    setReviewComment("");
    if (mode === "approve" && symbols.length > 0) {
      const available = symbols.find((s) => !s.isTaken) || symbols[0];
      setSelectedSymbolCode(available.code);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCandidate) return;

    setError("");
    setSuccess("");

    try {
      const candidateId = selectedCandidate._id;

      if (reviewModalMode === "approve") {
        const symbolObj = symbols.find((s) => s.code === selectedSymbolCode);
        const payload = {
          reviewComment,
          ...(symbolObj ? { assignedSymbol: symbolObj } : {}),
        };

        const res = await api.put(`/candidates/${candidateId}/admin-approve`, payload);
        if (res.data.success) {
          setSuccess(res.data.message || "Admin approval recorded successfully.");
          setSelectedCandidate(null);
          fetchData();
        }
      } else {
        const res = await api.put(`/candidates/${candidateId}/admin-reject`, {
          rejectionReason: reviewComment || "Rejected by Administrator.",
        });
        if (res.data.success) {
          setSuccess("Candidate rejected by Administrator.");
          setSelectedCandidate(null);
          fetchData();
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Action failed.");
    }
  };

  const filteredCandidates = candidates.filter((cand) => {
    const student = cand.studentId || cand.candidateId || {};
    const matchesSearch =
      student.name?.toLowerCase().includes(search.toLowerCase()) ||
      student.regNo?.toLowerCase().includes(search.toLowerCase()) ||
      cand.positionId?.title?.toLowerCase().includes(search.toLowerCase()) ||
      cand.electionId?.title?.toLowerCase().includes(search.toLowerCase());

    const status = cand.approvalStatus || cand.status || "pending";
    const matchesStatus = filterStatus === "all" || status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading && candidates.length === 0) {
    return (
      <div className="py-5 text-center">
        <Loader text="Loading Candidate Queue..." />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header-box mb-4">
        <div>
          <h1 className="page-title">
            <FaUserTie /> Admin Candidate Management
          </h1>
          <p className="page-subtitle">
            Review candidate applications, verify academic percentage criteria, and register Admin approvals (requires dual Supervisor sign-off)
          </p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert alert-danger py-2 px-3 small rounded-3 d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center gap-2">
            <FaInfoCircle /> {error}
          </div>
          <button className="btn-close btn-sm" onClick={() => setError("")}></button>
        </div>
      )}

      {success && (
        <div className="alert alert-success py-2 px-3 small rounded-3 d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center gap-2">
            <FaCheckCircle /> {success}
          </div>
          <button className="btn-close btn-sm" onClick={() => setSuccess("")}></button>
        </div>
      )}

      {/* Filter and Search */}
      <div className="modern-card p-3 mb-4">
        <div className="row g-2 align-items-center">
          <div className="col-md-6">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light text-muted">
                <FaSearch />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search candidate name, reg number, position, or election..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-6 text-md-end">
            <div className="btn-group btn-group-sm">
              <button
                type="button"
                className={`btn ${filterStatus === "all" ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() => setFilterStatus("all")}
              >
                All ({candidates.length})
              </button>
              <button
                type="button"
                className={`btn ${filterStatus === "pending" ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() => setFilterStatus("pending")}
              >
                Pending ({candidates.filter((c) => (c.approvalStatus || c.status) === "pending").length})
              </button>
              <button
                type="button"
                className={`btn ${filterStatus === "approved" ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() => setFilterStatus("approved")}
              >
                Approved ({candidates.filter((c) => (c.approvalStatus || c.status) === "approved").length})
              </button>
              <button
                type="button"
                className={`btn ${filterStatus === "rejected" ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() => setFilterStatus("rejected")}
              >
                Rejected ({candidates.filter((c) => (c.approvalStatus || c.status) === "rejected").length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Candidates Table */}
      <div className="modern-card">
        <div className="modern-card-header">
          <h5 className="modern-card-title">Candidate Applications Queue</h5>
        </div>
        <div className="modern-card-body p-0">
          <div className="table-responsive-wrapper">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Candidate Name</th>
                  <th>Registration No</th>
                  <th>Election</th>
                  <th>Position</th>
                  <th>Academic %</th>
                  <th>Manifesto</th>
                  <th>Application Status</th>
                  <th>Admin Approval</th>
                  <th>Supervisor Approval</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.map((cand) => {
                  const student = cand.studentId || cand.candidateId || {};
                  const candScore = student.academicPercentage ?? 0;
                  const reqScore = cand.positionId?.minAcademicPercentage ?? 70;
                  const isEligible = candScore >= reqScore;

                  const adminStat = cand.adminApproval?.status || (cand.approvalStatus === "approved" ? "approved" : "pending");
                  const supStat = cand.supervisorApproval?.status || (cand.approvalStatus === "approved" ? "approved" : "pending");
                  const overall = cand.approvalStatus || cand.status || "pending";

                  return (
                    <tr key={cand._id}>
                      <td>
                        <div className="fw-bold">{student.name || "Student"}</div>
                        <small className="text-muted">{student.department}</small>
                      </td>
                      <td>
                        <span className="font-monospace small">{student.regNo || "—"}</span>
                      </td>
                      <td>
                        <div className="fw-semibold text-truncate" style={{ maxWidth: "150px" }}>
                          {cand.electionId?.title}
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          {cand.positionId?.title}
                        </span>
                      </td>
                      <td>
                        <strong className={isEligible ? "text-success" : "text-danger"}>
                          {candScore}%
                        </strong>
                        <small className="text-muted d-block" style={{ fontSize: "10px" }}>
                          Req: {reqScore}%
                        </small>
                      </td>
                      <td style={{ maxWidth: "160px" }}>
                        <div
                          className="small text-truncate text-secondary"
                          title={cand.manifesto || "No manifesto statement"}
                        >
                          "{cand.manifesto || "—"}"
                        </div>
                      </td>
                      <td>
                        <span className={`badge-custom badge-${overall}`}>
                          {overall.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        {adminStat === "approved" ? (
                          <span className="badge bg-success text-white">✓ Approved</span>
                        ) : adminStat === "rejected" ? (
                          <span className="badge bg-danger text-white">✗ Rejected</span>
                        ) : (
                          <span className="badge bg-warning text-dark">Pending</span>
                        )}
                      </td>
                      <td>
                        {supStat === "approved" ? (
                          <span className="badge bg-success text-white">✓ Approved</span>
                        ) : supStat === "rejected" ? (
                          <span className="badge bg-danger text-white">✗ Rejected</span>
                        ) : (
                          <span className="badge bg-warning text-dark">Pending</span>
                        )}
                      </td>
                      <td>
                        {adminStat === "pending" && overall !== "rejected" ? (
                          <div className="d-flex gap-1">
                            <button
                              onClick={() => openReviewModal(cand, "approve")}
                              className="btn btn-sm btn-success py-1 px-2 d-flex align-items-center gap-1"
                              title="Admin Approve"
                            >
                              <FaCheckCircle /> Approve
                            </button>
                            <button
                              onClick={() => openReviewModal(cand, "reject")}
                              className="btn btn-sm btn-outline-danger py-1 px-2 d-flex align-items-center gap-1"
                              title="Admin Reject"
                            >
                              <FaTimesCircle /> Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-muted small">
                            {adminStat === "approved" ? "Admin Signed ✓" : "Processed"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {filteredCandidates.length === 0 && (
                  <tr>
                    <td colSpan="9" className="text-center py-4 text-muted">
                      No candidate applications match your current search and filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {selectedCandidate && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">
                  {reviewModalMode === "approve"
                    ? "Admin Approval & Symbol Confirmation"
                    : "Reject Candidate Application"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedCandidate(null)}
                ></button>
              </div>
              <form onSubmit={handleReviewSubmit}>
                <div className="modal-body p-4">
                  <div className="bg-light p-3 rounded-3 mb-3 small">
                    <div className="fw-bold text-dark">
                      {(selectedCandidate.studentId || selectedCandidate.candidateId)?.name}
                    </div>
                    <div className="text-muted">
                      Position: <strong>{selectedCandidate.positionId?.title}</strong> ({selectedCandidate.electionId?.title})
                    </div>
                    <div className="text-muted">
                      Academic Score:{" "}
                      <strong>
                        {(selectedCandidate.studentId || selectedCandidate.candidateId)?.academicPercentage}%
                      </strong>{" "}
                      (Min required: {selectedCandidate.positionId?.minAcademicPercentage}%)
                    </div>
                    {selectedCandidate.manifesto && (
                      <div className="mt-2 text-dark fst-italic">
                        "{selectedCandidate.manifesto}"
                      </div>
                    )}
                  </div>

                  {reviewModalMode === "approve" ? (
                    <div className="form-group mb-3">
                      <label className="form-label small fw-bold">Confirm / Assign Unique Symbol</label>
                      <select
                        className="form-select"
                        value={selectedSymbolCode}
                        onChange={(e) => setSelectedSymbolCode(e.target.value)}
                      >
                        {symbols.map((sym) => (
                          <option key={sym.code} value={sym.code} disabled={sym.isTaken}>
                            {sym.icon} {sym.name} {sym.isTaken ? "(Taken)" : ""}
                          </option>
                        ))}
                      </select>
                      <small className="text-muted" style={{ fontSize: "11px" }}>
                        Each candidate contesting the same position must possess a unique symbol.
                      </small>
                    </div>
                  ) : (
                    <div className="alert alert-warning py-2 small mb-3">
                      Rejecting will mark the application as rejected by Admin and prevent the candidate from participating.
                    </div>
                  )}

                  <div className="form-group mb-2">
                    <label className="form-label small fw-bold">Reviewer Note / Justification</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder={reviewModalMode === "approve" ? "e.g. Eligibility and credentials verified." : "Enter rejection reason..."}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      required={reviewModalMode === "reject"}
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer border-top p-3">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setSelectedCandidate(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`btn btn-sm ${reviewModalMode === "approve" ? "btn-success" : "btn-danger"} px-3`}
                  >
                    {reviewModalMode === "approve" ? "Confirm Admin Approval" : "Confirm Rejection"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageCandidates;