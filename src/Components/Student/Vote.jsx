import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../Services/api";
import {
  FaVoteYea,
  FaCheckCircle,
  FaReceipt,
  FaShieldAlt,
  FaInfoCircle,
  FaExclamationTriangle,
  FaArrowRight,
  FaCopy,
} from "react-icons/fa";
import Loader from "../card/Loader";

function Vote() {
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeElection, setActiveElection] = useState(null);
  const [positions, setPositions] = useState([]);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState("");
  const [myReceipts, setMyReceipts] = useState([]);
  const [error, setError] = useState(null);

  // Modals state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [newReceipt, setNewReceipt] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadVotingBooth();
  }, []);

  const loadVotingBooth = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch elections
      const elRes = await api.get("/elections");
      const active = elRes.data?.data?.find((e) => e.status === "active");

      if (!active) {
        setActiveElection(null);
        setLoading(false);
        return;
      }
      setActiveElection(active);

      // 2. Fetch positions for this active election & my receipts in parallel
      const [posRes, receiptsRes] = await Promise.all([
        api.get(`/elections/${active._id}/positions`),
        api.get("/votes/my-receipts"),
      ]);

      const fetchedPositions = posRes.data?.data || [];
      setPositions(fetchedPositions);

      const receipts = receiptsRes.data?.data || [];
      setMyReceipts(receipts);

      // 3. Determine initially selected position
      let initialPos = null;
      if (location.state?.preselectedPosition) {
        initialPos = fetchedPositions.find(
          (p) => p._id === location.state.preselectedPosition
        );
      }
      if (!initialPos && fetchedPositions.length > 0) {
        // Pick first unvoted position if possible, else first position
        const votedPositionIds = receipts.map((r) =>
          typeof r.positionId === "object" ? r.positionId?._id : r.positionId
        );
        const firstUnvoted = fetchedPositions.find(
          (p) => !votedPositionIds.includes(p._id)
        );
        initialPos = firstUnvoted || fetchedPositions[0];
      }

      if (initialPos) {
        setSelectedPosition(initialPos);
        await loadCandidatesForPosition(active._id, initialPos._id);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to initialize voting booth.");
    } finally {
      setLoading(false);
    }
  };

  const loadCandidatesForPosition = async (electionId, positionId) => {
    try {
      setSelectedCandidateId("");
      const res = await api.get(`/candidates?electionId=${electionId}&positionId=${positionId}`);
      if (res.data.success) {
        setCandidates(res.data.data);
      }
    } catch (err) {
      console.warn("Failed to load candidates for position:", err.message);
      setCandidates([]);
    }
  };

  const handlePositionSelect = async (pos) => {
    setSelectedPosition(pos);
    setSelectedCandidateId("");
    setError(null);
    if (activeElection) {
      await loadCandidatesForPosition(activeElection._id, pos._id);
    }
  };

  // Check if current user has already voted for a specific position
  const getReceiptForPosition = (positionId) => {
    return myReceipts.find((r) => {
      const posId = typeof r.positionId === "object" ? r.positionId?._id : r.positionId;
      return posId === positionId;
    });
  };

  const currentReceipt = selectedPosition ? getReceiptForPosition(selectedPosition._id) : null;
  const isCurrentPositionVoted = !!currentReceipt;

  const handleOpenConfirm = () => {
    if (!selectedCandidateId) {
      setError("Please select a candidate before proceeding to vote.");
      return;
    }
    setError(null);
    setShowConfirmModal(true);
  };

  const handleConfirmVote = async () => {
    if (!activeElection || !selectedPosition || !selectedCandidateId) return;

    try {
      setSubmitting(true);
      setError(null);

      const res = await api.post("/votes", {
        electionId: activeElection._id,
        positionId: selectedPosition._id,
        candidateId: selectedCandidateId,
      });

      if (res.data.success) {
        const receiptData = res.data.data;
        setNewReceipt(receiptData);
        setMyReceipts((prev) => [...prev, receiptData]);
        setShowConfirmModal(false);
        setShowReceiptModal(true);
      }
    } catch (err) {
      setShowConfirmModal(false);
      setError(err.response?.data?.message || "Failed to cast vote. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyReceipt = () => {
    if (newReceipt?.receiptId) {
      navigator.clipboard.writeText(newReceipt.receiptId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNextPositionOrFinish = () => {
    setShowReceiptModal(false);
    // Find next unvoted position
    const votedPositionIds = [...myReceipts, newReceipt].map((r) =>
      typeof r?.positionId === "object" ? r?.positionId?._id : r?.positionId
    );
    const nextUnvoted = positions.find((p) => !votedPositionIds.includes(p._id));
    if (nextUnvoted) {
      handlePositionSelect(nextUnvoted);
    }
  };

  if (loading) {
    return (
      <div className="py-5 text-center">
        <Loader text="Preparing Confidential Ballot..." />
      </div>
    );
  }

  if (!activeElection) {
    return (
      <div className="modern-card p-5 text-center shadow-sm">
        <FaVoteYea size={48} className="text-muted opacity-50 mb-3" />
        <h3 className="fw-bold text-dark">No Active Election for Voting</h3>
        <p className="text-muted mb-4">
          There are currently no open campus elections. When an election status is changed to active, the ballot will appear here.
        </p>
        <button onClick={() => navigate("/student/dashboard")} className="btn btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const selectedCandidate = candidates.find((c) => c._id === selectedCandidateId);

  return (
    <div>
      {/* Header */}
      <div className="page-header-box">
        <div>
          <h1 className="page-title">
            <FaVoteYea className="text-primary" /> Official Voting Booth
          </h1>
          <p className="page-subtitle">
            <strong>{activeElection.title}</strong> • Confidential & Cryptographically Secured Ballot
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-success py-2 px-3 fs-6 d-flex align-items-center gap-1">
            <span className="spinner-grow spinner-grow-sm text-light" style={{ width: 10, height: 10 }}></span>
            Active Election
          </span>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <FaExclamationTriangle className="me-2" />
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      {/* Secret Ballot Privacy Guarantee Alert */}
      <div className="alert alert-info border-info border-opacity-25 d-flex align-items-start gap-3 mb-4 rounded-3">
        <FaShieldAlt className="text-info mt-1" size={24} />
        <div>
          <h6 className="fw-bold mb-1 text-dark">Secret Ballot Privacy Protocol</h6>
          <small className="text-muted">
            Your candidate choice is completely separated from your student identity. Only an anonymized
            participation receipt is issued to verify that your ballot has been counted in the tally.
            Once cast, votes cannot be modified or reversed.
          </small>
        </div>
      </div>

      {/* Position Stepper / Nav Tabs */}
      <div className="modern-card p-3 mb-4 shadow-sm">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <span className="small fw-bold text-secondary text-uppercase" style={{ letterSpacing: "1px" }}>
            Select Position to Vote
          </span>
          <span className="small text-muted">
            {myReceipts.length} of {positions.length} Positions Voted
          </span>
        </div>

        <div className="d-flex flex-wrap gap-2">
          {positions.map((pos) => {
            const receipt = getReceiptForPosition(pos._id);
            const isVoted = !!receipt;
            const isSelected = selectedPosition?._id === pos._id;

            return (
              <button
                key={pos._id}
                onClick={() => handlePositionSelect(pos)}
                className={`btn d-flex align-items-center gap-2 px-3 py-2 rounded-3 transition-all ${
                  isSelected
                    ? "btn-primary shadow-sm"
                    : isVoted
                    ? "btn-outline-success border-success"
                    : "btn-light border"
                }`}
              >
                {isVoted ? (
                  <FaCheckCircle className={isSelected ? "text-white" : "text-success"} />
                ) : (
                  <FaVoteYea className={isSelected ? "text-white" : "text-secondary"} />
                )}
                <span className="fw-semibold">{pos.title}</span>
                {isVoted && (
                  <span
                    className={`badge ${
                      isSelected ? "bg-white text-primary" : "bg-success text-white"
                    } ms-1`}
                    style={{ fontSize: "10px" }}
                  >
                    VOTED
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Voting Area */}
      {selectedPosition && (
        <div className="modern-card p-4 mb-4 shadow-sm border">
          <div className="d-flex align-items-center justify-content-between pb-3 mb-4 border-bottom">
            <div>
              <h4 className="fw-bold text-dark mb-1">
                Ballot for {selectedPosition.title}
              </h4>
              <p className="text-muted small mb-0">
                Minimum Academic Eligibility: {selectedPosition.minAcademicPercentage}%
              </p>
            </div>

            {isCurrentPositionVoted ? (
              <div className="text-end">
                <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-2 fs-6">
                  <FaCheckCircle className="me-1" /> Ballot Already Cast
                </span>
                <div className="small text-muted mt-1 font-monospace">
                  Receipt: {currentReceipt.receiptId}
                </div>
              </div>
            ) : (
              <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-2 fs-6">
                Ready to Vote
              </span>
            )}
          </div>

          {/* If already voted for this position */}
          {isCurrentPositionVoted ? (
            <div className="p-5 text-center bg-light rounded-3 border">
              <div className="rounded-circle bg-success bg-opacity-10 text-success d-inline-flex align-items-center justify-content-center p-3 mb-3">
                <FaReceipt size={32} />
              </div>
              <h4 className="fw-bold text-dark">You Have Voted for {selectedPosition.title}</h4>
              <p className="text-muted small mb-3">
                Your vote was cryptographically secured and counted in the campus tally.
              </p>
              <div className="d-inline-block bg-white border rounded-3 p-3 text-start shadow-sm mb-4">
                <div className="small text-muted">Official Participation Receipt:</div>
                <div className="fs-5 fw-bold text-primary font-monospace">{currentReceipt.receiptId}</div>
                <div className="small text-secondary mt-1">
                  Recorded: {new Date(currentReceipt.timestamp).toLocaleString()}
                </div>
              </div>
              <div>
                <button
                  onClick={() => navigate("/student/history")}
                  className="btn btn-outline-primary me-2"
                >
                  <FaReceipt className="me-1" /> View All Receipts
                </button>
              </div>
            </div>
          ) : candidates.length === 0 ? (
            <div className="py-5 text-center">
              <FaInfoCircle size={36} className="text-muted mb-2 opacity-50" />
              <h5 className="fw-bold text-dark">No Approved Candidates Found</h5>
              <p className="text-muted small">
                There are no approved candidates running for this position in this election.
              </p>
            </div>
          ) : (
            /* Candidate Selection EVM Cards */
            <div>
              <p className="text-secondary small mb-3 fw-semibold">
                Select one candidate from the approved nominees below:
              </p>

              <div className="row g-3 mb-4">
                {candidates.map((cand) => {
                  const student = cand.studentId || {};
                  const symbol = cand.assignedSymbol || {};
                  const isSelected = selectedCandidateId === cand._id;

                  return (
                    <div key={cand._id} className="col-12">
                      <div
                        onClick={() => setSelectedCandidateId(cand._id)}
                        className={`p-3 rounded-3 border transition-all cursor-pointer d-flex align-items-center justify-content-between ${
                          isSelected
                            ? "border-primary bg-primary bg-opacity-10 shadow-sm"
                            : "bg-white hover-bg-light"
                        }`}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="d-flex align-items-center gap-3">
                          {/* Radio Selector */}
                          <input
                            type="radio"
                            name="candidate"
                            className="form-check-input mt-0 fs-5"
                            checked={isSelected}
                            onChange={() => setSelectedCandidateId(cand._id)}
                          />

                          {/* Candidate Avatar */}
                          <div
                            className={`rounded-circle text-white fw-bold d-flex align-items-center justify-content-center ${
                              isSelected ? "bg-primary" : "bg-secondary"
                            }`}
                            style={{ width: 48, height: 48, fontSize: "18px" }}
                          >
                            {student.name ? student.name.charAt(0).toUpperCase() : "C"}
                          </div>

                          {/* Candidate Info */}
                          <div>
                            <h5 className="fw-bold mb-0 text-dark">{student.name}</h5>
                            <div className="d-flex align-items-center gap-2 text-secondary small">
                              <span>{student.department}</span>
                              <span>•</span>
                              <span>{student.year}</span>
                              <span>•</span>
                              <span className="text-success fw-semibold">
                                Score: {student.academicPercentage}%
                              </span>
                            </div>
                            {cand.manifesto && (
                              <div className="small text-muted mt-1 fst-italic text-truncate" style={{ maxWidth: 450 }}>
                                "{cand.manifesto}"
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Official Symbol Box */}
                        <div
                          className={`text-center p-2 rounded-3 border ${
                            isSelected ? "bg-white border-primary" : "bg-light"
                          }`}
                          style={{ minWidth: 85 }}
                        >
                          <div style={{ fontSize: "32px", lineHeight: 1 }}>
                            {symbol.icon || "🗳️"}
                          </div>
                          <div className="fw-bold small text-dark mt-1 text-truncate" style={{ maxWidth: 85 }}>
                            {symbol.name || "Symbol"}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Cast Ballot Button */}
              <div className="text-end pt-3 border-top">
                <button
                  disabled={!selectedCandidateId || submitting}
                  onClick={handleOpenConfirm}
                  className="btn btn-primary btn-lg px-5 fw-bold shadow-sm d-inline-flex align-items-center gap-2"
                >
                  <FaVoteYea /> Cast Confidential Ballot
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && selectedCandidate && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg border-0 rounded-4">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                  <FaShieldAlt className="text-primary" /> Confirm Your Confidential Vote
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowConfirmModal(false)}
                ></button>
              </div>
              <div className="modal-body py-4">
                <div className="alert alert-warning border-warning border-opacity-25 small mb-3">
                  <FaExclamationTriangle className="me-1" />
                  <strong>Important:</strong> Votes cannot be revised or recalled once submitted.
                </div>

                <div className="p-3 bg-light rounded-3 border text-center mb-3">
                  <div className="small text-secondary text-uppercase fw-bold mb-1">
                    Position: {selectedPosition?.title}
                  </div>
                  <div style={{ fontSize: "42px" }}>
                    {selectedCandidate.assignedSymbol?.icon || "🗳️"}
                  </div>
                  <h4 className="fw-bold text-dark mb-0">
                    {selectedCandidate.studentId?.name}
                  </h4>
                  <p className="text-muted small mb-0">
                    Official Symbol: {selectedCandidate.assignedSymbol?.name} • {selectedCandidate.studentId?.department}
                  </p>
                </div>

                <p className="small text-muted text-center mb-0">
                  By clicking Confirm, an anonymized ballot will be registered and a cryptographic
                  receipt will be generated for your records.
                </p>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-success fw-bold px-4"
                  onClick={handleConfirmVote}
                  disabled={submitting}
                >
                  {submitting ? "Casting Ballot..." : "Confirm & Cast Vote"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Receipt Modal */}
      {showReceiptModal && newReceipt && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg border-0 rounded-4">
              <div className="modal-body p-4 text-center">
                <div
                  className="rounded-circle bg-success text-white d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ width: 64, height: 64, fontSize: "30px" }}
                >
                  ✓
                </div>
                <h4 className="fw-bold text-dark mb-1">Vote Successfully Cast!</h4>
                <p className="text-muted small mb-4">
                  Your confidential ballot for <strong>{selectedPosition?.title}</strong> has been encrypted and recorded.
                </p>

                {/* Receipt Box */}
                <div className="bg-light border rounded-3 p-3 mb-3 text-start">
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <span className="small text-secondary fw-bold">VOTE RECEIPT NUMBER</span>
                    <button
                      onClick={handleCopyReceipt}
                      className="btn btn-sm btn-link p-0 text-decoration-none d-flex align-items-center gap-1"
                    >
                      <FaCopy /> {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <div className="font-monospace fw-bold text-primary fs-5 text-break">
                    {newReceipt.receiptId}
                  </div>
                  <div className="small text-muted mt-2">
                    Timestamp: {new Date(newReceipt.timestamp).toLocaleString()}
                  </div>
                </div>

                <p className="small text-muted mb-4">
                  Keep this receipt number as proof that your vote was included in the election tally.
                </p>

                <div className="d-flex gap-2 justify-content-center">
                  <button
                    onClick={() => {
                      setShowReceiptModal(false);
                      navigate("/student/history");
                    }}
                    className="btn btn-outline-secondary"
                  >
                    View All Receipts
                  </button>
                  <button
                    onClick={handleNextPositionOrFinish}
                    className="btn btn-primary fw-semibold d-flex align-items-center gap-2"
                  >
                    <span>Continue Voting</span> <FaArrowRight />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Vote;