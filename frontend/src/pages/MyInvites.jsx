import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchMyTeamInvites, respondTeamInvite } from "../api";
import {
  Mail,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import confetti from "canvas-confetti";

const MyInvites = () => {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const loadInvites = async () => {
    try {
      setLoading(true);
      const res = await fetchMyTeamInvites();
      if (res.data.success) {
        setInvites(res.data.invites || []);
      }
    } catch (err) {
      console.error("Error loading invites:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvites();
  }, []);

  const handleRespond = async (inviteId, action) => {
    try {
      setActionLoading(inviteId);
      const res = await respondTeamInvite(inviteId, { action, status: action });
      if (res.data.success) {
        if (action === "accepted") {
          try {
            confetti({
              particleCount: 60,
              spread: 60,
              origin: { y: 0.6 },
              colors: ["#D4AF37", "#F0B90B", "#F5F0E6"],
            });
          } catch {}
        }
        setInvites((prev) =>
          prev.map((i) => (i._id === inviteId ? { ...i, status: action } : i))
        );
      }
    } catch (err) {
      console.error("Invite response error:", err);
      alert(err.response?.data?.message || "Failed to respond to invite.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in text-[#F5F0E6]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Mail className="w-6 h-6 text-gold" />
            <h1 className="text-2xl sm:text-3xl font-black text-[#F5F0E6]">Squad Invitations</h1>
          </div>
          <p className="text-xs text-[#9B9691] mt-1">
            Accept team invitations to join tournament rosters and represent your club
          </p>
        </div>

        <Link
          to="/teams"
          className="px-4 py-2 bg-court-850 hover:bg-court-800 border border-court-700 hover:border-gold/40 text-[#F5F0E6] text-xs font-bold rounded-xl transition-colors self-start sm:self-auto"
        >
          View All Teams
        </Link>
      </div>

      {/* Invites List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 bg-court-900 border border-court-700 rounded-3xl animate-pulse"
            ></div>
          ))}
        </div>
      ) : invites.length === 0 ? (
        <div className="bg-court-900 border border-court-700 rounded-3xl p-12 text-center max-w-md mx-auto shadow-xl">
          <Mail className="w-12 h-12 text-gold/40 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-[#F5F0E6] mb-1">No Pending Invitations</h3>
          <p className="text-xs text-[#9B9691] mb-6">
            When team captains invite you to join their squads, their invites will appear here.
          </p>
          <Link
            to="/players"
            className="px-5 py-2.5 bg-gradient-to-r from-gold to-amber-500 text-court-950 font-black rounded-xl text-xs shadow-md shadow-gold/20"
          >
            Connect With Other Players
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {invites.map((inv) => (
            <div
              key={inv._id}
              className="bg-court-900 border border-court-700 hover:border-gold/40 rounded-3xl p-6 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 transition-colors shadow-gold/5"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-gold/15 border border-gold/30 text-gold-glow text-[10px] font-bold rounded-full">
                    {inv.teamId?.sport || "Sports"} Squad
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      inv.status === "pending"
                        ? "bg-amber-500/20 text-amber-300"
                        : inv.status === "accepted"
                        ? "bg-gold/20 text-gold font-black"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {inv.status}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[#F5F0E6] flex items-center gap-2">
                  <Shield className="w-5 h-5 text-gold" />
                  <span>{inv.teamId?.name || "Sports Team"}</span>
                </h3>

                <p className="text-xs text-[#9B9691]">
                  Invited by <strong className="text-[#F5F0E6]">{inv.invitedBy?.name}</strong> to join as{" "}
                  <strong className="text-gold capitalize">{inv.role}</strong>.
                </p>

                {inv.message && (
                  <p className="text-xs text-[#F5F0E6] italic bg-court-950 p-2.5 rounded-xl border border-court-700">
                    "{inv.message}"
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-court-700 justify-end">
                {inv.status === "pending" ? (
                  <>
                    <button
                      onClick={() => handleRespond(inv._id, "accepted")}
                      disabled={actionLoading === inv._id}
                      className="px-4 py-2 bg-gradient-to-r from-gold to-amber-500 hover:from-gold-hover hover:to-amber-600 text-court-950 font-black rounded-xl text-xs transition-all flex items-center gap-1.5 disabled:opacity-50 shadow-md shadow-gold/20"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Accept</span>
                    </button>
                    <button
                      onClick={() => handleRespond(inv._id, "rejected")}
                      disabled={actionLoading === inv._id}
                      className="px-4 py-2 bg-court-800 hover:bg-red-500/20 text-[#9B9691] hover:text-red-300 font-semibold rounded-xl text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 border border-court-700"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Decline</span>
                    </button>
                  </>
                ) : (
                  <Link
                    to={`/teams/${inv.teamId?._id}`}
                    className="px-4 py-2 bg-court-800 text-[#F5F0E6] hover:bg-gold hover:text-court-950 border border-court-700 rounded-xl text-xs font-bold transition-colors"
                  >
                    View Team Page →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyInvites;
