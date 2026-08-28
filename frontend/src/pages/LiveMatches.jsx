import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchLiveMatches, fetchTodayMatches, fetchMatches } from "../api";
import SportSelector from "../components/SportSelector";
import {
  Radio,
  PlayCircle,
  Calendar,
  Clock,
  MapPin,
  Trophy,
  Activity,
  ArrowRight,
  Shield,
} from "lucide-react";

const LiveMatches = () => {
  const [liveMatches, setLiveMatches] = useState([]);
  const [todayMatches, setTodayMatches] = useState([]);
  const [allMatches, setAllMatches] = useState([]);
  const [sport, setSport] = useState("All");
  const [loading, setLoading] = useState(true);

  const loadMatches = async () => {
    try {
      setLoading(true);
      const [liveRes, todayRes, allRes] = await Promise.allSettled([
        fetchLiveMatches(),
        fetchTodayMatches(),
        fetchMatches({ sport: sport === "All" ? undefined : sport }),
      ]);

      if (liveRes.status === "fulfilled" && liveRes.value.data.success) {
        setLiveMatches(liveRes.value.data.matches || []);
      }
      if (todayRes.status === "fulfilled" && todayRes.value.data.success) {
        setTodayMatches(todayRes.value.data.matches || []);
      }
      if (allRes.status === "fulfilled" && allRes.value.data.success) {
        setAllMatches(allRes.value.data.matches || []);
      }
    } catch (err) {
      console.error("Error fetching matches:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
    const interval = setInterval(loadMatches, 15000);
    return () => clearInterval(interval);
  }, [sport]);

  const filteredLive = liveMatches.filter((m) => sport === "All" || m.sport === sport);
  const filteredToday = todayMatches.filter((m) => sport === "All" || m.sport === sport);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in text-[#F5F0E6]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-red-500/20 text-red-400">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#F5F0E6]">Live Scores & Arena Broadcast</h1>
          </div>
          <p className="text-xs text-[#9B9691] mt-1">
            Real-time ball-by-ball updates, live YouTube broadcasts, and match scoreboards
          </p>
        </div>

        <div className="w-48">
          <SportSelector
            value={sport}
            onChange={(e) => setSport(e.target.value)}
            includeAll={true}
            allLabel="All Sports"
          />
        </div>
      </div>

      {/* Currently Live Matches Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
          <h2 className="text-base font-bold text-[#F5F0E6] uppercase tracking-wider">
            Live Matches ({filteredLive.length})
          </h2>
        </div>

        {loading && filteredLive.length === 0 ? (
          <div className="h-44 bg-court-900 border border-court-700 rounded-3xl animate-pulse"></div>
        ) : filteredLive.length === 0 ? (
          <div className="bg-court-900 border border-court-700 rounded-3xl p-8 text-center max-w-md mx-auto shadow-xl">
            <Radio className="w-10 h-10 text-gold/40 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-[#F5F0E6]">No Matches Currently Live</h3>
            <p className="text-xs text-[#9B9691] mt-1">
              Check out scheduled fixtures below or browse upcoming tournaments.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredLive.map((match) => (
              <Link
                key={match._id}
                to={`/matches/${match._id}`}
                className="bg-gradient-to-br from-court-900 via-court-850 to-court-950 border-2 border-red-500/40 hover:border-red-500 rounded-3xl p-6 shadow-2xl transition-all duration-200 hover:-translate-y-1 block relative overflow-hidden group"
              >
                {/* Header */}
                <div className="flex items-center justify-between text-xs mb-4">
                  <span className="px-2.5 py-0.5 bg-red-500 text-white font-extrabold text-[10px] rounded-full flex items-center gap-1.5 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                    LIVE
                  </span>
                  <span className="text-[#9B9691] font-semibold">{match.sport}</span>
                  {match.videoId && (
                    <span className="px-2 py-0.5 bg-red-600/20 text-red-400 text-[10px] font-bold rounded-md flex items-center gap-1">
                      <PlayCircle className="w-3 h-3" /> Stream Available
                    </span>
                  )}
                </div>

                {/* Scoreboard */}
                <div className="space-y-3 py-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-court-800 border border-court-700 flex items-center justify-center font-bold text-gold text-xs">
                        {match.team1Id?.name?.charAt(0)}
                      </div>
                      <span className="font-bold text-[#F5F0E6] text-base truncate max-w-[160px]">
                        {match.team1Id?.name}
                      </span>
                    </div>
                    <span className="font-mono text-xl font-black text-gold tracking-wider">
                      {match.team1Score}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-court-800 border border-court-700 flex items-center justify-center font-bold text-gold text-xs">
                        {match.team2Id?.name?.charAt(0)}
                      </div>
                      <span className="font-bold text-[#F5F0E6] text-base truncate max-w-[160px]">
                        {match.team2Id?.name}
                      </span>
                    </div>
                    <span className="font-mono text-xl font-black text-gold tracking-wider">
                      {match.team2Score}
                    </span>
                  </div>
                </div>

                {/* Live Status Description */}
                <div className="mt-4 pt-3 border-t border-court-700 flex items-center justify-between text-xs">
                  <span className="text-red-300 font-medium italic truncate max-w-[240px]">
                    {match.liveStatus}
                  </span>
                  <span className="font-bold text-[#F5F0E6] flex items-center gap-1 group-hover:text-gold transition-colors">
                    <span>Open Scoreboard</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-gold" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Scheduled & Today Matches */}
      <div className="space-y-4 pt-4">
        <h2 className="text-base font-bold text-[#F5F0E6] uppercase tracking-wider flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gold" />
          <span>Scheduled Fixtures & Today's Schedule</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {allMatches
            .filter((m) => m.status !== "live")
            .map((match) => (
              <Link
                key={match._id}
                to={`/matches/${match._id}`}
                className="bg-court-900 border border-court-700 hover:border-gold/40 rounded-3xl p-5 shadow-lg transition-all hover:-translate-y-0.5 block hover:shadow-gold/5"
              >
                <div className="flex items-center justify-between text-[11px] text-[#9B9691] mb-3">
                  <span className="font-bold text-gold">{match.sport}</span>
                  <span className="capitalize px-2 py-0.5 bg-court-950 rounded-full border border-court-700 text-[10px]">
                    {match.status}
                  </span>
                </div>

                <div className="space-y-2 py-1">
                  <div className="flex justify-between items-center text-xs font-bold text-[#F5F0E6]">
                    <span className="truncate">{match.team1Id?.name || "Team 1"}</span>
                    <span className="font-mono text-gold font-bold">{match.team1Score || "-"}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold text-[#F5F0E6]">
                    <span className="truncate">{match.team2Id?.name || "Team 2"}</span>
                    <span className="font-mono text-gold font-bold">{match.team2Score || "-"}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-court-700 flex items-center justify-between text-[11px] text-[#9B9691]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gold" />
                    {new Date(match.scheduledTime).toLocaleDateString()}{" "}
                    {new Date(match.scheduledTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="font-bold text-gold hover:underline">Details →</span>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
};

export default LiveMatches;
