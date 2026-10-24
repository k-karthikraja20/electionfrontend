import React from "react";

function Loader() {
  return (
    <div style={styles.container}>
      <style>{`
        .spinner {
          width: 80px;
          height: 80px;
          border: 8px solid #dbeafe;
          border-top: 8px solid #2563eb;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .loading {
          color: #1e3a8a;
          font-size: 28px;
          font-weight: bold;
          margin-top: 20px;
          letter-spacing: 2px;
        }

        .dots span {
          animation: blink 1.4s infinite;
        }

        .dots span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .dots span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes blink {
          0%, 80%, 100% { opacity: 0; }
          40% { opacity: 1; }
        }
      `}</style>

      <div className="spinner"></div>

      <h1 className="loading">
        Loading
        <span className="dots">
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </span>
      </h1>

      <p style={{ color: "#475569", fontSize: "18px", marginTop: "10px" }}>
        Campus Election Voting System
      </p>
    </div>
  );
}

const styles = {
  container: {
    width: "100%",
    height: "100vh",
    background: "#F8FAFC", // Light background
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Arial, sans-serif",
  },
};

export default Loader;