import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SportsProvider } from "./context/SportsContext";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import ChatbotWidget from "./components/ChatbotWidget";
import ErrorBoundary from "./components/ErrorBoundary";

// Pages
import Dashboard from "./pages/Dashboard";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import VerifyEmail from "./pages/VerifyEmail";
import ProfileCreate from "./pages/ProfileCreate";
import Profile from "./pages/Profile";
import PublicProfile from "./pages/PublicProfile";
import FindPlayers from "./pages/FindPlayers";
import Venues from "./pages/Venues";
import VenueDetail from "./pages/VenueDetail";
import MyBookings from "./pages/MyBookings";
import Teams from "./pages/Teams";
import TeamDetail from "./pages/TeamDetail";
import MyInvites from "./pages/MyInvites";
import Tournaments from "./pages/Tournaments";
import TournamentDetail from "./pages/TournamentDetail";
import LiveMatches from "./pages/LiveMatches";
import MatchLive from "./pages/MatchLive";
import GameRules from "./pages/GameRules";
import OfficialBodies from "./pages/OfficialBodies";
import Clubs from "./pages/Clubs";
import JoinInvite from "./pages/JoinInvite";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

function AppRoutes() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-court-950 text-[#F5F0E6] selection:bg-gold selection:text-court-950 font-sans">
      <Navbar />

      <main className="flex-1">
        <Routes>
          {/* Public & Home Routes */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* Onboarding Profile Create Route (Requires login, but exempt from profile complete check) */}
          <Route
            path="/profile/create"
            element={
              <ProtectedRoute requireProfileComplete={false}>
                <ProfileCreate />
              </ProtectedRoute>
            }
          />

          {/* Protected Main Features */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/players"
            element={
              <ProtectedRoute>
                <FindPlayers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/invites"
            element={
              <ProtectedRoute>
                <MyInvites />
              </ProtectedRoute>
            }
          />

          {/* Public Profiles & Join Links */}
          <Route path="/profile/public/:userId" element={<PublicProfile />} />
          <Route path="/join/:inviteCode" element={<JoinInvite />} />

          {/* Venues & Court Bookings */}
          <Route path="/venues" element={<Venues />} />
          <Route path="/venues/:id" element={<VenueDetail />} />

          {/* Teams */}
          <Route path="/teams" element={<Teams />} />
          <Route path="/teams/:id" element={<TeamDetail />} />

          {/* Tournaments */}
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/tournaments/:id" element={<TournamentDetail />} />

          {/* Live Matches & Scores */}
          <Route path="/live" element={<LiveMatches />} />
          <Route path="/live/:id" element={<MatchLive />} />
          <Route path="/matches/:id" element={<MatchLive />} />

          {/* Admin Management */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Game Rules & Directory */}
          <Route path="/rules" element={<GameRules />} />
          <Route path="/official-bodies" element={<OfficialBodies />} />
          <Route path="/clubs" element={<Clubs />} />

          {/* 404 Catch-All */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />

      {/* Floating AI Sports Referee & Rules Chatbot */}
      <ChatbotWidget />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SportsProvider>
          <AppRoutes />
        </SportsProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
