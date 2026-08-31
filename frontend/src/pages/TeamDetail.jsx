import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchTeamById, inviteMemberToTeam, removeMemberFromTeam, fetchNearbyPlayers } from "../api";
import { useAuth } from "../context/AuthContext";
import {
  Shield,
  Users,
  UserPlus,
  Trash2,
  Trophy,
  MapPin,
  ArrowLeft,
  X,
  CheckCircle,
  Crown,
  Sparkles,
  Mail,
  AlertCircle,
  Send,
  Share2,
  Copy,
} from "lucide-react";

const TeamDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteMode, setInviteMode] = useState("select"); // "select" | "email"
  const [nearbyPlayers, setNearbyPlayers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("player");
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteFeedback, setInviteFeedback] = useState(null);
  const [error, setError] = useState("");
  const [shareCopied, setShareCopied] = useState(false);

  const handleCopySquadLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2500);
  };

  const getWhatsAppSquadUrl = () => {
    const text = `📋 Join our official sports squad "${team?.name || "Team"}" for ${team?.sport || "sports"} in ${team?.city || "Tamil Nadu"} on PlaySphere! Check our roster & try out:`;
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(`${text}\n\n🔗 ${window.location.href}`)}`;
  };

  const loadTeam = async () => {
    try {
      setLoading(true);
      const res = await fetchTeamById(id);
      if (res.data.success) {
        setTeam(res.data.team);
      }
    } catch (err) {
      console.error("Error loading team:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeam();
  }, [id]);

  // Load available players to invite
  useEffect(() => {
    if (inviteModalOpen && team) {
      fetchNearbyPlayers({ sport: team.sport, city: team.city })
        .then((res) => {
          if (res.data.success) {
            setNearbyPlayers(res.data.players || []);
          }
        })
        .catch((err) => console.warn(err));
    }
  }, [inviteModalOpen, team]);

  const isCaptain = team && user && team.captainId?._id?.toString() === user._id?.toString();

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (inviteMode === "select" && !selectedUserId) {
      setError("Please select an athlete from the list to invite.");
      return;
    }
    if (inviteMode === "email" && (!inviteEmail || !inviteEmail.includes("@"))) {
      setError("Please enter a valid recipient email address.");
      return;
    }

    try {
      setInviteLoading(true);
      setError("");
      setInviteFeedback(null);

      const payload = {
        role: inviteRole,
        message: inviteMessage,
        ...(inviteMode === "select"
          ? { invitedUserId: selectedUserId }
          : { email: inviteEmail.trim() }),
      };

      const res = await inviteMemberToTeam(id, payload);

      if (res.data.success) {
        const recipient = res.data.recipientName || (inviteMode === "email" ? inviteEmail : "Player");
        
        if (res.data.emailSent) {
          setInviteFeedback({
            type: "success",
            message: `Invite sent! ${recipient} will receive an email notification.`,
          });
        } else {
          setInviteFeedback({
            type: "warning",
            message: `Invite created, but the email notification couldn't be sent — the player will still see it in their app notifications.`,
          });
        }

        setTimeout(() => {
          setInviteFeedback(null);
          setInviteModalOpen(false);
          setSelectedUserId("");
          setInviteEmail("");
          setInviteMessage("");
        }, 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send invitation.");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm("Are you sure you want to remove this member from the roster?")) return;

    try {
      const res = await removeMemberFromTeam(id, userId);
      if (res.data.success) {
        loadTeam();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove member.");
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs text-[#9B9691]">
        <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <span>Loading sports squad roster...</span>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-court-900 border border-court-700 rounded-3xl text-center shadow-xl text-[#F5F0E6]">
        <h2 className="text-xl font-bold mb-2">Team Not Found</h2>
        <p className="text-xs text-[#9B9691] mb-6">The squad roster you are looking for does not exist.</p>
        <Link
          to="/teams"
          className="px-6 py-2.5 bg-gradient-to-r from-gold to-amber-500 text-court-950 font-black rounded-xl text-xs inline-block shadow-md shadow-gold/20"
        >
          Browse All Squads
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in text-[#F5F0E6]">
      {/* Top Header & Share Actions */}
      <div className="flex items-center justify-between">
        <Link
          to="/teams"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9B9691] hover:text-[#F5F0E6] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-gold" />
          <span>Back to Teams</span>
        </Link>

        <div className="flex items-center gap-2">
          <a
            href={getWhatsAppSquadUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Recruit on</span> WhatsApp
          </a>

          <button
            type="button"
            onClick={handleCopySquadLink}
            className="px-3 py-1.5 bg-court-850 hover:bg-court-800 border border-court-700 text-[#F5F0E6] text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            {shareCopied ? <CheckCircle className="w-3.5 h-3.5 text-gold" /> : <Share2 className="w-3.5 h-3.5 text-gold" />}
            <span>{shareCopied ? "Link Copied!" : "Share Squad"}</span>
          </button>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-court-900 border border-court-700 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-gold/5">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-court-800 border-2 border-gold/40 flex items-center justify-center text-3xl font-black text-gold shadow-inner overflow-hidden shrink-0">
            {team.logo ? (
              <img src={team.logo} alt={team.name} className="w-full h-full object-cover" />
            ) : (
              team.name.charAt(0).toUpperCase()
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-gold/15 border border-gold/30 text-gold-glow rounded-full text-xs font-bold">
                {team.sport}
              </span>
              <span className="text-xs text-[#9B9691]">• Founded {new Date(team.createdAt).getFullYear()}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-[#F5F0E6]">{team.name}</h1>

            <p className="text-xs text-[#9B9691] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-gold" />
              <span>{team.city}, Tamil Nadu</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isCaptain && (
            <button
              onClick={() => setInviteModalOpen(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-gold via-amber-400 to-gold-hover hover:from-gold-hover hover:to-amber-500 text-court-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-gold/20 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Invite Player</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-court-900 border border-court-700 rounded-2xl text-center">
          <span className="text-2xl font-black text-[#F5F0E6] block">
            {team.members?.length || 0}
          </span>
          <span className="text-[10px] font-bold text-[#9B9691] uppercase tracking-wider">
            Total Squad Size
          </span>
        </div>
        <div className="p-4 bg-court-900 border border-court-700 rounded-2xl text-center">
          <span className="text-2xl font-black text-amber-400 block">
            {team.stats?.matchesPlayed || 0}
          </span>
          <span className="text-[10px] font-bold text-[#9B9691] uppercase tracking-wider">
            Matches Played
          </span>
        </div>
        <div className="p-4 bg-court-900 border border-court-700 rounded-2xl text-center">
          <span className="text-2xl font-black text-gold block">{team.stats?.matchesWon || 0}</span>
          <span className="text-[10px] font-bold text-[#9B9691] uppercase tracking-wider">
            Matches Won
          </span>
        </div>
        <div className="p-4 bg-court-900 border border-court-700 rounded-2xl text-center">
          <span className="text-2xl font-black text-amber-400 block">
            {team.stats?.tournamentsWon || 0}
          </span>
          <span className="text-[10px] font-bold text-[#9B9691] uppercase tracking-wider">
            Trophy Titles
          </span>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-court-900 border border-court-700 rounded-3xl p-6 shadow-xl space-y-4 shadow-gold/5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#F5F0E6] flex items-center gap-2">
            <Users className="w-5 h-5 text-gold" />
            <span>Squad Roster ({team.members?.length || 0})</span>
          </h2>
        </div>

        <div className="divide-y divide-court-700">
          {(team.members || []).map((m, idx) => (
            <div key={idx} className="py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-court-800 border border-court-700 flex items-center justify-center font-bold text-gold text-sm overflow-hidden">
                  {m.userId?.profilePhoto ? (
                    <img
                      src={m.userId.profilePhoto}
                      alt={m.userId.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    m.userId?.name?.charAt(0).toUpperCase()
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-[#F5F0E6] text-sm">{m.userId?.name || "Player"}</h4>
                    {m.userId?._id?.toString() === team.captainId?._id?.toString() && (
                      <span className="px-2 py-0.5 bg-gold/20 text-gold-glow border border-gold/40 rounded-md text-[9px] font-extrabold flex items-center gap-1 shadow-sm">
                        <Crown className="w-2.5 h-2.5 text-gold" /> CAPTAIN
                      </span>
                    )}
                    {m.userId?.sport && (
                      <span className="px-2 py-0.5 bg-court-800 border border-court-700 text-gold text-[10px] font-bold rounded-md">
                        {m.userId.sport}
                      </span>
                    )}
                    {m.userId?.skillLevel && (
                      <span className="px-2 py-0.5 bg-court-800/80 border border-court-700 text-[#9B9691] text-[10px] font-semibold rounded-md capitalize">
                        {m.userId.skillLevel}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-[#9B9691] flex-wrap">
                    <span>Role: <strong className="capitalize text-[#F5F0E6]">{m.role}</strong></span>
                    {m.userId?.playerIdNumber && (
                      <>
                        <span>•</span>
                        <span className="font-mono text-gold-glow text-[10px]">{m.userId.playerIdNumber}</span>
                      </>
                    )}
                    {m.userId?.rating && (
                      <>
                        <span>•</span>
                        <span className="text-amber-400 font-bold flex items-center gap-0.5">
                          ★ {m.userId.rating}
                        </span>
                      </>
                    )}
                    <span>•</span>
                    <span>Joined {new Date(m.joinedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {m.userId?._id && (
                  <Link
                    to={`/profile/public/${m.userId._id}`}
                    className="px-3 py-1 bg-court-800 hover:bg-court-750 text-[#F5F0E6] border border-court-700 hover:border-gold/40 rounded-lg text-xs font-semibold"
                  >
                    Passport
                  </Link>
                )}

                {isCaptain && m.userId?._id?.toString() !== user._id?.toString() && (
                  <button
                    onClick={() => handleRemoveMember(m.userId._id)}
                    className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Remove Member"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Member Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-court-900 border border-court-700 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-[#F5F0E6] shadow-gold/10">
            <button
              onClick={() => setInviteModalOpen(false)}
              className="absolute top-5 right-5 text-[#9B9691] hover:text-white p-1 rounded-xl hover:bg-court-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gold/15 border border-gold/30 text-gold flex items-center justify-center shrink-0">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#F5F0E6]">Invite Athlete to Squad</h3>
                <p className="text-xs text-[#9B9691]">{team.name} • {team.sport}</p>
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-court-950 border border-court-800 rounded-2xl mb-4 text-xs font-bold">
              <button
                type="button"
                onClick={() => { setInviteMode("select"); setError(""); }}
                className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  inviteMode === "select"
                    ? "bg-court-800 text-gold border border-gold/40 shadow-sm"
                    : "text-[#9B9691] hover:text-[#F5F0E6]"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Nearby Athletes</span>
              </button>
              <button
                type="button"
                onClick={() => { setInviteMode("email"); setError(""); }}
                className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  inviteMode === "email"
                    ? "bg-court-800 text-gold border border-gold/40 shadow-sm"
                    : "text-[#9B9691] hover:text-[#F5F0E6]"
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Direct Email</span>
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {inviteFeedback && (
              <div
                className={`mb-4 p-3.5 rounded-2xl text-xs font-semibold flex items-start gap-2.5 border ${
                  inviteFeedback.type === "success"
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                    : "bg-amber-500/15 border-amber-500/30 text-amber-300"
                }`}
              >
                {inviteFeedback.type === "success" ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <Mail className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                )}
                <span className="leading-relaxed">{inviteFeedback.message}</span>
              </div>
            )}

            <form onSubmit={handleSendInvite} className="space-y-4">
              {inviteMode === "select" ? (
                <div>
                  <label className="block text-xs font-bold text-[#9B9691] uppercase mb-1">
                    Select Athlete from {team.city || "Tamil Nadu"}
                  </label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    required={inviteMode === "select"}
                    className="w-full bg-court-950 border border-court-700 rounded-xl px-4 py-2.5 text-xs text-[#F5F0E6] focus:ring-2 focus:ring-gold focus:border-gold focus:outline-none cursor-pointer"
                  >
                    <option value="" className="bg-court-900">-- Choose Athlete ({team.sport}) --</option>
                    {nearbyPlayers
                      .filter((p) => !team.members.some((m) => m.userId?._id?.toString() === p.userId?.toString()))
                      .map((p) => (
                        <option key={p.userId} value={p.userId} className="bg-court-900">
                          {p.name} ({p.skillLevel}) - {p.city}
                        </option>
                      ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-[#9B9691] uppercase mb-1">
                    Athlete's Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="athlete@example.com"
                      required={inviteMode === "email"}
                      className="w-full bg-court-950 border border-court-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#F5F0E6] focus:ring-2 focus:ring-gold focus:border-gold focus:outline-none placeholder:text-[#656C7D]"
                    />
                    <Mail className="w-4 h-4 text-[#9B9691] absolute left-3.5 top-3" />
                  </div>
                  <p className="text-[11px] text-[#9B9691] mt-1">
                    We'll email them an invite link with direct access to this team.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#9B9691] uppercase mb-1">
                  Squad Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full bg-court-950 border border-court-700 rounded-xl px-4 py-2.5 text-xs text-[#F5F0E6] focus:ring-2 focus:ring-gold focus:border-gold focus:outline-none cursor-pointer"
                >
                  <option value="player" className="bg-court-900">Player</option>
                  <option value="vice-captain" className="bg-court-900">Vice-Captain</option>
                  <option value="substitute" className="bg-court-900">Substitute</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#9B9691] uppercase mb-1">
                  Custom Message (Optional)
                </label>
                <input
                  type="text"
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  placeholder={`Join our ${team.sport} squad for upcoming fixtures!`}
                  className="w-full bg-court-950 border border-court-700 rounded-xl px-4 py-2.5 text-xs text-[#F5F0E6] focus:ring-2 focus:ring-gold focus:border-gold focus:outline-none placeholder:text-[#656C7D]"
                />
              </div>

              <button
                type="submit"
                disabled={inviteLoading || (inviteMode === "select" ? !selectedUserId : !inviteEmail)}
                className="w-full py-3 bg-gradient-to-r from-gold via-amber-400 to-gold-hover hover:from-gold-hover hover:to-amber-500 text-court-950 font-black rounded-xl shadow-lg shadow-gold/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {inviteLoading ? (
                  <span>Sending Invitation & Email...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Squad Invite</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamDetail;
