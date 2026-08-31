import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Trophy,
  Users,
  Calendar,
  Radio,
  BookOpen,
  Building2,
  Shield,
  Menu,
  X,
  User,
  LogOut,
  Sparkles,
  Share2,
  Ticket,
  Mail,
  ChevronDown,
  Crown,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import NotificationDropdown from "./NotificationDropdown";
import ShareHubModal from "./ShareHubModal";
import RoleDemoBar from "./RoleDemoBar";

const NAV_LINKS = [
  { name: "Dashboard", path: "/dashboard", icon: Trophy },
  { name: "Find Players", path: "/players", icon: Users },
  { name: "Venues", path: "/venues", icon: Calendar },
  { name: "Teams", path: "/teams", icon: Shield },
  { name: "Tournaments", path: "/tournaments", icon: Trophy },
  { name: "Live Scores", path: "/live", icon: Radio, badge: "LIVE" },
  { name: "Rules", path: "/rules", icon: BookOpen },
  { name: "Sports Bodies", path: "/official-bodies", icon: Building2 },
  { name: "Clubs", path: "/clubs", icon: Shield },
];

const Navbar = () => {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  const isSuperAdmin = user?.role === "super_admin" || user?.role === "admin";
  const isVenueAdminOnly = user?.role === "venue_admin";
  const isAdmin = isSuperAdmin || isVenueAdminOnly;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-court-950/90 backdrop-blur-md border-b border-court-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-11 h-11 rounded-xl bg-court-900 p-0.5 border border-gold/40 overflow-hidden flex items-center justify-center shadow-lg shadow-gold/20 group-hover:scale-105 transition-transform">
                <img src="/logo.png" alt="PlaySphere Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-[#F5F0E6] flex items-center gap-1">
                  PLAY<span className="text-gold">SPHERE</span>
                </span>
                <span className="text-[10px] text-gold/80 font-bold tracking-widest block uppercase -mt-1">
                  Tamil Nadu Sports
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links (Strictly Player-Facing) */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.name}
                    to={link.path}
                    className={({ isActive }) =>
                      `px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        isActive
                          ? "bg-gold/15 text-gold border border-gold/40 shadow-sm shadow-gold/10"
                          : "text-[#9B9691] hover:text-[#F5F0E6] hover:bg-court-850"
                      }`
                    }
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{link.name}</span>
                    {link.badge && (
                      <span className="px-1.5 py-0.2 bg-red-500/20 text-red-400 border border-red-500/40 text-[9px] font-extrabold rounded-md animate-pulse">
                        {link.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2.5">
              {/* Elevated Admin Panel Button */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className={`hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all shadow-md border ${
                    isSuperAdmin
                      ? "bg-gold/20 hover:bg-gold/30 text-gold-glow border-gold/60 shadow-[0_0_12px_rgba(240,185,11,0.2)]"
                      : "bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-500/50 shadow-amber-500/10"
                  }`}
                >
                  {isSuperAdmin ? (
                    <Crown className="w-3.5 h-3.5 text-gold-glow" />
                  ) : (
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span>Admin Panel</span>
                </Link>
              )}

              {/* Invite Players Trigger */}
              <button
                onClick={() => setInviteModalOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-court-850 hover:bg-court-800 border border-court-700 text-[#F5F0E6] text-xs font-semibold rounded-xl transition-colors hover:border-gold/30"
              >
                <Share2 className="w-3.5 h-3.5 text-gold" />
                <span>Invite</span>
              </button>

              {user ? (
                <>
                  {/* Notifications */}
                  <NotificationDropdown />

                  {/* User Profile Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                      className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-court-850 transition-colors border border-transparent hover:border-court-700"
                    >
                      <div className="w-8 h-8 rounded-lg bg-court-800 border border-gold/40 overflow-hidden flex items-center justify-center text-xs font-bold text-gold">
                        {profile?.profilePhoto ? (
                          <img
                            src={profile.profilePhoto}
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          user.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="hidden md:inline text-xs font-bold text-[#F5F0E6] max-w-[100px] truncate">
                          {user.name.split(" ")[0]}
                        </span>
                        {isSuperAdmin && (
                          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 bg-gold/20 border border-gold/50 text-gold-glow text-[10px] font-black rounded-md shadow-sm shadow-gold/20">
                            👑 Super Admin
                          </span>
                        )}
                        {isVenueAdminOnly && (
                          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[10px] font-black rounded-md">
                            🛡️ Venue Admin
                          </span>
                        )}
                        {user.role === "coach" && (
                          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/20 border border-blue-500/40 text-blue-300 text-[10px] font-black rounded-md">
                            📋 Coach
                          </span>
                        )}
                        {user.role === "ground_owner" && (
                          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-black rounded-md">
                            🏟️ Turf Owner
                          </span>
                        )}
                        {user.role === "player" && (
                          <span className="hidden sm:inline-flex items-center px-2 py-0.5 bg-court-800 border border-gold/20 text-[#9B9691] text-[10px] font-bold rounded-md">
                            Athlete
                          </span>
                        )}
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-[#9B9691]" />
                    </button>

                    {/* Profile Dropdown Menu */}
                    {profileDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-court-900 border border-court-700 rounded-2xl shadow-2xl z-50 py-2 divide-y divide-court-700 animate-fade-in text-[#F5F0E6] text-xs font-medium">
                        <div className="px-4 py-2.5">
                          <p className="font-bold text-[#F5F0E6] truncate">{user.name}</p>
                          <p className="text-[11px] text-[#9B9691] truncate">{user.email}</p>
                          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                            <span className="inline-block font-mono text-[10px] text-gold bg-gold/10 px-2 py-0.5 rounded border border-gold/30">
                              {profile?.playerIdNumber || (user.role === "coach" ? "PS-COACH-001" : user.role === "ground_owner" ? "PS-VENUE-001" : `PS-2026-${user._id?.slice(-5).toUpperCase()}`)}
                            </span>
                            {isSuperAdmin && (
                              <span className="px-2 py-0.5 bg-gold/20 text-gold-glow border border-gold/50 text-[9px] font-black rounded-md">
                                Super Admin
                              </span>
                            )}
                            {user.role === "coach" && (
                              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[9px] font-black rounded-md">
                                Certified Coach
                              </span>
                            )}
                            {user.role === "ground_owner" && (
                              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-black rounded-md">
                                Ground Owner
                              </span>
                            )}
                            {user.role === "player" && (
                              <span className="px-2 py-0.5 bg-gold/15 text-gold border border-gold/40 text-[9px] font-bold rounded-md">
                                Verified Athlete
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-[#656C7D] mt-1.5">
                            📅 Member Since: {new Date(user?.createdAt || profile?.joinedDate || Date.now()).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </div>

                        {isAdmin && (
                          <div className="py-1 bg-gold/5">
                            <Link
                              to="/admin"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 hover:bg-court-800 text-gold font-bold"
                            >
                              <Crown className="w-4 h-4 text-gold" />
                              <span>Admin Dashboard</span>
                            </Link>
                          </div>
                        )}

                        <div className="py-1">
                          <Link
                            to="/profile"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 hover:bg-court-800 hover:text-white"
                          >
                            <User className="w-4 h-4 text-gold" />
                            <span>My Sports Profile & ID Card</span>
                          </Link>
                          <Link
                            to="/bookings"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 hover:bg-court-800 hover:text-white"
                          >
                            <Ticket className="w-4 h-4 text-action" />
                            <span>My Court Bookings</span>
                          </Link>
                          <Link
                            to="/invites"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 hover:bg-court-800 hover:text-white"
                          >
                            <Mail className="w-4 h-4 text-gold-light" />
                            <span>Team Invites</span>
                          </Link>
                        </div>

                        <div className="py-1">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-3.5 py-1.5 text-xs font-semibold text-[#9B9691] hover:text-[#F5F0E6] transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-1.5 bg-gradient-to-r from-gold to-amber-500 hover:from-gold-hover hover:to-amber-600 text-court-950 font-bold rounded-xl text-xs shadow-md shadow-gold/20 transition-all transform hover:-translate-y-0.5"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-[#9B9691] hover:text-white hover:bg-court-800"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-court-950 border-b border-court-700 px-4 pt-2 pb-6 space-y-2 animate-fade-in">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      isActive
                        ? "bg-gold/20 text-gold border border-gold/30"
                        : "text-[#9B9691] hover:text-white hover:bg-court-900"
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{link.name}</span>
                  </div>
                  {link.badge && (
                    <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-bold rounded-md">
                      {link.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}

            {isAdmin && (
              <div className="pt-2 border-t border-court-700">
                <NavLink
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-black transition-all border ${
                    isSuperAdmin
                      ? "bg-gold/20 text-gold-glow border-gold/50 shadow-sm shadow-gold/20"
                      : "bg-amber-500/15 text-amber-300 border-amber-500/40"
                  }`}
                >
                  {isSuperAdmin ? <Crown className="w-4 h-4 text-gold-glow" /> : <ShieldCheck className="w-4 h-4 text-amber-400" />}
                  <span>Admin Control Center</span>
                </NavLink>
              </div>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setInviteModalOpen(true);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gold hover:bg-court-900"
            >
              <Share2 className="w-4 h-4" />
              <span>Share & Invite Hub</span>
            </button>
          </div>
        )}
      </header>

      {/* 1-Click Role Switcher & Public Demo Bar */}
      <RoleDemoBar onOpenShareModal={() => setInviteModalOpen(true)} />

      {/* Unified Public Sports Share Hub Modal */}
      <ShareHubModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        defaultTab={
          user?.role === "coach"
            ? "coach"
            : user?.role === "ground_owner"
            ? "owner"
            : "player"
        }
      />
    </>
  );
};

export default Navbar;
