import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchTeams, createNewTeam } from "../api";
import { useAuth } from "../context/AuthContext";
import SportSelector from "../components/SportSelector";
import {
  Shield,
  Users,
  Plus,
  Trophy,
  MapPin,
  Sparkles,
  X,
  CheckCircle,
  ExternalLink,
} from "lucide-react";

const Teams = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myTeamsOnly, setMyTeamsOnly] = useState(false);
  const [sport, setSport] = useState("All");
  const [city, setCity] = useState("All");

  // Create Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [createData, setCreateData] = useState({
    name: "",
    sport: "Cricket",
    city: user?.city || "Chennai",
    bio: "",
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");

  const loadTeams = async () => {
    try {
      setLoading(true);
      const res = await fetchTeams({
        sport,
        city,
        myTeams: myTeamsOnly ? "true" : "false",
      });
      if (res.data.success) {
        setTeams(res.data.teams || []);
      }
    } catch (err) {
      console.error("Error loading teams:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, [sport, city, myTeamsOnly]);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!createData.name.trim()) {
      setCreateError("Team name is required.");
      return;
    }

    try {
      setCreateLoading(true);
      setCreateError("");
      const res = await createNewTeam(createData);
      if (res.data.success) {
        setModalOpen(false);
        setCreateData({ name: "", sport: "Cricket", city: user?.city || "Chennai", bio: "" });
        loadTeams();
      }
    } catch (err) {
      setCreateError(err.response?.data?.message || "Failed to create team.");
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in text-[#F5F0E6]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-gold" />
            <h1 className="text-2xl sm:text-3xl font-black text-[#F5F0E6]">Sports Teams & Squads</h1>
          </div>
          <p className="text-xs text-[#9B9691] mt-1">
            Build your team roster, recruit players, and participate in Tamil Nadu leagues
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/invites"
            className="px-4 py-2.5 bg-court-850 hover:bg-court-800 border border-court-700 hover:border-gold/40 text-[#F5F0E6] font-bold rounded-xl text-xs transition-colors"
          >
            My Squad Invites
          </Link>
          {(user?.role === "coach" || user?.role === "admin" || user?.role === "super_admin") && (
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-gold via-amber-400 to-gold-hover hover:from-gold-hover hover:to-amber-500 text-court-950 font-black rounded-xl text-xs shadow-lg shadow-gold/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Squad</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-court-900 border border-court-700 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-wrap items-center justify-between gap-4 shadow-gold/5">
        <div className="flex flex-wrap items-center gap-4 flex-1">
          <div className="w-48">
            <SportSelector
              value={sport}
              onChange={(e) => setSport(e.target.value)}
              includeAll={true}
              allLabel="All Sports"
            />
          </div>

          <div className="w-40">
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-court-950 border border-court-700 text-[#F5F0E6] rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-gold focus:border-gold focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-court-900">All Cities</option>
              <option value="Chennai" className="bg-court-900">Chennai</option>
              <option value="Coimbatore" className="bg-court-900">Coimbatore</option>
              <option value="Madurai" className="bg-court-900">Madurai</option>
              <option value="Trichy" className="bg-court-900">Trichy</option>
              <option value="Salem" className="bg-court-900">Salem</option>
            </select>
          </div>
        </div>

        {user && (
          <button
            onClick={() => setMyTeamsOnly(!myTeamsOnly)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              myTeamsOnly
                ? "bg-gold text-court-950 shadow-md shadow-gold/20 font-black"
                : "bg-court-950 text-[#9B9691] border border-court-700 hover:bg-court-800 hover:text-white"
            }`}
          >
            {myTeamsOnly ? "Showing My Squads" : "Filter My Squads"}
          </button>
        )}
      </div>

      {/* Teams Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-[#F5F0E6]">Active Teams ({teams.length})</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-64 bg-court-900 border border-court-700 rounded-3xl animate-pulse"
              ></div>
            ))}
          </div>
        ) : teams.length === 0 ? (
          <div className="bg-court-900 border border-court-700 rounded-3xl p-12 text-center max-w-md mx-auto shadow-xl">
            <Shield className="w-12 h-12 text-gold mx-auto mb-3" />
            <h3 className="text-lg font-bold text-[#F5F0E6] mb-1">No Teams Found</h3>
            <p className="text-xs text-[#9B9691] mb-6">
              Be the first to create a team for this sport in your area!
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-gold to-amber-500 text-court-950 font-black rounded-xl text-xs shadow-md shadow-gold/20"
            >
              Create Team Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <div
                key={team._id}
                className="bg-court-900 border border-court-700 hover:border-gold/50 rounded-3xl p-6 shadow-lg hover:shadow-2xl hover:shadow-gold/10 transition-all duration-200 flex flex-col justify-between hover:-translate-y-1 group"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-court-800 border border-gold/40 overflow-hidden flex items-center justify-center text-xl font-bold text-gold shrink-0 shadow-inner">
                        {team.logo ? (
                          <img
                            src={team.logo}
                            alt={team.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          team.name.charAt(0).toUpperCase()
                        )}
                      </div>

                      <div>
                        <h3 className="font-bold text-[#F5F0E6] text-base group-hover:text-gold transition-colors line-clamp-1">
                          {team.name}
                        </h3>
                        <p className="text-xs text-[#9B9691] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-gold" />
                          {team.city}
                        </p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 bg-gold/15 border border-gold/30 text-gold-glow rounded-full text-[10px] font-bold">
                      {team.sport}
                    </span>
                  </div>

                  {team.bio && (
                    <p className="text-xs text-[#9B9691] line-clamp-2 leading-relaxed mb-4">
                      {team.bio}
                    </p>
                  )}

                  {/* Team Stats */}
                  <div className="grid grid-cols-3 gap-2 p-3 bg-court-950 border border-court-700 rounded-2xl text-center text-xs mb-4">
                    <div>
                      <span className="font-bold text-[#F5F0E6] block">
                        {team.members?.length || 1}
                      </span>
                      <span className="text-[10px] text-[#9B9691] uppercase">Members</span>
                    </div>
                    <div>
                      <span className="font-bold text-gold block">
                        {team.stats?.matchesWon || 0}
                      </span>
                      <span className="text-[10px] text-[#9B9691] uppercase">Wins</span>
                    </div>
                    <div>
                      <span className="font-bold text-amber-400 block">
                        {team.stats?.tournamentsWon || 0}
                      </span>
                      <span className="text-[10px] text-[#9B9691] uppercase">Trophies</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-court-700 flex items-center justify-between">
                  <span className="text-[11px] text-[#9B9691]">
                    Captain: <strong className="text-[#F5F0E6]">{team.captainId?.name || "Player"}</strong>
                  </span>

                  <Link
                    to={`/teams/${team._id}`}
                    className="px-4 py-2 bg-court-800 hover:bg-gold hover:text-court-950 text-[#F5F0E6] font-bold rounded-xl text-xs transition-colors border border-court-700"
                  >
                    View Squad
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Team Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-court-900 border border-court-700 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-[#F5F0E6] shadow-gold/10">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-[#9B9691] hover:text-[#F5F0E6] p-1 rounded-xl hover:bg-court-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gold/15 border border-gold/30 text-gold flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#F5F0E6]">Create New Sports Team</h3>
                <p className="text-xs text-[#9B9691]">You will be designated as Team Captain</p>
              </div>
            </div>

            {createError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateTeam} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-[#9B9691] uppercase mb-1">
                  Team / Squad Name
                </label>
                <input
                  type="text"
                  required
                  value={createData.name}
                  onChange={(e) => setCreateData({ ...createData, name: e.target.value })}
                  placeholder="e.g. Chennai Super Smashers"
                  className="w-full bg-court-950 border border-court-700 rounded-xl px-4 py-2.5 text-xs text-[#F5F0E6] focus:ring-2 focus:ring-gold focus:border-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#9B9691] uppercase mb-1">
                  Sport
                </label>
                <SportSelector
                  value={createData.sport}
                  onChange={(e) => setCreateData({ ...createData, sport: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#9B9691] uppercase mb-1">
                  City / Base Region
                </label>
                <select
                  value={createData.city}
                  onChange={(e) => setCreateData({ ...createData, city: e.target.value })}
                  className="w-full bg-court-950 border border-court-700 rounded-xl px-4 py-2.5 text-xs text-[#F5F0E6] focus:ring-2 focus:ring-gold focus:border-gold focus:outline-none cursor-pointer"
                >
                  <option value="Chennai" className="bg-court-900">Chennai</option>
                  <option value="Coimbatore" className="bg-court-900">Coimbatore</option>
                  <option value="Madurai" className="bg-court-900">Madurai</option>
                  <option value="Trichy" className="bg-court-900">Trichy</option>
                  <option value="Salem" className="bg-court-900">Salem</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#9B9691] uppercase mb-1">
                  Bio / Team Description
                </label>
                <textarea
                  rows={2}
                  value={createData.bio}
                  onChange={(e) => setCreateData({ ...createData, bio: e.target.value })}
                  placeholder="e.g. Competitive weekend cricket squad training for upcoming T20 district trophy..."
                  className="w-full bg-court-950 border border-court-700 rounded-xl p-3 text-xs text-[#F5F0E6] focus:ring-2 focus:ring-gold focus:border-gold focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={createLoading}
                className="w-full py-3 bg-gradient-to-r from-gold via-amber-400 to-gold-hover hover:from-gold-hover hover:to-amber-500 text-court-950 font-black rounded-xl shadow-lg shadow-gold/20 transition-all disabled:opacity-50"
              >
                {createLoading ? "Creating Squad..." : "Create Team & Open Roster"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teams;
