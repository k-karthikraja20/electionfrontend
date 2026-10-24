import React from "react";
import RoleRoute from "./RoleRoute";

// Unified ProtectedRoute that delegates to RoleRoute
const ProtectedRoute = ({ allowedRoles }) => {
  return <RoleRoute allowedRoles={allowedRoles} />;
};

export default ProtectedRoute;
