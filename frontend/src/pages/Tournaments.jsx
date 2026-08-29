import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchTournaments, createNewTournament } from "../api";
import { useAuth } from "../context/AuthContext";
import SportSelector from "../components/SportSelector";
import DistrictSelector from "../components/DistrictSelector";
import {
  Trophy,
  Calendar,
  MapPin,
  Users,
  Award,
  Plus,
  ArrowRight,
  Shield,
  X,
  Sparkles,
} from "lucide-react";

const Tournaments = () => {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [sport, setSport] = useState("All");
  const [city, setCity] = useState("All");
  const [status, setStatus] = useState("All");

  // Create Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [createData, setCreateData] = useState({
    name: "",
    sport: "Cricket",
    city: user?.city || "Chennai",
    format: "knockout",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    maxTeams: 8,
    prizePool: "₹25,000 + Trophy",
    entryFee: 1000,
    description: "",
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");

  const loadTournaments = async () => {
    try {
      setLoading(true);
      const res = await fetchTournaments({ sport, city, status });
      if (res.data.success) {
        setTournaments(res.data.tournaments || []);
      }
    } catch (err) {
      console.error("Error loading tournaments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTournaments();
  }, [sport, city, status]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setCreateLoading(true);
      setCreateError("");
      const res = await createNewTournament(createData);
      if (res.data.success) {
        setModalOpen(false);
        loadTournaments();
      }
    } catch (err) {
      setCreateError(err.response?.data?.message || "Failed to create tournament.");
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
            <Trophy className="w-6 h-6 text-gold" />
            <h1 className="text-2xl sm:text-3xl font-black text-[#F5F0E6]">Tournaments & Championships</h1>
          </div>
          <p className="text-xs text-[#9B9691] mt-1">
            Register your squads for Tamil Nadu state & district knockout leagues
          </p>
        </div>

        {user && (
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-gold via-amber-400 to-gold-hover hover:from-gold-hover hover:to-amber-500 text-court-950 font-black rounded-xl text-xs shadow-lg shadow-gold/20 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Host Tournament</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-court-900 border border-court-700 rounded-3xl p-5 sm:p-6 shadow-xl grid grid-cols-1 sm:grid-cols-3 gap-4 shadow-gold/5">
        <div>
          <label className="block text-[11px] font-bold text-[#9B9691] uppercase mb-1">
            Sport Type
          </label>
          <SportSelector
            value={sport}
            onChange={(e) => setSport(e.target.value)}
            includeAll={true}
            allLabel="All Sports"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[#9B9691] uppercase mb-1">
            District / Location
          </label>
          <DistrictSelector
            value={city}
            onChange={(e) => setCity(e.target.value)}
            includeAll={true}
            allLabel="All 38 Districts"
            placeholder="All Districts"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[#9B9691] uppercase mb-1">
            Tournament Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-court-950 border border-court-700 text-[#F5F0E6] rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-gold focus:border-gold focus:outline-none cursor-pointer"
          >
            <option value="All" className="bg-court-900">All Statuses</option>
            <option value="registration_open" className="bg-court-900">Registration Open</option>
            <option value="ongoing" className="bg-court-900">Ongoing Matches</option>
            <option value="completed" className="bg-court-900">Completed</option>
          </select>
        </div>
      </div>

      {/* Tournaments Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-[#F5F0E6]">Championships ({tournaments.length})</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-80 bg-court-900 border border-court-700 rounded-3xl animate-pulse"
              ></div>
            ))}
          </div>
        ) : tournaments.length === 0 ? (
          <div className="bg-court-900 border border-court-700 rounded-3xl p-12 text-center max-w-md mx-auto shadow-xl">
            <Trophy className="w-12 h-12 text-gold mx-auto mb-3" />
            <h3 className="text-lg font-bold text-[#F5F0E6] mb-1">No Tournaments Found</h3>
            <p className="text-xs text-[#9B9691] mb-6">
              There are currently no tournaments matching your selected filters.
            </p>
            {user && (
              <button
                onClick={() => setModalOpen(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-gold to-amber-500 text-court-950 font-black rounded-xl text-xs shadow-md shadow-gold/20"
              >
                Host a Tournament
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((t) => (
              <div
                key={t._id}
                className="bg-court-900 border border-court-700 hover:border-gold/50 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-gold/10 transition-all duration-200 flex flex-col justify-between hover:-translate-y-1 group"
              >
                <div className="h-44 relative bg-court-800 overflow-hidden">
                  <img
                    src={
                      t.bannerUrl ||
                      "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80"
                    }
                    alt={t.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 bg-court-950/90 backdrop-blur-md border border-gold/40 rounded-full text-[10px] font-bold text-[#F5F0E6] uppercase tracking-wider">
                    {t.sport}
                  </div>
                  <div className="absolute top-3 right-3 px-2.5 py-1 bg-gradient-to-r from-gold to-amber-400 text-court-950 font-black text-[10px] rounded-full shadow-md">
                    🏆 {t.prizePool}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          t.status === "ongoing"
                            ? "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse"
                            : t.status === "registration_open"
                            ? "bg-gold/15 text-gold border border-gold/30"
                            : "bg-court-950 text-[#9B9691] border border-court-700"
                        }`}
                      >
                        {t.status.replace("_", " ")}
                      </span>
                      <span className="text-[10px] text-[#9B9691] capitalize">
                        • {t.format} format
                      </span>
                    </div>

                    <h3 className="font-bold text-[#F5F0E6] text-base group-hover:text-gold transition-colors line-clamp-1 mb-2">
                      {t.name}
                    </h3>

                    <p className="text-xs text-[#9B9691] line-clamp-2 leading-relaxed mb-4">
                      {t.description || "Official state championship knockout tournament."}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs text-[#9B9691] mb-4 pt-3 border-t border-court-700">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gold" />
                        <span>{new Date(t.startDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gold" />
                        <span>{t.city}</span>
                      </div>
                      <div className="flex items-center gap-1.5 col-span-2 text-[#9B9691]">
                        <Users className="w-3.5 h-3.5 text-gold" />
                        <span>
                          {t.registeredTeamsCount || 0} / {t.maxTeams} Teams Registered
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-court-700 flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F5F0E6]">
                      Entry: <strong className="text-gold font-black">₹{t.entryFee}</strong>
                    </span>

                    <Link
                      to={`/tournaments/${t._id}`}
                      className="px-4 py-2 bg-gradient-to-r from-gold via-amber-400 to-gold-hover hover:from-gold-hover hover:to-amber-500 text-court-950 font-black rounded-xl text-xs transition-all shadow-md shadow-gold/20 flex items-center gap-1"
                    >
                      <span>Bracket & Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Host Tournament Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-court-900 border border-court-700 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative text-[#F5F0E6] max-h-[90vh] overflow-y-auto shadow-gold/10">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-[#9B9691] hover:text-white p-1 rounded-xl hover:bg-court-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gold/15 border border-gold/30 text-gold flex items-center justify-center">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#F5F0E6]">Host New Tournament</h3>
                <p className="text-xs text-[#9B9691]">Organize a state or district knockout cup</p>
              </div>
            </div>

            {createError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-[#9B9691] uppercase mb-1">
                  Tournament Title
                </label>
                <input
                  type="text"
                  required
                  value={createData.name}
                  onChange={(e) => setCreateData({ ...createData, name: e.target.value })}
                  placeholder="e.g. Tamil Nadu State Super Cup 2026"
                  className="w-full bg-court-950 border border-court-700 rounded-xl px-4 py-2 text-xs text-[#F5F0E6] focus:ring-2 focus:ring-gold focus:border-gold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                    City
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
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#9B9691] uppercase mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={createData.startDate}
                    onChange={(e) => setCreateData({ ...createData, startDate: e.target.value })}
                    className="w-full bg-court-950 border border-court-700 rounded-xl px-4 py-2 text-xs text-[#F5F0E6] focus:ring-2 focus:ring-gold focus:border-gold focus:outline-none cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#9B9691] uppercase mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={createData.endDate}
                    onChange={(e) => setCreateData({ ...createData, endDate: e.target.value })}
                    className="w-full bg-court-950 border border-court-700 rounded-xl px-4 py-2 text-xs text-[#F5F0E6] focus:ring-2 focus:ring-gold focus:border-gold focus:outline-none cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#9B9691] uppercase mb-1">
                    Prize Pool
                  </label>
                  <input
                    type="text"
                    required
                    value={createData.prizePool}
                    onChange={(e) => setCreateData({ ...createData, prizePool: e.target.value })}
                    placeholder="₹50,000 + Trophy"
                    className="w-full bg-court-950 border border-court-700 rounded-xl px-4 py-2 text-xs text-[#F5F0E6] focus:ring-2 focus:ring-gold focus:border-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#9B9691] uppercase mb-1">
                    Entry Fee (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={createData.entryFee}
                    onChange={(e) => setCreateData({ ...createData, entryFee: Number(e.target.value) })}
                    className="w-full bg-court-950 border border-court-700 rounded-xl px-4 py-2 text-xs text-[#F5F0E6] focus:ring-2 focus:ring-gold focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#9B9691] uppercase mb-1">
                  Description / Rules
                </label>
                <textarea
                  rows={2}
                  value={createData.description}
                  onChange={(e) => setCreateData({ ...createData, description: e.target.value })}
                  placeholder="Official tournament guidelines, reporting times, kit requirements..."
                  className="w-full bg-court-950 border border-court-700 rounded-xl p-3 text-xs text-[#F5F0E6] focus:ring-2 focus:ring-gold focus:border-gold focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={createLoading}
                className="w-full py-3 bg-gradient-to-r from-gold via-amber-400 to-gold-hover hover:from-gold-hover hover:to-amber-500 text-court-950 font-black rounded-xl shadow-lg shadow-gold/20 transition-all disabled:opacity-50"
              >
                {createLoading ? "Creating Tournament..." : "Publish Tournament Cup"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tournaments;
