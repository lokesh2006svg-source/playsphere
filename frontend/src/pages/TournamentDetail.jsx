import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  fetchTournamentById,
  registerTournamentTeam,
  generateTournamentBracket,
  fetchTeams,
} from "../api";
import { useAuth } from "../context/AuthContext";
import {
  Trophy,
  Calendar,
  MapPin,
  Users,
  Shield,
  ArrowLeft,
  ArrowRight,
  Plus,
  Radio,
  CheckCircle2,
  Sparkles,
  Award,
  Layers,
  X,
  Share2,
  Send,
  Copy,
} from "lucide-react";
import confetti from "canvas-confetti";

const TournamentDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [tournament, setTournament] = useState(null);
  const [registeredTeams, setRegisteredTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [myTeams, setMyTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Register Modal
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState("");

  // Bracket Generation
  const [bracketLoading, setBracketLoading] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const handleCopyTournamentLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2500);
  };

  const getWhatsAppTournamentUrl = () => {
    const text = `🏆 Track knockout match fixtures & tournament bracket for "${tournament?.name || "Championship"}" in ${tournament?.city || "Tamil Nadu"} on PlaySphere:`;
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(`${text}\n\n🔗 ${window.location.href}`)}`;
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchTournamentById(id);
      if (res.data.success) {
        setTournament(res.data.tournament);
        setRegisteredTeams(res.data.registeredTeams || []);
        setMatches(res.data.matches || []);
      }
    } catch (err) {
      console.error("Error loading tournament details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  useEffect(() => {
    if (user && registerModalOpen) {
      fetchTeams({ myTeams: "true", sport: tournament?.sport })
        .then((res) => {
          if (res.data.success) {
            setMyTeams(res.data.teams || []);
          }
        })
        .catch((err) => console.warn(err));
    }
  }, [user, registerModalOpen, tournament]);

  const isOrganizer =
    user && tournament && tournament.organizerId?._id?.toString() === user._id?.toString();

  const handleRegisterTeam = async (e) => {
    e.preventDefault();
    if (!selectedTeamId) {
      setRegisterError("Please select a team.");
      return;
    }

    try {
      setRegisterLoading(true);
      setRegisterError("");
      const res = await registerTournamentTeam(id, selectedTeamId);
      if (res.data.success) {
        setRegisterModalOpen(false);
        try {
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 }, colors: ["#D4AF37", "#F0B90B", "#F5F0E6"] });
        } catch {}
        loadData();
      }
    } catch (err) {
      setRegisterError(err.response?.data?.message || "Failed to register team.");
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleGenerateBracket = async () => {
    if (!window.confirm("Generate automated knockout bracket with all registered teams?")) return;

    try {
      setBracketLoading(true);
      const res = await generateTournamentBracket(id);
      if (res.data.success) {
        loadData();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to generate bracket.");
    } finally {
      setBracketLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs text-[#9B9691]">
        <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <span>Loading tournament championship cup...</span>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-court-900 border border-court-700 rounded-3xl text-center shadow-xl text-[#F5F0E6]">
        <h2 className="text-xl font-bold mb-2">Tournament Not Found</h2>
        <p className="text-xs text-[#9B9691] mb-6">The tournament cup you requested does not exist.</p>
        <Link
          to="/tournaments"
          className="px-6 py-2.5 bg-gradient-to-r from-gold to-amber-500 text-court-950 font-black rounded-xl text-xs inline-block shadow-md shadow-gold/20"
        >
          Browse All Tournaments
        </Link>
      </div>
    );
  }

  // Group bracket matches by round
  const roundMap = {};
  matches.forEach((m) => {
    const r = m.round || 1;
    if (!roundMap[r]) roundMap[r] = [];
    roundMap[r].push(m);
  });
  const roundKeys = Object.keys(roundMap).sort((a, b) => Number(a) - Number(b));

  const getRoundLabel = (roundNum, totalRounds) => {
    const r = Number(roundNum);
    if (r === totalRounds) return "🏆 Championship Final";
    if (r === totalRounds - 1) return "Semi-Finals";
    if (r === totalRounds - 2) return "Quarter-Finals";
    return `Round of ${Math.pow(2, totalRounds - r + 1)}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in text-[#F5F0E6]">
      {/* Top Header & Share Actions */}
      <div className="flex items-center justify-between">
        <Link
          to="/tournaments"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9B9691] hover:text-[#F5F0E6] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-gold" />
          <span>Back to Tournaments</span>
        </Link>

        <div className="flex items-center gap-2">
          <a
            href={getWhatsAppTournamentUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share Bracket on</span> WhatsApp
          </a>

          <button
            type="button"
            onClick={handleCopyTournamentLink}
            className="px-3 py-1.5 bg-court-850 hover:bg-court-800 border border-court-700 text-[#F5F0E6] text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            {shareCopied ? <CheckCircle2 className="w-3.5 h-3.5 text-gold" /> : <Share2 className="w-3.5 h-3.5 text-gold" />}
            <span>{shareCopied ? "Link Copied!" : "Share Bracket"}</span>
          </button>
        </div>
      </div>

      {/* Banner Card */}
      <div className="bg-court-900 border border-court-700 rounded-3xl overflow-hidden shadow-xl shadow-gold/5">
        <div className="relative h-64 sm:h-80 bg-court-800">
          <img
            src={
              tournament.bannerUrl ||
              "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80"
            }
            alt={tournament.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 px-3.5 py-1.5 bg-court-950/90 backdrop-blur-md border border-gold/40 rounded-full text-xs font-black text-gold uppercase tracking-wider">
            {tournament.sport} Championship
          </div>
          <div className="absolute top-4 right-4 px-4 py-1.5 bg-gradient-to-r from-gold to-amber-400 text-court-950 font-black text-sm rounded-full shadow-lg">
            🏆 {tournament.prizePool}
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    tournament.status === "ongoing"
                      ? "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse"
                      : tournament.status === "registration_open"
                      ? "bg-gold/15 text-gold border border-gold/30"
                      : "bg-court-950 text-[#9B9691] border border-court-700"
                  }`}
                >
                  {tournament.status.replace("_", " ")}
                </span>
                <span className="text-xs text-[#9B9691] capitalize">• {tournament.format} Elimination</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-[#F5F0E6]">{tournament.name}</h1>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3">
              {tournament.status === "registration_open" && (
                <button
                  onClick={() => setRegisterModalOpen(true)}
                  className="px-5 py-2.5 bg-gradient-to-r from-gold via-amber-400 to-gold-hover hover:from-gold-hover hover:to-amber-500 text-court-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-gold/20 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register Team (₹{tournament.entryFee})</span>
                </button>
              )}

              {isOrganizer && matches.length === 0 && (
                <button
                  onClick={handleGenerateBracket}
                  disabled={bracketLoading || registeredTeams.length < 2}
                  className="px-5 py-2.5 bg-court-800 hover:bg-court-750 border border-gold/40 text-gold font-black rounded-xl text-xs flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Layers className="w-4 h-4" />
                  <span>{bracketLoading ? "Generating..." : "Generate Bracket"}</span>
                </button>
              )}
            </div>
          </div>

          <p className="text-xs text-[#9B9691] leading-relaxed max-w-3xl">
            {tournament.description || "Official Tamil Nadu district tournament knockout tournament."}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-court-700 text-xs text-[#9B9691]">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gold" />
              <span>
                {new Date(tournament.startDate).toLocaleDateString()} -{" "}
                {new Date(tournament.endDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gold" />
              <span>{tournament.venueId?.name || `${tournament.city}, Tamil Nadu`}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gold" />
              <span>
                {registeredTeams.length} / {tournament.maxTeams} Squads
              </span>
            </div>
            <div className="flex items-center gap-2 text-[#F5F0E6] font-bold">
              <span>Entry Fee: <strong className="text-gold">₹{tournament.entryFee}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Knockout Bracket View */}
      <div className="bg-court-900 border border-court-700 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 shadow-gold/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-gold" />
            <h2 className="text-lg font-bold text-[#F5F0E6]">Knockout Championship Bracket</h2>
          </div>
          <span className="text-xs text-[#9B9691]">
            {matches.length > 0 ? `${matches.length} Fixtures Scheduled` : "Pending Bracket Generation"}
          </span>
        </div>

        {matches.length === 0 ? (
          <div className="p-8 bg-court-950 border border-court-700 rounded-2xl text-center">
            <Layers className="w-10 h-10 text-gold/40 mx-auto mb-2" />
            <p className="text-xs text-[#9B9691] mb-2">
              Tournament bracket will be rendered here once team registrations conclude and organizer generates bracket.
            </p>
            {isOrganizer && (
              <button
                onClick={handleGenerateBracket}
                className="mt-2 px-4 py-2 bg-gradient-to-r from-gold to-amber-500 text-court-950 font-black rounded-xl text-xs shadow-md shadow-gold/20"
              >
                Generate Bracket Now ({registeredTeams.length} teams registered)
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-8 min-w-[700px] items-start">
              {roundKeys.map((roundKey) => {
                const roundMatches = roundMap[roundKey];
                return (
                  <div key={roundKey} className="flex-1 space-y-4">
                    <div className="p-2.5 bg-court-950 border border-court-700 rounded-xl text-center">
                      <span className="text-xs font-bold text-gold uppercase tracking-wider block">
                        {getRoundLabel(roundKey, roundKeys.length)}
                      </span>
                    </div>

                    <div className="space-y-4 flex flex-col justify-around h-full">
                      {roundMatches.map((match) => (
                        <Link
                          key={match._id}
                          to={`/matches/${match._id}`}
                          className="block bg-court-950 border border-court-700 hover:border-gold/60 rounded-2xl p-3.5 shadow-md transition-all hover:scale-[1.02] group"
                        >
                          <div className="flex items-center justify-between text-[10px] text-[#9B9691] mb-2">
                            <span>{match.title || `Match ${match.matchOrder}`}</span>
                            {match.status === "live" ? (
                              <span className="px-1.5 py-0.2 bg-red-500/20 text-red-400 font-extrabold rounded animate-pulse">
                                LIVE
                              </span>
                            ) : (
                              <span className="capitalize">{match.status}</span>
                            )}
                          </div>

                          {/* Team 1 */}
                          <div
                            className={`flex items-center justify-between py-1.5 px-2 rounded-lg ${
                              match.winnerId?._id?.toString() === match.team1Id?._id?.toString()
                                ? "bg-gold/15 font-bold text-[#F5F0E6] border border-gold/30"
                                : "text-[#9B9691]"
                            }`}
                          >
                            <span className="text-xs truncate max-w-[120px]">
                              {match.team1Id?.name || "TBD"}
                            </span>
                            <span className="font-mono text-xs text-gold font-bold">
                              {match.team1Score || "-"}
                            </span>
                          </div>

                          {/* Team 2 */}
                          <div
                            className={`flex items-center justify-between py-1.5 px-2 rounded-lg mt-1 ${
                              match.winnerId?._id?.toString() === match.team2Id?._id?.toString()
                                ? "bg-gold/15 font-bold text-[#F5F0E6] border border-gold/30"
                                : "text-[#9B9691]"
                            }`}
                          >
                            <span className="text-xs truncate max-w-[120px]">
                              {match.team2Id?.name || "TBD"}
                            </span>
                            <span className="font-mono text-xs text-gold font-bold">
                              {match.team2Score || "-"}
                            </span>
                          </div>

                          {match.liveStatus && (
                            <p className="text-[10px] text-[#9B9691] mt-2 truncate italic">
                              {match.liveStatus}
                            </p>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Registered Teams Grid */}
      <div className="bg-court-900 border border-court-700 rounded-3xl p-6 shadow-xl space-y-4 shadow-gold/5">
        <h2 className="text-base font-bold text-[#F5F0E6] flex items-center gap-2">
          <Shield className="w-5 h-5 text-gold" />
          <span>Registered Squads ({registeredTeams.length})</span>
        </h2>

        {registeredTeams.length === 0 ? (
          <p className="text-xs text-[#9B9691] py-4">
            No teams registered yet. Be the first captain to register your team!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {registeredTeams.map((team) => (
              <Link
                key={team._id}
                to={`/teams/${team._id}`}
                className="p-4 bg-court-950 border border-court-700 hover:border-gold/40 rounded-2xl flex items-center gap-3.5 transition-all group hover:bg-court-900"
              >
                <div className="w-12 h-12 rounded-xl bg-court-800 border border-court-700 flex items-center justify-center font-bold text-gold text-base overflow-hidden shrink-0 group-hover:border-gold/50 transition-colors">
                  {team.logo ? (
                    <img src={team.logo} alt={team.name} className="w-full h-full object-cover" />
                  ) : (
                    team.name?.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-[#F5F0E6] text-xs truncate group-hover:text-gold transition-colors">{team.name}</h4>
                  <p className="text-[10px] text-gold-glow flex items-center gap-1 font-medium mt-0.5 truncate">
                    <span>👑 {team.captainId?.name || "Captain"}</span>
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-[#9B9691] mt-0.5">
                    <span>{team.city}</span>
                    <span>•</span>
                    <span>{team.members?.length || 0} Members</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Register Team Modal */}
      {registerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-court-900 border border-court-700 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-[#F5F0E6] shadow-gold/10">
            <button
              onClick={() => setRegisterModalOpen(false)}
              className="absolute top-5 right-5 text-[#9B9691] hover:text-white p-1 rounded-xl hover:bg-court-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gold/15 border border-gold/30 text-gold flex items-center justify-center">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#F5F0E6]">Register Your Squad</h3>
                <p className="text-xs text-[#9B9691]">Select one of your squads to enter this cup</p>
              </div>
            </div>

            {registerError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold">
                {registerError}
              </div>
            )}

            <form onSubmit={handleRegisterTeam} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-[#9B9691] uppercase mb-1">
                  Select Your Team ({tournament.sport})
                </label>
                <select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  required
                  className="w-full bg-court-950 border border-court-700 rounded-xl px-4 py-2.5 text-xs text-[#F5F0E6] focus:ring-2 focus:ring-gold focus:border-gold focus:outline-none cursor-pointer"
                >
                  <option value="" className="bg-court-900">-- Choose Your Squad --</option>
                  {myTeams.map((t) => (
                    <option key={t._id} value={t._id} className="bg-court-900">
                      {t.name} ({t.city})
                    </option>
                  ))}
                </select>
              </div>

              {myTeams.length === 0 && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-300">
                  You don't have an active team for {tournament.sport} yet.{" "}
                  <Link to="/teams" className="underline font-bold text-gold">
                    Create a team here
                  </Link>{" "}
                  before registering.
                </div>
              )}

              <button
                type="submit"
                disabled={registerLoading || !selectedTeamId}
                className="w-full py-3 bg-gradient-to-r from-gold via-amber-400 to-gold-hover hover:from-gold-hover hover:to-amber-500 text-court-950 font-black rounded-xl shadow-lg shadow-gold/20 transition-all disabled:opacity-50"
              >
                {registerLoading ? "Confirming Registration..." : `Register Squad (₹${tournament.entryFee})`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentDetail;
