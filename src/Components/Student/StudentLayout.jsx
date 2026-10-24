import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import StudentNavbar from "./StudentNavbar";
import StudentSidebar from "./StudentSidebar";

function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <StudentSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-wrapper">
        <StudentNavbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="content-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default StudentLayout;
