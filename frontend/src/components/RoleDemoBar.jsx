import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Medal,
  Briefcase,
  Building2,
  Crown,
  LogOut,
  ChevronDown,
  ChevronUp,
  Share2,
  ShieldCheck,
} from "lucide-react";

const DEMO_ACCOUNTS = [
  {
    role: "player",
    label: "Player",
    name: "Ananya Ramesh",
    email: "ananya@playsphere.com",
    icon: Medal,
    badgeColor: "bg-gold/20 text-gold border-gold/40",
    description: "Digital sports passport, nearby player search, court booking & tournament knockout bracket.",
  },
  {
    role: "coach",
    label: "Coach",
    name: "Coach Ramanathan",
    email: "coach@playsphere.com",
    icon: Briefcase,
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    description: "Squad creation, player roster management, tryouts scouting & tournament team entry.",
  },
  {
    role: "ground_owner",
    label: "Ground Owner",
    name: "S. Vignesh",
    email: "owner@playsphere.com",
    icon: Building2,
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    description: "Turf listing, 1-hour slot scheduling engine, QR payments & booking revenue management.",
  },
  {
    role: "super_admin",
    label: "Super Admin",
    name: "Lokesh Kumar",
    email: "demo@playsphere.com",
    icon: Crown,
    badgeColor: "bg-amber-400/20 text-amber-300 border-amber-400/50",
    description: "Platform-wide operations, security audit logs, match live scorer assignment & venue approvals.",
  },
];

const RoleDemoBar = ({ onOpenShareModal }) => {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [switching, setSwitching] = useState(false);

  const handleSwitchRole = async (email) => {
    try {
      setSwitching(true);
      const res = await login(email, "password123");
      if (res.success) {
        if (res.user.role === "ground_owner") {
          navigate("/venues");
        } else if (res.user.role === "coach") {
          navigate("/teams");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (err) {
      console.warn("Failed to switch demo account:", err);
    } finally {
      setSwitching(false);
    }
  };

  const handleGuestMode = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="bg-court-950/95 border-b border-court-750 text-xs py-1.5 px-4 sticky top-16 z-30 shadow-md backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Left: Role Indicator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-gold/10 border border-gold/30 text-gold text-[11px] font-bold">
            <Sparkles className="w-3 h-3 text-gold" />
            <span className="hidden sm:inline">1-Click Role Showcase:</span>
            <span className="sm:hidden">Roles:</span>
          </div>

          <span className="text-[11px] text-[#9B9691] hidden md:inline">
            Active:{" "}
            <strong className="text-[#F5F0E6] capitalize">
              {user ? user.role.replace("_", " ") : "Public Guest"}
            </strong>{" "}
            {user && `(${user.name.split(" ")[0]})`}
          </span>
        </div>

        {/* Center: Fast Demo Switch Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          {DEMO_ACCOUNTS.map((acc) => {
            const Icon = acc.icon;
            const isActive =
              (user?.email?.toLowerCase() === acc.email.toLowerCase()) ||
              (user?.role === acc.role && !["super_admin", "admin"].includes(acc.role));

            return (
              <button
                key={acc.role}
                type="button"
                disabled={switching}
                onClick={() => handleSwitchRole(acc.email)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all shrink-0 ${
                  isActive
                    ? `${acc.badgeColor} ring-1 ring-gold shadow-sm font-black`
                    : "bg-court-900 border border-court-700 text-[#9B9691] hover:text-[#F5F0E6] hover:bg-court-850"
                }`}
                title={acc.description}
              >
                <Icon className="w-3 h-3" />
                <span>{acc.label}</span>
              </button>
            );
          })}

          {user && (
            <button
              type="button"
              onClick={handleGuestMode}
              className="px-2 py-1 bg-court-900 hover:bg-red-500/20 text-[#9B9691] hover:text-red-300 border border-court-700 hover:border-red-500/40 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1 shrink-0"
              title="Logout to view platform as unauthenticated visitor"
            >
              <LogOut className="w-3 h-3" />
              <span className="hidden sm:inline">Guest</span>
            </button>
          )}
        </div>

        {/* Right: Quick Share Hub Trigger */}
        <div className="flex items-center gap-2">
          {onOpenShareModal && (
            <button
              type="button"
              onClick={onOpenShareModal}
              className="px-2.5 py-1 bg-gold/15 hover:bg-gold/25 border border-gold/40 text-gold text-[11px] font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Share2 className="w-3 h-3" />
              <span>Share Platform</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-[#9B9691] hover:text-[#F5F0E6] transition-colors"
            title={isExpanded ? "Collapse Role Guide" : "Expand Role Guide"}
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Role Explanation Dropdown */}
      {isExpanded && (
        <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-court-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in pb-1">
          {DEMO_ACCOUNTS.map((acc) => {
            const Icon = acc.icon;
            return (
              <div
                key={acc.role}
                onClick={() => handleSwitchRole(acc.email)}
                className="p-2.5 bg-court-900/90 border border-court-750 hover:border-gold/40 rounded-xl cursor-pointer transition-all hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className="w-3.5 h-3.5 text-gold" />
                  <span className="font-bold text-[#F5F0E6] text-xs">{acc.name}</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded border ${acc.badgeColor}`}>
                    {acc.label}
                  </span>
                </div>
                <p className="text-[10px] text-[#9B9691] leading-relaxed line-clamp-2">
                  {acc.description}
                </p>
                <span className="text-[9px] text-gold font-mono block mt-1">
                  Click to switch instantly →
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RoleDemoBar;
