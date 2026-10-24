import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../Services/api";
import {
  FaUserTie,
  FaVoteYea,
  FaCheckCircle,
  FaHourglassHalf,
  FaTimesCircle,
  FaAward,
  FaCalendarAlt,
  FaEdit,
  FaTrophy,
  FaHandshake,
  FaChartBar,
} from "react-icons/fa";
import Loader from "../card/Loader";
import { useAuth } from "../Context/AuthContext";

function CandidateDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [candidateResult, setCandidateResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const profileRes = await api.get("/candidates/me");
      if (profileRes.data.success && profileRes.data.data) {
        const prof = profileRes.data.data;
        if (prof.approvalStatus !== "approved") {
          navigate("/candidate/application-status", { replace: true });
          return;
        }
        setProfile(prof);

        // Fetch candidate result if linked to an election
        const electionId = prof.electionId?._id || prof.electionId;
        if (electionId) {
          try {
            const resRes = await api.get(`/results/${electionId}/candidate-result`);
            if (resRes.data) {
              setCandidateResult(resRes.data);
            }
          } catch (resErr) {
            console.warn("Could not load candidate result:", resErr.message);
          }
        }
      } else {
        navigate("/candidate/application-status", { replace: true });
      }
    } catch (err) {
      if (err.response?.status === 403) {
        // Backend strictly blocks unapproved candidates -> redirect to status page
        navigate("/candidate/application-status", { replace: true });
        return;
      }
      if (err.response?.status === 404) {
        navigate("/candidate/eligibility", { replace: true });
        return;
      }
      setError(err.response?.data?.message || "Failed to load candidate dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="py-5 text-center">
        <Loader text="Loading Candidate Portal..." />
      </div>
    );
  }

  const overallStatus = profile?.approvalStatus || "approved";
  const adminStatus = profile?.adminApproval?.status || "approved";
  const supervisorStatus = profile?.supervisorApproval?.status || "approved";

  return (
    <div>
      {/* Header */}
      <div className="page-header-box mb-4">
        <div>
          <h1 className="page-title">
            <FaUserTie className="text-warning" /> Candidate Portal & Campaign Hub
          </h1>
          <p className="page-subtitle">
            Welcome, <strong>{user?.name || "Candidate"}</strong> • Track dual administrative approvals, campaign promises, and verified election tallies
          </p>
        </div>
        <div className="d-flex gap-2">
          {!profile && (
            <button
              onClick={() => navigate("/candidate/eligibility")}
              className="btn btn-primary d-flex align-items-center gap-2 fw-semibold"
            >
              <FaVoteYea /> Complete Eligibility Form
            </button>
          )}
          {profile && (
            <button
              onClick={() => navigate("/candidate/profile")}
              className="btn btn-outline-primary d-flex align-items-center gap-2 fw-semibold"
            >
              <FaEdit /> Edit Manifesto
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-danger py-2 px-3 small rounded-3 mb-4">
          {error}
        </div>
      )}

      {/* 1. NO NOMINATION FILED BANNER */}
      {!profile && (
        <div className="modern-card p-5 text-center mb-4 border border-warning border-opacity-50">
          <FaHourglassHalf size={48} className="text-warning mb-3 opacity-75" />
          <h4 className="fw-bold text-dark">No Candidate Application on File</h4>
          <p className="text-muted small mx-auto mb-4" style={{ maxWidth: "520px" }}>
            You have not submitted a candidate nomination for any election yet. Complete the eligibility verification form to nominate yourself for student council.
          </p>
          <button
            onClick={() => navigate("/candidate/eligibility")}
            className="btn btn-primary px-4 py-2 fw-semibold"
          >
            Start Candidate Application →
          </button>
        </div>
      )}

      {/* 2. NOMINATION STATUS BANNER (PENDING, REJECTED, OR APPROVED) */}
      {profile && (
        <div className="modern-card mb-4">
          <div className="modern-card-body p-4">
            <div className="row align-items-center g-4">
              <div className="col-lg-8">
                <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                  <h4 className="fw-bold mb-0 text-dark">Application Status:</h4>
                  {overallStatus === "approved" ? (
                    <span className="badge-custom badge-approved fs-6 py-1 px-3">
                      <FaCheckCircle /> APPROVED
                    </span>
                  ) : overallStatus === "rejected" ? (
                    <span className="badge-custom badge-rejected fs-6 py-1 px-3">
                      <FaTimesCircle /> REJECTED
                    </span>
                  ) : (
                    <span className="badge-custom badge-upcoming fs-6 py-1 px-3">
                      <FaHourglassHalf /> PENDING DUAL APPROVAL
                    </span>
                  )}
                </div>

                {/* Subtitle / context */}
                <p className="text-muted small mb-3">
                  Contesting for <strong>{profile.positionId?.title || "Council Position"}</strong> in{" "}
                  <strong>{profile.electionId?.title || "Campus Election"}</strong>
                </p>

                {/* Dual Approval Status Breakdown */}
                <div className="d-flex flex-wrap gap-3 p-3 bg-light rounded-3 mb-2 small">
                  <div className="d-flex align-items-center gap-2">
                    <span className="text-muted">Admin Approval:</span>
                    {adminStatus === "approved" ? (
                      <span className="badge bg-success text-white py-1 px-2">✓ Approved</span>
                    ) : adminStatus === "rejected" ? (
                      <span className="badge bg-danger text-white py-1 px-2">✗ Rejected</span>
                    ) : (
                      <span className="badge bg-warning text-dark py-1 px-2">⏳ Pending</span>
                    )}
                  </div>

                  <div className="vr d-none d-sm-block"></div>

                  <div className="d-flex align-items-center gap-2">
                    <span className="text-muted">Supervisor Approval:</span>
                    {supervisorStatus === "approved" ? (
                      <span className="badge bg-success text-white py-1 px-2">✓ Approved</span>
                    ) : supervisorStatus === "rejected" ? (
                      <span className="badge bg-danger text-white py-1 px-2">✗ Rejected</span>
                    ) : (
                      <span className="badge bg-warning text-dark py-1 px-2">⏳ Pending</span>
                    )}
                  </div>
                </div>

                {/* Status Explanation Message */}
                {overallStatus === "pending" && (
                  <div className="alert alert-warning py-2 px-3 small rounded-3 mb-0">
                    <strong>Waiting for Admin and Supervisor approval.</strong> Both administrative authorities must approve your nomination before you become an official candidate.
                  </div>
                )}

                {overallStatus === "rejected" && (
                  <div className="alert alert-danger py-2 px-3 small rounded-3 mb-0">
                    <strong>Nomination Rejected:</strong> {profile.rejectionReason || "Your application did not satisfy all administrative requirements."}
                  </div>
                )}

                {overallStatus === "approved" && (
                  <div className="alert alert-success py-2 px-3 small rounded-3 mb-0">
                    <strong>Official Candidate Confirmed!</strong> Both Admin and Supervisor approvals are complete. You are officially participating in this election.
                  </div>
                )}
              </div>

              {/* Official Symbol Box */}
              <div className="col-lg-4 text-lg-end">
                {profile.assignedSymbol?.name ? (
                  <div className="d-inline-flex flex-column align-items-center p-3 rounded-4 bg-light border shadow-sm">
                    <div className="candidate-symbol-badge mb-2" style={{ fontSize: "36px" }}>
                      {profile.assignedSymbol.icon || "🗳️"}
                    </div>
                    <strong className="text-dark">{profile.assignedSymbol.name}</strong>
                    <small className="text-muted" style={{ fontSize: "11px" }}>
                      Official Campaign Symbol
                    </small>
                  </div>
                ) : (
                  <div className="p-3 rounded-4 bg-light border text-center text-muted small">
                    <FaAward size={32} className="mb-2 text-secondary opacity-50" />
                    <div>Symbol confirmed upon approval</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. CANDIDATE RESULT CARD (CRITICAL REQUIREMENT 13, 14, 21, 23) */}
      {profile && (
        <div className="modern-card mb-4 border border-primary border-opacity-25 shadow-sm">
          <div className="modern-card-header bg-light d-flex align-items-center justify-content-between">
            <h5 className="modern-card-title mb-0">
              <FaChartBar className="text-primary" /> Your Election Outcome & Vote Tallies
            </h5>
            {candidateResult?.published ? (
              <span className="badge bg-success text-white py-1 px-3">
                <FaCheckCircle /> Results Officially Published
              </span>
            ) : (
              <span className="badge bg-secondary text-white py-1 px-3">
                🔒 Results Not Published Yet
              </span>
            )}
          </div>

          <div className="modern-card-body p-4">
            {candidateResult?.published ? (
              /* AFTER PUBLICATION: Show exact votes, percentage, and winner / tie badge */
              <div>
                <div className="d-flex align-items-center gap-2 mb-3">
                  <h4 className="fw-bold text-dark mb-0">Your Election Result</h4>
                  <span className="text-muted">— {candidateResult.data?.position}</span>
                </div>

                <div className="row g-4 align-items-center">
                  <div className="col-md-4">
                    <div className="p-3 bg-light rounded-4 text-center border">
                      <small className="text-muted text-uppercase fw-bold" style={{ fontSize: "11px" }}>
                        Ballots Cast For You
                      </small>
                      <div className="display-6 fw-bold text-primary my-1">
                        {candidateResult.data?.voteCount ?? 0}
                      </div>
                      <small className="text-muted">Total Verified Votes</small>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="p-3 bg-light rounded-4 text-center border">
                      <small className="text-muted text-uppercase fw-bold" style={{ fontSize: "11px" }}>
                        Vote Percentage Share
                      </small>
                      <div className="display-6 fw-bold text-info my-1">
                        {candidateResult.data?.percentage ?? 0}%
                      </div>
                      <small className="text-muted">Of Position's Total Votes</small>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="p-3 bg-light rounded-4 text-center border">
                      <small className="text-muted text-uppercase fw-bold" style={{ fontSize: "11px" }}>
                        Official Outcome
                      </small>
                      <div className="my-2">
                        {candidateResult.data?.winner ? (
                          <span className="badge bg-success fs-5 py-2 px-3 d-inline-flex align-items-center gap-2">
                            <FaTrophy /> WINNER
                          </span>
                        ) : candidateResult.data?.isTie ? (
                          <span className="badge bg-warning text-dark fs-5 py-2 px-3 d-inline-flex align-items-center gap-2">
                            <FaHandshake /> TIE
                          </span>
                        ) : (
                          <span className="badge bg-secondary fs-5 py-2 px-3">
                            Not Winner
                          </span>
                        )}
                      </div>
                      <small className="text-muted">Certified by Commission</small>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* BEFORE PUBLICATION: Strictly hide vote counts */
              <div className="text-center py-4">
                <div
                  className="rounded-circle bg-light text-muted d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ width: 64, height: 64, fontSize: 28 }}
                >
                  🔒
                </div>
                <h5 className="fw-bold text-dark mb-2">Results have not been published yet.</h5>
                <p className="text-muted small mx-auto mb-0" style={{ maxWidth: "480px" }}>
                  Vote count will be available after the election administrator publishes the official results. Direct access to interim tallies is restricted to maintain democratic confidentiality.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. CAMPAIGN PROFILE SNAPSHOT & ELECTION PROGRESS */}
      {profile && (
        <div className="row g-4 mb-4">
          {/* Manifesto & Planned Initiatives */}
          <div className="col-lg-6">
            <div className="modern-card h-100">
              <div className="modern-card-header">
                <h5 className="modern-card-title">
                  <FaUserTie /> Campaign Manifesto & Initiatives
                </h5>
              </div>
              <div className="modern-card-body">
                <div className="mb-3">
                  <h6 className="fw-bold small text-dark mb-1">Manifesto Statement:</h6>
                  <p className="small text-secondary fst-italic p-3 bg-light rounded-3 mb-3 border">
                    "{profile.manifesto || "No manifesto statement submitted."}"
                  </p>
                </div>

                <div>
                  <h6 className="fw-bold small text-dark mb-2">Planned Work Promises:</h6>
                  {profile.plannedWork && profile.plannedWork.length > 0 ? (
                    <ul className="small text-secondary ps-3 mb-0">
                      {profile.plannedWork.map((item, idx) => (
                        <li key={idx} className="mb-1">{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="small text-muted mb-0">No planned work items entered.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Election Timeline & Details */}
          <div className="col-lg-6">
            <div className="modern-card h-100">
              <div className="modern-card-header">
                <h5 className="modern-card-title">
                  <FaCalendarAlt /> Contested Election Progress
                </h5>
              </div>
              <div className="modern-card-body">
                <h6 className="fw-bold text-dark">{profile.electionId?.title || "Campus Election"}</h6>
                <p className="text-muted small mb-3">
                  Position: <strong>{profile.positionId?.title}</strong>
                </p>

                <div className="p-3 bg-light rounded-3 mb-3 small">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Election Status:</span>
                    <span className={`badge-custom badge-${profile.electionId?.status || "active"}`}>
                      ● {profile.electionId?.status?.toUpperCase() || "ACTIVE"}
                    </span>
                  </div>
                  {profile.electionId?.startDate && (
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Voting Opens:</span>
                      <span className="fw-semibold">
                        {new Date(profile.electionId.startDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {profile.electionId?.endDate && (
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Voting Closes:</span>
                      <span className="fw-semibold">
                        {new Date(profile.electionId.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="alert alert-info py-2 small mb-0">
                  Students can view your profile and symbol in the candidate directory once approved.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CandidateDashboard;