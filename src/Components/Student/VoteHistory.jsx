import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../Services/api";
import {
  FaReceipt,
  FaShieldAlt,
  FaCheckCircle,
  FaCopy,
  FaPrint,
  FaVoteYea,
  FaCalendarAlt,
  FaSyncAlt,
} from "react-icons/fa";
import Loader from "../card/Loader";

function VoteHistory() {
  const navigate = useNavigate();

  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadReceipts();
  }, []);

  const loadReceipts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/votes/my-receipts");
      if (res.data.success) {
        setReceipts(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load voting receipts.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="py-5 text-center">
        <Loader text="Loading your official voting receipts..." />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header-box d-print-none">
        <div>
          <h1 className="page-title">
            <FaReceipt className="text-primary" /> My Official Vote Receipts
          </h1>
          <p className="page-subtitle">
            Cryptographic proof-of-participation records for your confidential campus election ballots.
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            onClick={loadReceipts}
            className="btn btn-outline-secondary d-flex align-items-center gap-2"
          >
            <FaSyncAlt /> Refresh
          </button>
          {receipts.length > 0 && (
            <button
              onClick={handlePrint}
              className="btn btn-primary d-flex align-items-center gap-2 fw-semibold"
            >
              <FaPrint /> Print Receipts
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show d-print-none" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      {/* Secret Ballot Privacy Callout */}
      <div className="alert alert-info border-info border-opacity-25 d-flex align-items-start gap-3 mb-4 rounded-3 d-print-none">
        <FaShieldAlt className="text-info mt-1" size={24} />
        <div>
          <h6 className="fw-bold mb-1 text-dark">Constitutional Voter Anonymity</h6>
          <small className="text-muted">
            In compliance with campus secret ballot standards, your candidate selection is cryptographically
            decoupled from your student registration. These receipts serve as immutable mathematical proof
            that your ballot was accepted into the tally without compromising your confidential choice.
          </small>
        </div>
      </div>

      {receipts.length === 0 ? (
        <div className="modern-card p-5 text-center shadow-sm d-print-none">
          <FaReceipt size={48} className="text-muted opacity-50 mb-3" />
          <h4 className="fw-bold text-dark">No Vote Receipts Found</h4>
          <p className="text-muted small mb-4">
            You have not cast any votes in the ongoing or past campus elections yet.
          </p>
          <button
            onClick={() => navigate("/student/vote")}
            className="btn btn-primary fw-semibold d-inline-flex align-items-center gap-2"
          >
            <FaVoteYea /> Enter Voting Booth
          </button>
        </div>
      ) : (
        <div className="row g-4">
          {receipts.map((rcpt) => {
            const electionTitle = rcpt.electionId?.title || "Campus Election";
            const positionTitle = rcpt.positionId?.title || "Executive Role";

            return (
              <div key={rcpt._id} className="col-lg-6">
                <div className="modern-card p-4 h-100 border shadow-sm d-flex flex-column justify-content-between position-relative">
                  <div>
                    {/* Top Status */}
                    <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                      <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 py-2 px-3 fw-bold d-inline-flex align-items-center gap-1">
                        <FaCheckCircle /> Verified & Counted
                      </span>
                      <span className="small text-muted d-flex align-items-center gap-1">
                        <FaCalendarAlt />
                        {new Date(rcpt.timestamp).toLocaleDateString()}
                      </span>
                    </div>

                    <h5 className="fw-bold text-dark mb-1">{electionTitle}</h5>
                    <div className="text-primary fw-semibold small mb-3">
                      Ballot Position: {positionTitle}
                    </div>

                    {/* Receipt Code Box */}
                    <div className="bg-light p-3 rounded-3 border mb-3">
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <span className="small text-secondary fw-bold" style={{ fontSize: "11px" }}>
                          CRYPTOGRAPHIC RECEIPT ID
                        </span>
                        <button
                          onClick={() => handleCopy(rcpt.receiptId)}
                          className="btn btn-sm btn-link p-0 text-decoration-none d-print-none d-flex align-items-center gap-1"
                          style={{ fontSize: "12px" }}
                        >
                          <FaCopy /> {copiedId === rcpt.receiptId ? "Copied" : "Copy"}
                        </button>
                      </div>
                      <div className="font-monospace text-dark fw-bold fs-6 text-break">
                        {rcpt.receiptId}
                      </div>
                    </div>

                    <div className="small text-muted mb-0">
                      Recorded on: {new Date(rcpt.timestamp).toLocaleTimeString()} ({new Date(rcpt.timestamp).toLocaleDateString()})
                    </div>
                  </div>

                  <div className="pt-3 border-top mt-3 text-muted small fst-italic">
                    Secured by Campus Election Secret-Ballot Protocol
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default VoteHistory;