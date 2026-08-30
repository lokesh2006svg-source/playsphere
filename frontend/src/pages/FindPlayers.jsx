import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { io } from "socket.io-client";
import { fetchNearbyPlayers } from "../api";
import { useAuth } from "../context/AuthContext";
import SportSelector from "../components/SportSelector";
import DistrictSelector from "../components/DistrictSelector";
import {
  Users,
  MapPin,
  Navigation,
  Star,
  Award,
  Filter,
  Shield,
  ExternalLink,
  MessageSquare,
  Sparkles,
  SlidersHorizontal,
  Search,
} from "lucide-react";

const FindPlayers = () => {
  const { user } = useAuth();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const [usedCityFallback, setUsedCityFallback] = useState(false);

  // Filters
  const [sport, setSport] = useState("All");
  const [skillLevel, setSkillLevel] = useState("All");
  const [maxDistanceKm, setMaxDistanceKm] = useState(25);
  const [city, setCity] = useState(user?.city || "All");
  const [search, setSearch] = useState("");

  const searchPlayers = async (customCoords = coords) => {
    try {
      setLoading(true);
      const params = {
        maxDistanceKm,
        sport,
        skillLevel,
        city: city === "All" ? undefined : city,
        search: search.trim() ? search.trim() : undefined,
      };

      if (customCoords) {
        params.lat = customCoords.lat;
        params.lng = customCoords.lng;
      }

      const res = await fetchNearbyPlayers(params);
      if (res.data.success) {
        setPlayers(res.data.players || []);
        setUsedCityFallback(res.data.usedCityFallback || false);
      }
    } catch (err) {
      console.error("Search players error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      searchPlayers();
    }, 200);
    return () => clearTimeout(timer);
  }, [sport, skillLevel, maxDistanceKm, city, search]);

  // Real-time listener: Auto-refresh directory when any player registers or updates profile anywhere
  useEffect(() => {
    let socket;
    try {
      const socketUrl = import.meta.env.VITE_API_BASE_URL
        ? import.meta.env.VITE_API_BASE_URL.replace("/api", "")
        : (import.meta.env.PROD ? "https://playsphere-zo9o.onrender.com" : window.location.origin);
      socket = io(socketUrl);

      socket.on("newPlayerJoined", () => {
        searchPlayers();
      });

      socket.on("playerUpdated", () => {
        searchPlayers();
      });
    } catch (err) {
      console.warn("Real-time socket sync error:", err);
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, [sport, skillLevel, maxDistanceKm, city, search]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCoords(newCoords);
        setLocating(false);
        searchPlayers(newCoords);
      },
      (error) => {
        console.warn("Geolocation denied or error:", error.message);
        setLocating(false);
        alert("Could not retrieve precise location. Falling back to selected city search.");
      },
      { timeout: 10000 }
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in text-[#F5F0E6]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-gold" />
            <h1 className="text-2xl sm:text-3xl font-black text-[#F5F0E6]">Find Nearby Players</h1>
          </div>
          <p className="text-xs text-[#9B9691] mt-1">
            Connect with active players within your proximity or across Tamil Nadu sports hubs
          </p>
        </div>

        <button
          onClick={handleGetLocation}
          disabled={locating}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-gold via-amber-400 to-gold-hover hover:from-gold-hover hover:to-amber-500 text-court-950 font-black rounded-xl text-xs shadow-lg shadow-gold/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
        >
          <Navigation className={`w-4 h-4 ${locating ? "animate-spin" : ""}`} />
          <span>{locating ? "Detecting GPS..." : "Use Current Location"}</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-court-900 border border-court-700 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 shadow-gold/5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#F5F0E6] uppercase tracking-wider">
            <SlidersHorizontal className="w-4 h-4 text-gold" />
            <span>Search & Radius Filters</span>
          </div>

          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-gold absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by player name, sport, ID..."
              className="w-full bg-court-950 border border-court-700 text-[#F5F0E6] rounded-xl pl-10 pr-4 py-2 text-xs focus:ring-2 focus:ring-gold focus:border-gold focus:outline-none placeholder:text-[#656C7D]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Sport Selector */}
          <div>
            <label className="block text-[11px] font-bold text-[#9B9691] uppercase mb-1">
              Sport
            </label>
            <SportSelector
              value={sport}
              onChange={(e) => setSport(e.target.value)}
              includeAll={true}
              allLabel="All Sports"
            />
          </div>

          {/* Skill Level */}
          <div>
            <label className="block text-[11px] font-bold text-[#9B9691] uppercase mb-1">
              Skill Level
            </label>
            <select
              value={skillLevel}
              onChange={(e) => setSkillLevel(e.target.value)}
              className="w-full bg-court-950 border border-court-700 text-[#F5F0E6] rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-gold focus:border-gold focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-court-900">All Skill Levels</option>
              <option value="beginner" className="bg-court-900">Beginner</option>
              <option value="intermediate" className="bg-court-900">Intermediate</option>
              <option value="advanced" className="bg-court-900">Advanced</option>
              <option value="pro" className="bg-court-900">Pro / State Level</option>
            </select>
          </div>

          {/* City / District */}
          <div>
            <label className="block text-[11px] font-bold text-[#9B9691] uppercase mb-1">
              District (Tamil Nadu)
            </label>
            <DistrictSelector
              value={city}
              onChange={(e) => setCity(e.target.value)}
              includeAll={true}
              allLabel="All 38 Districts"
              placeholder="All Districts"
            />
          </div>

          {/* Distance Radius Slider */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-[#9B9691] uppercase">
                Max Distance: <span className="text-gold font-black">{maxDistanceKm} km</span>
              </label>
            </div>
            <input
              type="range"
              min={2}
              max={50}
              step={1}
              value={maxDistanceKm}
              onChange={(e) => setMaxDistanceKm(Number(e.target.value))}
              className="w-full accent-gold cursor-pointer mt-2"
            />
          </div>
        </div>

        {usedCityFallback && (
          <div className="p-3 bg-court-950 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-center gap-2">
            <MapPin className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              Showing players based on <strong>{city}</strong> area match. Enable GPS for precise kilometer proximity.
            </span>
          </div>
        )}
      </div>

      {/* Players Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-[#F5F0E6]">
            Available Athletes ({players.length})
          </h2>
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
        ) : players.length === 0 ? (
          <div className="bg-court-900 border border-court-700 rounded-3xl p-12 text-center max-w-md mx-auto shadow-xl">
            <div className="w-16 h-16 rounded-3xl bg-court-800 border border-court-700 flex items-center justify-center text-[#9B9691] mx-auto mb-4">
              <Users className="w-8 h-8 text-gold" />
            </div>
            <h3 className="text-lg font-bold text-[#F5F0E6] mb-1">No Nearby Players Found</h3>
            <p className="text-xs text-[#9B9691] mb-6">
              Try expanding your distance radius slider or selecting another sport/city filter.
            </p>
            <button
              onClick={() => {
                setSport("All");
                setSkillLevel("All");
                setMaxDistanceKm(50);
              }}
              className="px-5 py-2.5 bg-court-800 hover:bg-court-750 text-[#F5F0E6] border border-court-700 font-bold rounded-xl text-xs transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {players.map((player) => (
              <div
                key={player._id}
                className="bg-court-900 border border-court-700 hover:border-gold/50 rounded-3xl p-6 shadow-lg hover:shadow-2xl hover:shadow-gold/10 transition-all duration-200 flex flex-col justify-between hover:-translate-y-1 relative overflow-hidden group"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-court-800 border border-gold/40 overflow-hidden flex items-center justify-center text-xl font-bold text-gold shrink-0 shadow-inner">
                        {player.profilePhoto ? (
                          <img
                            src={player.profilePhoto}
                            alt={player.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          player.name?.charAt(0).toUpperCase()
                        )}
                      </div>

                      <div>
                        <h3 className="font-bold text-[#F5F0E6] text-base group-hover:text-gold transition-colors truncate max-w-[150px]">
                          {player.name}
                        </h3>
                        <p className="text-[10px] text-gold font-mono font-bold">
                          {player.playerIdNumber || "PS-MEMBER"}
                        </p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 bg-court-950 border border-amber-500/30 rounded-full text-[10px] font-bold text-amber-300 capitalize">
                      {player.skillLevel}
                    </span>
                  </div>

                  {/* Sport & Distance */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#F5F0E6] flex items-center gap-1.5">
                        <span className="text-gold">⚡</span> {player.sport}
                      </span>
                      <span className="font-bold text-gold flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gold" />
                        {player.distanceKm !== null
                          ? `${player.distanceKm} km away`
                          : `${player.city}`}
                      </span>
                    </div>

                    {player.bio && (
                      <p className="text-xs text-[#9B9691] line-clamp-2 leading-relaxed">
                        {player.bio}
                      </p>
                    )}
                  </div>

                  {/* Badges */}
                  {player.badges && player.badges.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {player.badges.slice(0, 2).map((b, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-court-950 border border-court-700 rounded text-[10px] text-[#F5F0E6] flex items-center gap-1"
                        >
                          <Award className="w-2.5 h-2.5 text-gold" />
                          {b}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-4 border-t border-court-700 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-xs text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span className="font-bold">
                      {player.rating > 0 ? player.rating.toFixed(1) : "5.0"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/profile/public/${player.userId}`}
                      className="p-2 bg-court-800 hover:bg-court-750 border border-court-700 hover:border-gold/40 text-[#F5F0E6] rounded-xl text-xs transition-colors"
                      title="View Public Profile"
                    >
                      <ExternalLink className="w-4 h-4 text-gold" />
                    </Link>

                    <Link
                      to="/teams"
                      className="px-3.5 py-1.5 bg-gradient-to-r from-gold via-amber-400 to-gold-hover hover:from-gold-hover hover:to-amber-500 text-court-950 font-black rounded-xl text-xs transition-all shadow-md shadow-gold/20"
                    >
                      Invite to Squad
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FindPlayers;
