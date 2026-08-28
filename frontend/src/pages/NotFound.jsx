import React from "react";
import { Link } from "react-router-dom";
import { Trophy, ArrowLeft, Home, Compass } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center p-6 text-center animate-fade-in text-[#F5F0E6]">
      <div className="w-20 h-20 rounded-3xl bg-court-900 border-2 border-gold/40 flex items-center justify-center text-4xl mb-4 shadow-2xl shadow-gold/20">
        🏆
      </div>

      <span className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
        Out of Bounds • 404
      </span>

      <h1 className="text-3xl sm:text-4xl font-black text-[#F5F0E6] mb-2">
        Page Not Found
      </h1>

      <p className="text-xs text-[#9B9691] max-w-md mb-8">
        The match fixture or page you are looking for has moved, expired, or doesn't exist on the PlaySphere arena.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-gold via-amber-400 to-gold-hover hover:from-gold-hover hover:to-amber-500 text-court-950 font-black rounded-xl text-xs shadow-lg shadow-gold/20 transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Go to Dashboard</span>
        </Link>
        <Link
          to="/players"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-court-800 hover:bg-court-750 border border-court-700 hover:border-gold/40 text-[#F5F0E6] font-bold rounded-xl text-xs transition-colors"
        >
          <Compass className="w-4 h-4 text-gold" />
          <span>Find Players</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
