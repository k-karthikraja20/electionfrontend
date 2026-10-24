import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import SupervisorNavbar from "./SupervisorNavbar";
import SupervisorSidebar from "./SupervisorSidebar";

function SupervisorLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <SupervisorSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-wrapper">
        <SupervisorNavbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="content-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default SupervisorLayout;
