import React, { useEffect, useState } from "react";
import api from "../Services/api";
import {
  FaTrophy,
  FaMedal,
  FaVoteYea,
  FaUsers,
  FaPrint,
  FaInfoCircle,
} from "react-icons/fa";
import Loader from "../card/Loader";

function SupervisorResult() {
  const [elections, setElections] = useState([]);
  const [selectedElectionId, setSelectedElectionId] = useState("");
  const [resultsData, setResultsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchingResults, setFetchingResults] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadElections = async () => {
      try {
        setLoading(true);
        const res = await api.get("/elections");
        if (res.data.success && res.data.data.length > 0) {
          setElections(res.data.data);
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

  const loadResults = async (electionId) => {
    if (!electionId) return;
    try {
      setFetchingResults(true);
      setError("");
      const res = await api.get(`/results/${electionId}`);
      if (res.data.success) {
        setResultsData(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load results for this election.");
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

  if (loading) {
    return (
      <div className="py-5 text-center">
        <Loader text="Loading Supervisor Results..." />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header-box">
        <div>
          <h1 className="page-title">
            <FaTrophy className="text-warning" /> Supervisor Election Results & Analysis
          </h1>
          <p className="page-subtitle">
            Supervisory vote tallies, candidate rankings, and democratic outcome oversight
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="btn btn-outline-secondary d-flex align-items-center gap-2"
        >
          <FaPrint /> Print Official Tally
        </button>
      </div>

      {error && (
        <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3">
          <FaInfoCircle className="me-2" /> {error}
        </div>
      )}

      {/* Election Selector Bar */}
      <div className="modern-card p-3 mb-4">
        <div className="row align-items-center g-3">
          <div className="col-md-6">
            <label className="form-label small fw-bold mb-1">Select Election</label>
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
              <span className={`badge-custom badge-${resultsData.election.isResultsPublished ? "approved" : "upcoming"}`}>
                {resultsData.election.isResultsPublished ? "Officially Published" : "Unpublished / Interim Tally"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {fetchingResults ? (
        <div className="py-5 text-center">
          <Loader text="Calculating Ballot Tallies..." />
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
                {pos.winner ? (
                  <div className="alert alert-success d-flex align-items-center justify-content-between p-3 rounded-3 mb-4 border border-success">
                    <div className="d-flex align-items-center gap-3">
                      <div className="rounded-circle bg-warning text-dark p-2" style={{ fontSize: 24 }}>
                        🏆
                      </div>
                      <div>
                        <div className="fw-bold text-success" style={{ fontSize: "16px" }}>
                          Leading Candidate: {pos.winner.name} ({pos.winner.symbol?.icon} {pos.winner.symbol?.name})
                        </div>
                        <small className="text-muted">
                          {pos.winner.department} • {pos.winner.regNo} — {pos.winner.votes} votes ({pos.winner.percentage}%)
                        </small>
                      </div>
                    </div>
                    <span className="badge bg-success fs-6 py-2 px-3">Winner</span>
                  </div>
                ) : (
                  <div className="alert alert-light text-muted small p-2 mb-3">
                    No ballots cast for this position yet.
                  </div>
                )}

                <div className="table-responsive-wrapper">
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Candidate</th>
                        <th>Symbol</th>
                        <th>Department</th>
                        <th>Votes</th>
                        <th>Percentage</th>
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
                                  style={{ width: `${cand.percentage}%` }}
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
          <h5>No Results Found</h5>
          <p className="small">Please select an election with configured positions.</p>
        </div>
      )}
    </div>
  );
}

export default SupervisorResult;