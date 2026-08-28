import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import io from "socket.io-client";
import { fetchMatchById, updateMatchScore, updateMatchStreamLink } from "../api";
import { useAuth } from "../context/AuthContext";
import {
  Radio,
  Play,
  PlayCircle,
  Trophy,
  Calendar,
  Clock,
  MapPin,
  Shield,
  ArrowLeft,
  Video,
  Send,
  Plus,
  Minus,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Lock,
} from "lucide-react";

let socket;

const MatchLive = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [streamUrlInput, setStreamUrlInput] = useState("");
  const [streamSaving, setStreamSaving] = useState(false);
  const [streamError, setStreamError] = useState("");
  const [commentaryInput, setCommentaryInput] = useState("");
  const [scoreLoading, setScoreLoading] = useState(false);

  // Load match data
  const loadMatch = async () => {
    try {
      setLoading(true);
      const res = await fetchMatchById(id);
      if (res.data.success) {
        setMatch(res.data.match);
        setStreamUrlInput(res.data.match.liveStreamUrl || "");
      }
    } catch (err) {
      console.error("Error loading match:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatch();

    // Initialize Socket.io connection
    const socketUrl = import.meta.env.VITE_API_BASE_URL
      ? import.meta.env.VITE_API_BASE_URL.replace("/api", "")
      : window.location.origin;

    socket = io(socketUrl);

    socket.emit("join_match", id);

    // Listen for real-time score updates
    socket.on("scoreUpdate", (data) => {
      if (data.matchId === id) {
        setMatch((prev) => ({
          ...prev,
          team1Score: data.team1Score,
          team2Score: data.team2Score,
          liveStatus: data.liveStatus,
          status: data.status,
          scoreDetail: data.scoreDetail,
          winnerId: data.winnerId,
        }));
      }
    });

    return () => {
      if (socket) {
        socket.emit("leave_match", id);
        socket.disconnect();
      }
    };
  }, [id]);

  // Determine if user has official scorer authorization
  const isAssignedScorer = user && match && match.scorerId?._id?.toString() === user._id?.toString();
  const isTournamentOrganizer =
    user && match && match.tournamentId?.organizerId?.toString() === user._id?.toString();
  const isAdmin = user && (user.role === "admin" || user.role === "super_admin" || user.role === "venue_admin");
  const canScore = isAssignedScorer || isTournamentOrganizer || isAdmin;

  // Handle Score Updates
  const handleScoreUpdate = async (updates) => {
    try {
      setScoreLoading(true);
      const res = await updateMatchScore(id, updates);
      if (res.data.success) {
        setMatch(res.data.match);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update match score.");
    } finally {
      setScoreLoading(false);
    }
  };

  const handleSendCommentary = (e) => {
    e.preventDefault();
    if (!commentaryInput.trim()) return;
    handleScoreUpdate({ commentary: commentaryInput.trim() });
    setCommentaryInput("");
  };

  const handleSaveStream = async (e) => {
    e.preventDefault();
    try {
      setStreamSaving(true);
      setStreamError("");
      const res = await updateMatchStreamLink(id, streamUrlInput.trim());
      if (res.data.success) {
        setMatch((prev) => ({
          ...prev,
          liveStreamUrl: res.data.liveStreamUrl,
          videoId: res.data.videoId,
        }));
      }
    } catch (err) {
      setStreamError(err.response?.data?.message || "Invalid YouTube stream URL.");
    } finally {
      setStreamSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-[#9B9691]">
        <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-medium">Connecting to Arena Scoreboard...</p>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-court-900 border border-court-700 rounded-3xl text-center text-[#F5F0E6]">
        <h3 className="text-lg font-bold mb-2">Match Not Found</h3>
        <Link to="/live" className="text-gold text-xs font-bold hover:underline">
          ← Return to Live Matches
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in text-[#F5F0E6]">
      <Link
        to="/live"
        className="inline-flex items-center gap-2 text-xs font-bold text-[#9B9691] hover:text-[#F5F0E6] transition-colors"
      >
        <ArrowLeft className="w-4 h-4 text-gold" />
        <span>Back to Matches</span>
      </Link>

      {/* Main Scoreboard Header */}
      <div className="bg-gradient-to-br from-court-900 via-court-850 to-court-950 border-2 border-court-700 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden shadow-gold/10">
        {/* Match Header Tag */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-court-700">
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                match.status === "live"
                  ? "bg-red-500 text-white animate-pulse"
                  : match.status === "completed"
                  ? "bg-gold/15 text-gold border border-gold/30"
                  : "bg-court-950 text-[#9B9691] border border-court-700"
              }`}
            >
              {match.status === "live" && <span className="w-2 h-2 rounded-full bg-white"></span>}
              {match.status}
            </span>
            <span className="text-xs font-bold text-[#9B9691]">
              {match.sport} • {match.tournamentId?.name || "Friendly Match"}
            </span>
          </div>

          <div className="text-xs text-[#9B9691] flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-gold" />
            <span>{match.venueId?.name || "Tamil Nadu Arena"}</span>
          </div>
        </div>

        {/* Big Teams Face-Off */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center py-8">
          {/* Team 1 */}
          <div className="text-center sm:text-left space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-court-800 border-2 border-gold/40 flex items-center justify-center text-2xl font-black text-gold mx-auto sm:mx-0 shadow-lg shadow-gold/5">
              {match.team1Id?.name?.charAt(0)}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#F5F0E6] truncate">
              {match.team1Id?.name}
            </h2>
            <p className="text-xs text-[#9B9691]">{match.team1Id?.city}</p>
          </div>

          {/* Scores in Center */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-4">
              <span className="font-mono text-3xl sm:text-5xl font-black text-gold tracking-wider">
                {match.team1Score || "0"}
              </span>
              <span className="text-[#656C7D] font-bold text-2xl">:</span>
              <span className="font-mono text-3xl sm:text-5xl font-black text-gold tracking-wider">
                {match.team2Score || "0"}
              </span>
            </div>
            <div className="px-4 py-1.5 bg-court-950/90 border border-court-700 rounded-full inline-block text-xs font-semibold text-red-300">
              {match.liveStatus}
            </div>
          </div>

          {/* Team 2 */}
          <div className="text-center sm:text-right space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-court-800 border-2 border-gold/40 flex items-center justify-center text-2xl font-black text-gold mx-auto sm:ml-auto sm:mr-0 shadow-lg shadow-gold/5">
              {match.team2Id?.name?.charAt(0)}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#F5F0E6] truncate">
              {match.team2Id?.name}
            </h2>
            <p className="text-xs text-[#9B9691]">{match.team2Id?.city}</p>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Stream & Commentary vs Scorer Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Live YouTube Broadcast & Live Commentary */}
        <div className="lg:col-span-2 space-y-8">
          {/* YouTube Video Stream Player (if videoId exists) */}
          {match.videoId ? (
            <div className="bg-court-900 border border-court-700 rounded-3xl overflow-hidden shadow-2xl shadow-gold/5">
              <div className="p-4 bg-court-950 border-b border-court-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-red-500" />
                  <span className="font-bold text-xs text-[#F5F0E6] uppercase tracking-wider">
                    Official Match Live Stream
                  </span>
                </div>
                <span className="text-[10px] text-[#9B9691]">Embedded Player</span>
              </div>
              <div className="aspect-video w-full">
                <iframe
                  src={`https://www.youtube.com/embed/${match.videoId}?autoplay=0&rel=0`}
                  title="PlaySphere Live Stream"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          ) : (
            <div className="bg-court-900 border border-court-700 rounded-3xl p-8 text-center shadow-xl">
              <Video className="w-12 h-12 text-gold/40 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-[#F5F0E6]">No Live Video Stream Attached</h3>
              <p className="text-xs text-[#9B9691] mt-1">
                Authorized scorers or organizers can link a YouTube live broadcast link below.
              </p>
            </div>
          )}

          {/* Live Commentary & Highlights Timeline */}
          <div className="bg-court-900 border border-court-700 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4 shadow-gold/5">
            <h3 className="text-base font-bold text-[#F5F0E6] flex items-center gap-2">
              <Radio className="w-5 h-5 text-red-400 animate-pulse" />
              <span>Ball-by-Ball & Commentary Timeline</span>
            </h3>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {(match.scoreDetail?.timeline || []).length === 0 ? (
                <p className="text-xs text-[#656C7D] italic py-4 text-center">
                  Live commentary updates will appear here as the match progresses.
                </p>
              ) : (
                match.scoreDetail.timeline.map((event, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-court-950 border border-court-700 rounded-2xl flex items-start gap-3 text-xs"
                  >
                    <span className="px-2 py-1 bg-gold/15 text-gold font-mono font-bold rounded-lg shrink-0">
                      {event.time}
                    </span>
                    <p className="text-[#F5F0E6] leading-relaxed">{event.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Official Scorer Panel (Controlled Access) */}
        <div className="space-y-6">
          {canScore ? (
            <div className="bg-court-900 border-2 border-gold/40 rounded-3xl p-6 shadow-2xl space-y-6 shadow-gold/10">
              <div className="flex items-center justify-between pb-3 border-b border-court-700">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-gold" />
                  <h3 className="font-extrabold text-sm text-[#F5F0E6]">Official Scorer Controls</h3>
                </div>
                <span className="px-2 py-0.5 bg-gold/20 text-gold-glow text-[10px] font-bold rounded-md border border-gold/40">
                  AUTHORIZED
                </span>
              </div>

              {/* Status Switcher */}
              <div>
                <label className="block text-xs font-bold text-[#9B9691] uppercase mb-2">
                  Match State
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["scheduled", "live", "completed"].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleScoreUpdate({ status: st })}
                      className={`py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                        match.status === st
                          ? "bg-gradient-to-r from-gold to-amber-500 text-court-950 shadow-md shadow-gold/20 font-black"
                          : "bg-court-950 text-[#9B9691] border border-court-700 hover:text-white"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Score Increments */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-[#9B9691] uppercase">
                  Quick Score Modifier
                </label>

                {/* Team 1 modifier */}
                <div className="p-3 bg-court-950 rounded-2xl border border-court-700 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-[#F5F0E6]">
                    <span className="truncate">{match.team1Id?.name}</span>
                    <span className="font-mono text-gold font-black">{match.team1Score}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {["+1", "+2", "+4", "+6", "Wkt", "Goal"].map((btn) => (
                      <button
                        key={btn}
                        onClick={() => {
                          const current = parseInt(match.team1Score, 10) || 0;
                          const add = parseInt(btn.replace("+", ""), 10) || 1;
                          handleScoreUpdate({ team1Score: String(current + add) });
                        }}
                        className="px-2.5 py-1 bg-court-800 hover:bg-gold hover:text-court-950 text-[#F5F0E6] text-xs font-bold rounded-lg transition-colors border border-court-700"
                      >
                        {btn}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Team 2 modifier */}
                <div className="p-3 bg-court-950 rounded-2xl border border-court-700 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-[#F5F0E6]">
                    <span className="truncate">{match.team2Id?.name}</span>
                    <span className="font-mono text-gold font-black">{match.team2Score}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {["+1", "+2", "+4", "+6", "Wkt", "Goal"].map((btn) => (
                      <button
                        key={btn}
                        onClick={() => {
                          const current = parseInt(match.team2Score, 10) || 0;
                          const add = parseInt(btn.replace("+", ""), 10) || 1;
                          handleScoreUpdate({ team2Score: String(current + add) });
                        }}
                        className="px-2.5 py-1 bg-court-800 hover:bg-gold hover:text-court-950 text-[#F5F0E6] text-xs font-bold rounded-lg transition-colors border border-court-700"
                      >
                        {btn}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Live Status Text Editor */}
              <div>
                <label className="block text-xs font-bold text-[#9B9691] uppercase mb-1">
                  Live Status Summary
                </label>
                <input
                  type="text"
                  defaultValue={match.liveStatus}
                  onBlur={(e) => handleScoreUpdate({ liveStatus: e.target.value })}
                  placeholder="e.g. 2nd Innings - 18.4 ov"
                  className="w-full bg-court-950 border border-court-700 text-[#F5F0E6] rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-gold focus:border-gold focus:outline-none"
                />
              </div>

              {/* Add Commentary Line */}
              <form onSubmit={handleSendCommentary} className="space-y-2">
                <label className="block text-xs font-bold text-[#9B9691] uppercase">
                  Add Commentary Event
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={commentaryInput}
                    onChange={(e) => setCommentaryInput(e.target.value)}
                    placeholder="e.g. FOUR! Brilliant cover drive..."
                    className="flex-1 bg-court-950 border border-court-700 text-[#F5F0E6] rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-gold focus:border-gold focus:outline-none placeholder:text-[#656C7D]"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-gradient-to-r from-gold to-amber-500 text-court-950 font-black rounded-xl text-xs shadow-md shadow-gold/20"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>

              {/* YouTube Stream Link Updater */}
              <form onSubmit={handleSaveStream} className="space-y-2 pt-3 border-t border-court-700">
                <label className="block text-xs font-bold text-[#9B9691] uppercase flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-red-500" />
                  <span>YouTube Stream URL</span>
                </label>

                {streamError && (
                  <p className="text-[11px] text-red-400 font-semibold">{streamError}</p>
                )}

                <div className="flex gap-2">
                  <input
                    type="url"
                    value={streamUrlInput}
                    onChange={(e) => setStreamUrlInput(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="flex-1 bg-court-950 border border-court-700 text-[#F5F0E6] rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-gold focus:border-gold focus:outline-none placeholder:text-[#656C7D]"
                  />
                  <button
                    type="submit"
                    disabled={streamSaving}
                    className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors disabled:opacity-50"
                  >
                    {streamSaving ? "Saving..." : "Attach"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-court-900 border border-court-700 rounded-3xl p-6 text-center space-y-3 shadow-xl">
              <Lock className="w-8 h-8 text-gold/40 mx-auto" />
              <h4 className="font-bold text-sm text-[#F5F0E6]">Official Scorer View</h4>
              <p className="text-xs text-[#9B9691]">
                This match is being scored live by the designated referee. You are viewing the live spectator stream.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Team Rosters & Lineups */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Team 1 Roster */}
        <div className="bg-court-900 border border-court-700 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-court-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-court-800 border border-gold/40 flex items-center justify-center font-bold text-gold text-sm">
                {match.team1Id?.name?.charAt(0) || "1"}
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#F5F0E6]">{match.team1Id?.name || "Team 1"}</h3>
                <p className="text-[10px] text-gold-glow flex items-center gap-1">
                  <span>👑 Captain: {match.team1Id?.captainId?.name || "Captain"}</span>
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-court-800 text-[#9B9691] text-[10px] font-bold rounded-lg">
              {match.team1Id?.members?.length || 0} Athletes
            </span>
          </div>

          <div className="divide-y divide-court-800">
            {(match.team1Id?.members || []).map((m, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-court-800 border border-court-700 flex items-center justify-center text-[10px] text-gold font-bold">
                    {idx + 1}
                  </div>
                  <span className="font-semibold text-[#F5F0E6]">{m.userId?.name || "Athlete"}</span>
                  <span className="text-[10px] text-[#9B9691] capitalize">({m.role})</span>
                </div>
                {m.userId?._id && (
                  <Link
                    to={`/profile/public/${m.userId._id}`}
                    className="text-[10px] text-gold hover:text-gold-light hover:underline font-semibold"
                  >
                    View Pass →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Team 2 Roster */}
        <div className="bg-court-900 border border-court-700 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-court-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-court-800 border border-gold/40 flex items-center justify-center font-bold text-gold text-sm">
                {match.team2Id?.name?.charAt(0) || "2"}
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#F5F0E6]">{match.team2Id?.name || "Team 2"}</h3>
                <p className="text-[10px] text-gold-glow flex items-center gap-1">
                  <span>👑 Captain: {match.team2Id?.captainId?.name || "Captain"}</span>
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-court-800 text-[#9B9691] text-[10px] font-bold rounded-lg">
              {match.team2Id?.members?.length || 0} Athletes
            </span>
          </div>

          <div className="divide-y divide-court-800">
            {(match.team2Id?.members || []).map((m, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-court-800 border border-court-700 flex items-center justify-center text-[10px] text-gold font-bold">
                    {idx + 1}
                  </div>
                  <span className="font-semibold text-[#F5F0E6]">{m.userId?.name || "Athlete"}</span>
                  <span className="text-[10px] text-[#9B9691] capitalize">({m.role})</span>
                </div>
                {m.userId?._id && (
                  <Link
                    to={`/profile/public/${m.userId._id}`}
                    className="text-[10px] text-gold hover:text-gold-light hover:underline font-semibold"
                  >
                    View Pass →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchLive;
