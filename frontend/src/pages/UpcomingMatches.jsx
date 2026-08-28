import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../api.js";

export default function UpcomingMatches() {
  const [matches, setMatches] = useState([]);
  const [status, setStatus] = useState({});

  useEffect(() => {
    apiGet("/matches/upcoming").then(setMatches).catch(() => setMatches([]));
  }, []);

  const register = async (id) => {
    try {
      const data = await apiPost(`/matches/${id}/register`, {});
      setMatches((prev) => prev.map((m) => (m.id === id ? data.match : m)));
      setStatus((prev) => ({ ...prev, [id]: "Registered!" }));
    } catch {
      setStatus((prev) => ({ ...prev, [id]: "Registration failed" }));
    }
  };

  return (
    <div className="text-[#F5F0E6]">
      <h2 className="text-2xl font-black mb-1 text-[#F5F0E6]">Upcoming Matches</h2>
      <p className="text-[#9B9691] mb-6 text-xs">Venue, food, and registration details.</p>

      <div className="grid gap-4">
        {matches.map((m) => (
          <div key={m.id} className="bg-court-900 border border-court-700 rounded-2xl p-5 shadow-lg shadow-gold/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs bg-gold/15 px-2.5 py-1 rounded-full text-gold font-bold">
                {m.ageCategory} · {m.sport}
              </span>
              <span className="text-xs text-[#9B9691]">{m.date} · {m.time}</span>
            </div>

            <div className="text-lg font-bold mb-3 text-[#F5F0E6]">{m.teamA} vs {m.teamB}</div>

            <p className="text-xs text-[#9B9691] mb-1">📍 Venue: {m.venue}</p>
            <p className="text-xs text-[#9B9691] mb-1">
              🍔 Food: {m.foodAvailable ? m.foodMenu.join(", ") : "Not available"}
            </p>
            <p className="text-xs text-[#9B9691] mb-3">
              👥 Teams registered: {m.teamsRegistered}/{m.totalSlots} · Deadline: {m.registrationDeadline}
            </p>

            <button
              onClick={() => register(m.id)}
              disabled={m.teamsRegistered >= m.totalSlots}
              className="text-xs bg-gradient-to-r from-gold to-amber-500 hover:from-gold-hover hover:to-amber-600 disabled:bg-court-800 disabled:text-[#656C7D] disabled:cursor-not-allowed px-4 py-2 rounded-full font-black text-court-950 shadow-md"
            >
              {m.teamsRegistered >= m.totalSlots ? "Slots Full" : "Register Team"}
            </button>
            {status[m.id] && <p className="text-xs text-emerald-400 mt-2 font-semibold">{status[m.id]}</p>}
          </div>
        ))}
        {matches.length === 0 && (
          <p className="text-[#656C7D] text-xs">No upcoming matches scheduled.</p>
        )}
      </div>
    </div>
  );
}
