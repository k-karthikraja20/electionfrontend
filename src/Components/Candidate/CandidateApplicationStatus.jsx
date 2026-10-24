import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../Services/api";
import {
  FaUserTie,
  FaCheckCircle,
  FaHourglassHalf,
  FaTimesCircle,
  FaShieldAlt,
  FaUserShield,
  FaRedo,
  FaAward,
  FaInfoCircle,
  FaCalendarAlt,
  FaVoteYea,
  FaIdCard,
  FaGraduationCap,
} from "react-icons/fa";
import { useAuth } from "../Context/AuthContext";

function CandidateApplicationStatus() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchApplicationStatus = async () => {
    try {
      setLoading(true);
      setError("");

      // Support both /candidates/status and /candidate/application-status endpoints
      const res = await api
        .get("/candidate/application-status")
        .catch(() => api.get("/candidates/status"));

      if (res.data?.success) {
        setStatusData(res.data);
      } else {
        setStatusData(null);
      }
    } catch (err) {
      console.error("Failed to load candidate application status:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load candidate application status. Please check your network connection."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicationStatus();
  }, []);

  // Helper for badge color based on status
  const getBadgeClass = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "approved") return "badge bg-success text-white";
    if (s === "rejected") return "badge bg-danger text-white";
    return "badge bg-warning text-dark";
  };

  const getStatusLabel = (status) => {
    const s = (status || "pending").toUpperCase();
    return s;
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary mb-3" style={{ width: "3rem", height: "3rem" }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <h5 className="text-secondary fw-semibold">Loading Candidate Application Status...</h5>
        <p className="text-muted small">Verifying institutional records and dual-approval signatures</p>
      </div>
    );
  }

  const hasApp = statusData?.hasApplication;
  const app = statusData?.data || statusData?.application;
  const overallStatus = (statusData?.approvalStatus || app?.approvalStatus || "pending").toLowerCase();
  const adminStatus = (statusData?.adminApproval?.status || app?.adminApproval?.status || "pending").toLowerCase();
  const supervisorStatus = (
    statusData?.supervisorApproval?.status ||
    app?.supervisorApproval?.status ||
    "pending"
  ).toLowerCase();

  const adminComment =
    statusData?.adminApproval?.reviewComment ||
    app?.adminApproval?.reviewComment ||
    app?.adminApproval?.comments ||
    "Awaiting administrator review.";
  const supervisorComment =
    statusData?.supervisorApproval?.reviewComment ||
    app?.supervisorApproval?.reviewComment ||
    app?.supervisorApproval?.comments ||
    "Awaiting supervisor academic review.";

  const rejectionReason =
    statusData?.rejectionReason || app?.rejectionReason || (overallStatus === "rejected" ? "Requirements not fulfilled." : null);

  const studentInfo = app?.studentId || app?.candidateId || user || {};
  const electionInfo = app?.electionId || {};
  const positionInfo = app?.positionId || {};
  const assignedSymbol = app?.assignedSymbol;

  // Timeline Step calculation
  const isStep1Complete = Boolean(hasApp);
  const isStep2Complete = supervisorStatus === "approved";
  const isStep3Complete = adminStatus === "approved";
  const isStep4Complete = Boolean(assignedSymbol && (adminStatus === "approved" || supervisorStatus === "approved"));
  const isStep5Complete = overallStatus === "approved";

  return (
    <div className="container-fluid px-0">
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <FaUserTie className="text-primary" /> Candidate Application Status
          </h2>
          <p className="text-muted small mb-0">
            Real-time verification timeline and institutional sign-off monitoring for campus elections
          </p>
        </div>

        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2 px-3 py-2 shadow-sm rounded-3"
            onClick={fetchApplicationStatus}
          >
            <FaRedo /> Refresh Status
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm d-flex align-items-center gap-2 px-3 py-2 shadow-sm rounded-3"
            onClick={() => navigate("/candidate/dashboard")}
          >
            <FaVoteYea /> Candidate Dashboard
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show rounded-3 shadow-sm mb-4" role="alert">
          <div className="d-flex align-items-center gap-2">
            <FaInfoCircle className="flex-shrink-0" />
            <div>{error}</div>
          </div>
          <button type="button" className="btn-close" onClick={() => setError("")}></button>
        </div>
      )}

      {/* When No Application is Found */}
      {!hasApp && (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center my-4 bg-white">
          <div className="mb-3 text-muted" style={{ fontSize: "54px" }}>
            📝
          </div>
          <h4 className="fw-bold text-dark mb-2">No Active Candidate Application Found</h4>
          <p className="text-muted mb-4 mx-auto" style={{ maxWidth: "560px", fontSize: "14px" }}>
            You have not submitted a candidacy nomination form for any active campus election yet. Complete the
            Candidate Eligibility Form to begin your verification journey.
          </p>
          <div>
            <button
              onClick={() => navigate("/candidate/eligibility")}
              className="btn btn-primary px-4 py-2 fw-semibold rounded-3 shadow-sm"
            >
              Open Candidate Eligibility Form
            </button>
          </div>
        </div>
      )}

      {/* If Application Exists */}
      {hasApp && (
        <>
          {/* Main Status Hero Banner */}
          <div
            className={`card border-0 shadow-sm rounded-4 p-4 mb-4 ${
              overallStatus === "approved"
                ? "bg-success text-white"
                : overallStatus === "rejected"
                ? "bg-danger text-white"
                : "bg-warning bg-opacity-25 border border-warning"
            }`}
          >
            <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
              <div className="d-flex align-items-center gap-3">
                <div className="fs-1">
                  {overallStatus === "approved" ? (
                    <FaCheckCircle className="text-white" />
                  ) : overallStatus === "rejected" ? (
                    <FaTimesCircle className="text-white" />
                  ) : (
                    <FaHourglassHalf className="text-warning" />
                  )}
                </div>
                <div>
                  <h4 className="fw-bold mb-1">
                    {overallStatus === "approved"
                      ? "Candidacy Approved & Certified!"
                      : overallStatus === "rejected"
                      ? "Candidate Application Rejected"
                      : "Candidate Application Pending Dual Verification"}
                  </h4>
                  <p className="mb-0 small opacity-75">
                    {overallStatus === "approved"
                      ? "Congratulations! Your nomination has received full institutional clearance from both Admin and Supervisor."
                      : overallStatus === "rejected"
                      ? "Your candidate nomination was reviewed and not approved by the election oversight committee."
                      : "Your application is currently being scrutinized by the Supervisor (academic criteria) and Admin (quota & symbol assignment)."}
                  </p>
                </div>
              </div>

              <div className="flex-shrink-0">
                <span
                  className={`fs-6 px-4 py-2 fw-bold rounded-pill shadow-sm ${getBadgeClass(
                    overallStatus
                  )}`}
                >
                  APPLICATION STATUS: {getStatusLabel(overallStatus)}
                </span>
              </div>
            </div>

            {rejectionReason && (
              <div className="mt-3 p-3 bg-white text-danger rounded-3 small border border-danger-subtle fw-semibold">
                <strong>Rejection Notice: </strong> {rejectionReason}
              </div>
            )}
          </div>

          {/* Progress Timeline Section */}
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
            <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <FaCalendarAlt className="text-primary" /> Application Progress Timeline
            </h5>

            <div className="row text-center g-3 position-relative">
              {/* Step 1: Application Submitted */}
              <div className="col-12 col-md">
                <div className="d-flex flex-column align-items-center">
                  <div
                    className={`rounded-circle d-flex align-items-center justify-content-center text-white mb-2 shadow-sm ${
                      isStep1Complete ? "bg-success" : "bg-secondary"
                    }`}
                    style={{ width: "48px", height: "48px", fontSize: "20px" }}
                  >
                    ✓
                  </div>
                  <h6 className="fw-bold mb-1" style={{ fontSize: "14px" }}>
                    1. Application Submitted
                  </h6>
                  <span className="badge bg-success-subtle text-success small">Completed</span>
                  <small className="text-muted mt-1" style={{ fontSize: "11px" }}>
                    Form & Manifesto lodged
                  </small>
                </div>
              </div>

              {/* Step 2: Supervisor Verification */}
              <div className="col-12 col-md">
                <div className="d-flex flex-column align-items-center">
                  <div
                    className={`rounded-circle d-flex align-items-center justify-content-center text-white mb-2 shadow-sm ${
                      isStep2Complete
                        ? "bg-success"
                        : supervisorStatus === "rejected"
                        ? "bg-danger"
                        : "bg-warning"
                    }`}
                    style={{ width: "48px", height: "48px", fontSize: "20px" }}
                  >
                    {isStep2Complete ? "✓" : supervisorStatus === "rejected" ? "✗" : "2"}
                  </div>
                  <h6 className="fw-bold mb-1" style={{ fontSize: "14px" }}>
                    2. Supervisor Verification
                  </h6>
                  <span className={getBadgeClass(supervisorStatus)}>
                    {getStatusLabel(supervisorStatus)}
                  </span>
                  <small className="text-muted mt-1" style={{ fontSize: "11px" }}>
                    Academic score check
                  </small>
                </div>
              </div>

              {/* Step 3: Admin Approval */}
              <div className="col-12 col-md">
                <div className="d-flex flex-column align-items-center">
                  <div
                    className={`rounded-circle d-flex align-items-center justify-content-center text-white mb-2 shadow-sm ${
                      isStep3Complete
                        ? "bg-success"
                        : adminStatus === "rejected"
                        ? "bg-danger"
                        : isStep2Complete
                        ? "bg-warning"
                        : "bg-secondary bg-opacity-50"
                    }`}
                    style={{ width: "48px", height: "48px", fontSize: "20px" }}
                  >
                    {isStep3Complete ? "✓" : adminStatus === "rejected" ? "✗" : "3"}
                  </div>
                  <h6 className="fw-bold mb-1" style={{ fontSize: "14px" }}>
                    3. Admin Approval
                  </h6>
                  <span className={getBadgeClass(adminStatus)}>
                    {getStatusLabel(adminStatus)}
                  </span>
                  <small className="text-muted mt-1" style={{ fontSize: "11px" }}>
                    Institutional eligibility
                  </small>
                </div>
              </div>

              {/* Step 4: Symbol Assigned */}
              <div className="col-12 col-md">
                <div className="d-flex flex-column align-items-center">
                  <div
                    className={`rounded-circle d-flex align-items-center justify-content-center text-white mb-2 shadow-sm ${
                      isStep4Complete
                        ? "bg-success"
                        : "bg-secondary bg-opacity-50"
                    }`}
                    style={{ width: "48px", height: "48px", fontSize: "20px" }}
                  >
                    {isStep4Complete ? "🗳️" : "4"}
                  </div>
                  <h6 className="fw-bold mb-1" style={{ fontSize: "14px" }}>
                    4. Symbol Assigned
                  </h6>
                  <span
                    className={`badge ${
                      isStep4Complete ? "bg-success text-white" : "bg-light text-muted border"
                    }`}
                  >
                    {isStep4Complete ? assignedSymbol?.name || "ASSIGNED" : "PENDING"}
                  </span>
                  <small className="text-muted mt-1" style={{ fontSize: "11px" }}>
                    Unique ballot marker
                  </small>
                </div>
              </div>

              {/* Step 5: Eligible for Election */}
              <div className="col-12 col-md">
                <div className="d-flex flex-column align-items-center">
                  <div
                    className={`rounded-circle d-flex align-items-center justify-content-center text-white mb-2 shadow-sm ${
                      isStep5Complete
                        ? "bg-success"
                        : overallStatus === "rejected"
                        ? "bg-danger"
                        : "bg-secondary bg-opacity-50"
                    }`}
                    style={{ width: "48px", height: "48px", fontSize: "20px" }}
                  >
                    {isStep5Complete ? "🏆" : "5"}
                  </div>
                  <h6 className="fw-bold mb-1" style={{ fontSize: "14px" }}>
                    5. Eligible for Election
                  </h6>
                  <span className={getBadgeClass(overallStatus)}>
                    {isStep5Complete ? "BALLOT READY" : "IN REVIEW"}
                  </span>
                  <small className="text-muted mt-1" style={{ fontSize: "11px" }}>
                    Student voting ballot
                  </small>
                </div>
              </div>
            </div>
          </div>

          {/* Cards Grid: Candidate Information & Election Information */}
          <div className="row g-4 mb-4">
            {/* Candidate Information Card */}
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm rounded-4 h-100 bg-white">
                <div className="card-header bg-white border-bottom py-3 d-flex align-items-center gap-2">
                  <FaIdCard className="text-primary fs-5" />
                  <h5 className="fw-bold text-dark mb-0">Candidate Information</h5>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-striped table-hover mb-0 align-middle">
                      <tbody>
                        <tr>
                          <th className="ps-4 text-muted small" style={{ width: "40%" }}>
                            Candidate Name
                          </th>
                          <td className="pe-4 fw-bold text-dark">
                            {studentInfo?.name || "Registered Candidate"}
                          </td>
                        </tr>
                        <tr>
                          <th className="ps-4 text-muted small">Register Number</th>
                          <td className="pe-4 font-monospace text-primary fw-semibold">
                            {studentInfo?.regNo || "N/A"}
                          </td>
                        </tr>
                        <tr>
                          <th className="ps-4 text-muted small">Department</th>
                          <td className="pe-4">{studentInfo?.department || "General"}</td>
                        </tr>
                        <tr>
                          <th className="ps-4 text-muted small">Academic Year</th>
                          <td className="pe-4">
                            <span className="badge bg-light text-dark border">
                              <FaGraduationCap className="me-1 text-secondary" />
                              {studentInfo?.year || "Final Year"}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <th className="ps-4 text-muted small">Academic Score</th>
                          <td className="pe-4">
                            <span className="fw-bold text-success">
                              {studentInfo?.academicPercentage || 0}%
                            </span>
                            <small className="text-muted ms-2">
                              (Min required: {positionInfo?.minAcademicPercentage || 70}%)
                            </small>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Election Information Card */}
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm rounded-4 h-100 bg-white">
                <div className="card-header bg-white border-bottom py-3 d-flex align-items-center gap-2">
                  <FaVoteYea className="text-primary fs-5" />
                  <h5 className="fw-bold text-dark mb-0">Election Information</h5>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-striped table-hover mb-0 align-middle">
                      <tbody>
                        <tr>
                          <th className="ps-4 text-muted small" style={{ width: "40%" }}>
                            Election Name
                          </th>
                          <td className="pe-4 fw-bold text-dark">
                            {electionInfo?.title || "Campus Student Election"}
                          </td>
                        </tr>
                        <tr>
                          <th className="ps-4 text-muted small">Target Position</th>
                          <td className="pe-4">
                            <span className="badge bg-primary-subtle text-primary fw-bold px-3 py-2">
                              {positionInfo?.title || "Executive Position"}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <th className="ps-4 text-muted small">Application Date</th>
                          <td className="pe-4 text-secondary small">
                            {app?.createdAt
                              ? new Date(app.createdAt).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "Recently Registered"}
                          </td>
                        </tr>
                        <tr>
                          <th className="ps-4 text-muted small">Application ID</th>
                          <td className="pe-4 font-monospace text-muted small">
                            {app?._id || "N/A"}
                          </td>
                        </tr>
                        <tr>
                          <th className="ps-4 text-muted small">Election Period</th>
                          <td className="pe-4 small text-muted">
                            {electionInfo?.startDate
                              ? new Date(electionInfo.startDate).toLocaleDateString()
                              : "TBD"}{" "}
                            –{" "}
                            {electionInfo?.endDate
                              ? new Date(electionInfo.endDate).toLocaleDateString()
                              : "TBD"}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cards Grid: Approval Status & Assigned Symbol */}
          <div className="row g-4 mb-4">
            {/* Approval Status Card */}
            <div className="col-lg-7">
              <div className="card border-0 shadow-sm rounded-4 h-100 bg-white">
                <div className="card-header bg-white border-bottom py-3 d-flex align-items-center justify-content-between">
                  <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                    <FaShieldAlt className="text-primary" /> Approval Status & Dual Review
                  </h5>
                  <span className={getBadgeClass(overallStatus)}>
                    {getStatusLabel(overallStatus)}
                  </span>
                </div>

                <div className="card-body p-4">
                  {/* Supervisor Review Block */}
                  <div className="p-3 mb-3 bg-light rounded-3 border">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="d-flex align-items-center gap-2 fw-bold text-dark">
                        <FaUserShield className="text-success" /> Supervisor Approval Status:
                      </div>
                      <span className={getBadgeClass(supervisorStatus)}>
                        {getStatusLabel(supervisorStatus)}
                      </span>
                    </div>
                    <div className="small text-muted mb-1">
                      <strong>Review Comments: </strong>
                      <span className="text-dark fst-italic">"{supervisorComment}"</span>
                    </div>
                    {app?.supervisorApproval?.approvedAt && (
                      <small className="text-secondary d-block" style={{ fontSize: "11px" }}>
                        Reviewed on: {new Date(app.supervisorApproval.approvedAt).toLocaleString()}
                      </small>
                    )}
                  </div>

                  {/* Admin Review Block */}
                  <div className="p-3 mb-3 bg-light rounded-3 border">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="d-flex align-items-center gap-2 fw-bold text-dark">
                        <FaShieldAlt className="text-primary" /> Admin Approval Status:
                      </div>
                      <span className={getBadgeClass(adminStatus)}>
                        {getStatusLabel(adminStatus)}
                      </span>
                    </div>
                    <div className="small text-muted mb-1">
                      <strong>Review Comments: </strong>
                      <span className="text-dark fst-italic">"{adminComment}"</span>
                    </div>
                    {app?.adminApproval?.approvedAt && (
                      <small className="text-secondary d-block" style={{ fontSize: "11px" }}>
                        Reviewed on: {new Date(app.adminApproval.approvedAt).toLocaleString()}
                      </small>
                    )}
                  </div>

                  {/* Last Updated Date */}
                  <div className="d-flex align-items-center justify-content-between text-muted small pt-2 border-top">
                    <span>Last Status Update:</span>
                    <strong className="text-dark">
                      {app?.updatedAt
                        ? new Date(app.updatedAt).toLocaleString("en-US", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : "Up to date"}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Assigned Symbol Card */}
            <div className="col-lg-5">
              <div className="card border-0 shadow-sm rounded-4 h-100 bg-white">
                <div className="card-header bg-white border-bottom py-3 d-flex align-items-center gap-2">
                  <FaAward className="text-warning fs-5" />
                  <h5 className="fw-bold text-dark mb-0">Official Ballot Symbol</h5>
                </div>

                <div className="card-body p-4 d-flex flex-column justify-content-center text-center">
                  {/* Show symbol only after Admin approval */}
                  {adminStatus === "approved" && assignedSymbol ? (
                    <div className="p-4 bg-primary bg-opacity-10 rounded-4 border border-primary border-opacity-25">
                      <div
                        className="display-3 mb-3 text-primary"
                        style={{ lineHeight: 1 }}
                      >
                        {assignedSymbol.icon || "🗳️"}
                      </div>
                      <h4 className="fw-bold text-dark mb-1">{assignedSymbol.name}</h4>
                      <div className="badge bg-primary px-3 py-1 mb-2">
                        CODE: {assignedSymbol.code}
                      </div>
                      <p className="text-muted small mb-0">
                        {assignedSymbol.description ||
                          "This registered symbol will be shown adjacent to your name on digital voting ballots."}
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 bg-light rounded-4 border border-secondary border-opacity-25">
                      <div className="fs-1 text-muted mb-3 opacity-50">🛡️</div>
                      <h6 className="fw-bold text-dark mb-2">Symbol Not Yet Assigned</h6>
                      <p className="text-muted small mb-3">
                        Symbol will be assigned after approval.
                      </p>
                      <span className="badge bg-warning text-dark px-3 py-2 small">
                        Awaiting Admin Certification
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default CandidateApplicationStatus;
