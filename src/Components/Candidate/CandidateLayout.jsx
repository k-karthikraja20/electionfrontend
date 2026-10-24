import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import CandidateNavbar from "./CandidateNavbar";
import CandidateSidebar from "./CandidateSidebar";

function CandidateLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell d-flex" style={{ minHeight: "100vh" }}>
      <CandidateSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-wrapper flex-grow-1 d-flex flex-column" style={{ minWidth: 0 }}>
        <CandidateNavbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="content-container p-3 p-md-4 flex-grow-1 bg-light">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default CandidateLayout;
