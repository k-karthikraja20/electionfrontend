import React, { useEffect, useState } from "react";
import api from "../Services/api";
import {
  FaTrophy,
  FaMedal,
  FaVoteYea,
  FaBullhorn,
  FaCheckCircle,
  FaInfoCircle,
  FaDownload,
  FaPrint,
} from "react-icons/fa";
import Loader from "../card/Loader";

function ElectionResults() {
  const [elections, setElections] = useState([]);
  const [selectedElectionId, setSelectedElectionId] = useState("");
  const [resultsData, setResultsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchingResults, setFetchingResults] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 1. Fetch all elections
  useEffect(() => {
    const loadElections = async () => {
      try {
        setLoading(true);
        const res = await api.get("/elections");
        if (res.data.success && res.data.data.length > 0) {
          setElections(res.data.data);
          // Pick first active/closed/published election
          setSelectedElectionId(res.data.data[0]._id);
        }
      } catch (err) {
        setError("Failed to load elections.");
      } finally {
        setLoading(false);
      }
    };

    loadElections();
  }, []);

  // 2. Fetch results for selected election (preview or published)
  const loadResults = async (electionId, isPreview = false) => {
    if (!electionId) return;
    try {
      setFetchingResults(true);
      setError("");
      const endpoint = isPreview ? `/results/${electionId}/preview` : `/results/${electionId}/preview`;
      const res = await api.get(endpoint);
      if (res.data.success) {
        setResultsData(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load election results.");
      setResultsData(null);
    } finally {
      setFetchingResults(false);
    }
  };

  useEffect(() => {
    if (selectedElectionId) {
      loadResults(selectedElectionId);
    }
  }, [selectedElectionId]);

  const handlePublishToggle = async () => {
    if (!selectedElectionId) return;
    try {
      // Primary Requirement 19: PUT /api/results/:electionId/publish
      await api.put(`/results/${selectedElectionId}/publish`);
      setSuccess("Election results published successfully! Final vote tallies are now visible to candidates and students.");
      loadResults(selectedElectionId);
    } catch (err) {
      // Fallback
      try {
        await api.post(`/elections/${selectedElectionId}/publish-results`);
        setSuccess("Election results published! Results are now visible.");
        loadResults(selectedElectionId);
      } catch (fallbackErr) {
        setError(err.response?.data?.message || fallbackErr.response?.data?.message || "Failed to publish election results.");
      }
    }
  };

  if (loading) {
    return (
      <div className="py-5 text-center">
        <Loader text="Loading Election Results..." />
      </div>
    );
  }

  const isPublished = Boolean(resultsData?.election?.resultPublished || resultsData?.election?.isResultsPublished);

  return (
    <div>
      {/* Header */}
      <div className="page-header-box">
        <div>
          <h1 className="page-title">
            <FaTrophy className="text-warning" /> Election Results & Official Publication
          </h1>
          <p className="page-subtitle">
            Preview calculated vote tallies, inspect rankings, and officially certify and publish election outcomes
          </p>
        </div>
        <div className="d-flex gap-2">
          {!isPublished && (
            <button
              onClick={handlePublishToggle}
              className="btn btn-success d-flex align-items-center gap-2 fw-semibold shadow-sm"
            >
              <FaBullhorn /> Publish Results to Campus
            </button>
          )}
          <button
            onClick={() => loadResults(selectedElectionId, true)}
            className="btn btn-outline-primary d-flex align-items-center gap-2"
            title="Refresh current vote tally preview"
          >
            <FaVoteYea /> Preview Tallies
          </button>
          <button
            onClick={() => window.print()}
            className="btn btn-outline-secondary d-flex align-items-center gap-2"
          >
            <FaPrint /> Print Report
          </button>
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

      {/* Election Selector Bar */}
      <div className="modern-card p-3 mb-4">
        <div className="row align-items-center g-3">
          <div className="col-md-6">
            <label className="form-label small fw-bold mb-1">Select Election to Inspect Results</label>
            <select
              className="form-select form-select-sm"
              value={selectedElectionId}
              onChange={(e) => setSelectedElectionId(e.target.value)}
            >
              {elections.map((el) => (
                <option key={el._id} value={el._id}>
                  {el.title} ({el.status.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-6 text-md-end">
            {resultsData?.election && (
              <div className="d-inline-flex align-items-center gap-2">
                <span className="text-muted small">Publishing Status:</span>
                {resultsData.election.isResultsPublished ? (
                  <span className="badge-custom badge-approved">
                    <FaCheckCircle /> Officially Published
                  </span>
                ) : (
                  <span className="badge-custom badge-upcoming">
                    🔒 Unpublished (Admin/Supervisor Only)
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results content */}
      {fetchingResults ? (
        <div className="py-5 text-center">
          <Loader text="Computing Vote Tallies..." />
        </div>
      ) : resultsData?.positions && resultsData.positions.length > 0 ? (
        <div className="d-flex flex-column gap-4">
          {resultsData.positions.map((pos) => (
            <div key={pos.positionId} className="modern-card">
              <div className="modern-card-header bg-light">
                <div className="d-flex align-items-center gap-2">
                  <h5 className="modern-card-title">{pos.positionTitle}</h5>
                  <span className="badge bg-secondary text-white small">
                    {pos.totalVotes} total votes cast
                  </span>
                </div>
              </div>

              <div className="modern-card-body">
                {/* Winner Spotlight if votes exist */}
                {pos.winner ? (
                  <div className="alert alert-success d-flex align-items-center justify-content-between p-3 rounded-3 mb-4 border border-success">
                    <div className="d-flex align-items-center gap-3">
                      <div className="rounded-circle bg-warning text-dark p-2" style={{ fontSize: 24 }}>
                        🏆
                      </div>
                      <div>
                        <div className="fw-bold text-success" style={{ fontSize: "16px" }}>
                          Projected Winner: {pos.winner.name} ({pos.winner.symbol?.icon} {pos.winner.symbol?.name})
                        </div>
                        <small className="text-muted">
                          {pos.winner.department} • {pos.winner.regNo} — Leading with {pos.winner.votes} votes ({pos.winner.percentage}%)
                        </small>
                      </div>
                    </div>
                    <span className="badge bg-success fs-6 py-2 px-3">Rank #1</span>
                  </div>
                ) : (
                  <div className="alert alert-light text-muted small p-2 mb-3">
                    No ballots cast for this position yet.
                  </div>
                )}

                {/* Candidate breakdown table */}
                <div className="table-responsive-wrapper">
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Candidate</th>
                        <th>Symbol</th>
                        <th>Department</th>
                        <th>Votes</th>
                        <th>Share (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pos.candidates.map((cand) => (
                        <tr key={cand.candidateId}>
                          <td>
                            <span className={`fw-bold ${cand.rank === 1 ? "text-warning" : "text-secondary"}`}>
                              #{cand.rank}
                            </span>
                          </td>
                          <td className="fw-semibold">{cand.name}</td>
                          <td>
                            <span className="me-1" style={{ fontSize: "18px" }}>
                              {cand.symbol?.icon || "🗳️"}
                            </span>
                            <span className="small fw-semibold">{cand.symbol?.name}</span>
                          </td>
                          <td className="text-muted small">{cand.department}</td>
                          <td className="fw-bold text-primary">{cand.votes}</td>
                          <td style={{ width: "260px" }}>
                            <div className="d-flex align-items-center gap-2">
                              <div className="progress flex-grow-1" style={{ height: "8px" }}>
                                <div
                                  className="progress-bar bg-primary"
                                  role="progressbar"
                                  style={{ width: `${cand.percentage}%` }}
                                  aria-valuenow={cand.percentage}
                                  aria-valuemin="0"
                                  aria-valuemax="100"
                                ></div>
                              </div>
                              <span className="small fw-semibold text-muted" style={{ minWidth: "40px" }}>
                                {cand.percentage}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="modern-card p-5 text-center text-muted">
          <FaVoteYea size={44} className="mb-3 text-secondary opacity-50" />
          <h5>No Results Available for Selected Election</h5>
          <p className="small">Please select an active or closed election with configured positions.</p>
        </div>
      )}
    </div>
  );
}

export default ElectionResults;