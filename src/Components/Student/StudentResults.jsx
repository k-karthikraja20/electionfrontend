import React, { useEffect, useState } from "react";
import api from "../Services/api";
import {
  FaTrophy,
  FaVoteYea,
  FaCalendarAlt,
  FaCheckCircle,
  FaInfoCircle,
  FaMedal,
  FaHandshake,
} from "react-icons/fa";
import Loader from "../card/Loader";

function StudentResults() {
  const [elections, setElections] = useState([]);
  const [selectedElectionId, setSelectedElectionId] = useState("");
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchingResult, setFetchingResult] = useState(false);
  const [error, setError] = useState("");

  // Load elections
  useEffect(() => {
    const loadElections = async () => {
      try {
        setLoading(true);
        const res = await api.get("/elections");
        if (res.data.success && res.data.data.length > 0) {
          setElections(res.data.data);
          // Auto select first closed or active election
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

  // Fetch results when selected election changes
  const fetchResult = async (electionId) => {
    if (!electionId) return;
    try {
      setFetchingResult(true);
      setError("");
      const res = await api.get(`/results/${electionId}`);
      if (res.data) {
        setResultData(res.data);
      }
    } catch (err) {
      // If 403 or error message
      if (err.response?.status === 403 || err.response?.data?.published === false) {
        setResultData({
          published: false,
          message: err.response?.data?.message || "Election results have not been published yet.",
        });
      } else {
        setError(err.response?.data?.message || "Could not load results.");
        setResultData(null);
      }
    } finally {
      setFetchingResult(false);
    }
  };

  useEffect(() => {
    if (selectedElectionId) {
      fetchResult(selectedElectionId);
    }
  }, [selectedElectionId]);

  if (loading) {
    return (
      <div className="py-5 text-center">
        <Loader text="Loading Election Results Portal..." />
      </div>
    );
  }

  const selectedElection = elections.find((e) => e._id === selectedElectionId);

  return (
    <div>
      {/* Header */}
      <div className="page-header-box mb-4">
        <div>
          <h1 className="page-title">
            <FaTrophy className="text-warning" /> Campus Election Results
          </h1>
          <p className="page-subtitle">
            Official ballot tallies, percentage distributions, and certified student council winners
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger py-2 px-3 small rounded-3 mb-4">
          <FaInfoCircle className="me-2" /> {error}
        </div>
      )}

      {/* Election Selector */}
      <div className="modern-card p-3 mb-4">
        <div className="row align-items-center g-3">
          <div className="col-md-6">
            <label className="form-label small fw-bold mb-1">Choose Election</label>
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
            {resultData && (
              <span className={`badge-custom badge-${resultData.published ? "approved" : "upcoming"}`}>
                {resultData.published ? "✓ Officially Published" : "🔒 Results Not Published Yet"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {fetchingResult ? (
        <div className="py-5 text-center">
          <Loader text="Loading Official Vote Counts..." />
        </div>
      ) : resultData?.published ? (
        /* AFTER PUBLISHING: SHOW FULL RESULTS */
        <div className="d-flex flex-column gap-4">
          {resultData.data?.positions?.map((pos) => (
            <div key={pos.positionId} className="modern-card">
              <div className="modern-card-header bg-light d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-2">
                  <h5 className="modern-card-title mb-0">{pos.positionTitle}</h5>
                  <span className="badge bg-secondary text-white small">
                    {pos.totalVotes} total votes cast
                  </span>
                </div>
                {pos.isTie && (
                  <span className="badge bg-warning text-dark">
                    <FaHandshake className="me-1" /> TIE OUTCOME
                  </span>
                )}
              </div>

              <div className="modern-card-body">
                {/* Winner Spotlight */}
                {pos.winner ? (
                  <div className="alert alert-success d-flex align-items-center justify-content-between p-3 rounded-3 mb-4 border border-success">
                    <div className="d-flex align-items-center gap-3">
                      <div className="rounded-circle bg-warning text-dark p-2" style={{ fontSize: 24 }}>
                        🏆
                      </div>
                      <div>
                        <div className="fw-bold text-success" style={{ fontSize: "16px" }}>
                          Declared Winner: {pos.winner.name} ({pos.winner.symbol?.icon} {pos.winner.symbol?.name})
                        </div>
                        <small className="text-muted">
                          {pos.winner.department} • {pos.winner.regNo} — Won with {pos.winner.votes} votes ({pos.winner.percentage}%)
                        </small>
                      </div>
                    </div>
                    <span className="badge bg-success fs-6 py-2 px-3">WINNER</span>
                  </div>
                ) : pos.isTie ? (
                  <div className="alert alert-warning d-flex align-items-center gap-3 p-3 rounded-3 mb-4 border border-warning">
                    <FaHandshake size={28} className="text-warning-emphasis flex-shrink-0" />
                    <div>
                      <div className="fw-bold text-warning-emphasis">Election Tie for Top Position</div>
                      <small className="text-muted">
                        Multiple candidates achieved the identical highest vote tally. No single winner is declared per electoral regulations.
                      </small>
                    </div>
                  </div>
                ) : (
                  <div className="alert alert-light text-muted small p-2 mb-3">
                    No ballots cast for this position.
                  </div>
                )}

                {/* Candidate Breakdown */}
                <div className="table-responsive-wrapper">
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Candidate</th>
                        <th>Symbol</th>
                        <th>Department</th>
                        <th>Votes</th>
                        <th>Vote Share (%)</th>
                        <th>Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pos.candidates?.map((cand) => (
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
                          <td style={{ width: "240px" }}>
                            <div className="d-flex align-items-center gap-2">
                              <div className="progress flex-grow-1" style={{ height: "8px" }}>
                                <div
                                  className="progress-bar bg-primary"
                                  style={{ width: `${cand.percentage}%` }}
                                ></div>
                              </div>
                              <span className="small fw-semibold text-muted" style={{ minWidth: "45px" }}>
                                {cand.percentage}%
                              </span>
                            </div>
                          </td>
                          <td>
                            {cand.winner ? (
                              <span className="badge bg-success py-1 px-2">🏆 WINNER</span>
                            ) : cand.isTie ? (
                              <span className="badge bg-warning text-dark py-1 px-2">🤝 TIE</span>
                            ) : (
                              <span className="text-muted small">Not Winner</span>
                            )}
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
        /* BEFORE PUBLISHING: STRICTLY SHOW NOT PUBLISHED */
        <div className="modern-card p-5 text-center border">
          <div
            className="rounded-circle bg-light text-muted d-inline-flex align-items-center justify-content-center mb-3"
            style={{ width: 72, height: 72, fontSize: 32 }}
          >
            🔒
          </div>
          <h4 className="fw-bold text-dark mb-2">Results Not Published Yet</h4>
          <p className="text-muted small mx-auto mb-0" style={{ maxWidth: "520px" }}>
            The election commission has not released the official vote counts for{" "}
            <strong>{selectedElection?.title || "this election"}</strong> yet.
            Vote counts and declared winners will be displayed immediately once officially published by the administration.
          </p>
        </div>
      )}
    </div>
  );
}

export default StudentResults;
