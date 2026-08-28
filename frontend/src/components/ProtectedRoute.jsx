import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, requireProfileComplete = true }) => {
  const { user, token, loading, hasCompletedProfile } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-court-950 flex flex-col items-center justify-center text-[#9B9691]">
        <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-medium text-xs">Loading PlaySphere Arena...</p>
      </div>
    );
  }

  // Not logged in -> send to login
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but has not completed profile -> force to /profile/create
  if (requireProfileComplete && !hasCompletedProfile && location.pathname !== "/profile/create") {
    return <Navigate to="/profile/create" replace />;
  }

  return children;
};

export default ProtectedRoute;
