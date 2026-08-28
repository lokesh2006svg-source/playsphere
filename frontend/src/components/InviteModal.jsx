import React, { useState } from "react";
import { Copy, Check, Share2, X, Sparkles } from "lucide-react";
import { generateInviteCode } from "../api";
import { useAuth } from "../context/AuthContext";
import SportSelector from "./SportSelector";

const InviteModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [sport, setSport] = useState("All Sports");
  const [city, setCity] = useState(user?.city || "Chennai");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await generateInviteCode({ sport, city });
      if (res.data.success) {
        setInviteCode(res.data.inviteCode);
      }
    } catch (err) {
      console.error("Failed to generate invite:", err);
    } finally {
      setLoading(false);
    }
  };

  const inviteUrl = `${window.location.origin}/join/${inviteCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-court-900 border border-court-700 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-[#F5F0E6] shadow-gold/10">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#9B9691] hover:text-[#F5F0E6] p-1 rounded-xl hover:bg-court-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gold/15 border border-gold/40 flex items-center justify-center text-gold shadow-md shadow-gold/10">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#F5F0E6]">Invite Players & Squads</h3>
            <p className="text-xs text-[#9B9691]">Expand your local Tamil Nadu sports network</p>
          </div>
        </div>

        {!inviteCode ? (
          <form onSubmit={handleGenerate} className="space-y-4 mt-4">
            <div>
              <label className="block text-xs font-semibold text-[#9B9691] uppercase tracking-wider mb-1.5">
                Target Sport
              </label>
              <SportSelector
                value={sport}
                onChange={(e) => setSport(e.target.value)}
                includeAll={true}
                allLabel="All Sports Community"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#9B9691] uppercase tracking-wider mb-1.5">
                City / Region
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-court-950 border border-court-700 text-[#F5F0E6] rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-gold focus:outline-none focus:border-gold"
              >
                <option value="Chennai">Chennai</option>
                <option value="Coimbatore">Coimbatore</option>
                <option value="Madurai">Madurai</option>
                <option value="Trichy">Trichy</option>
                <option value="Salem">Salem</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-gold via-amber-400 to-gold-hover hover:from-gold-hover hover:to-amber-500 text-court-950 font-black rounded-xl shadow-lg shadow-gold/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {loading ? "Generating Code..." : "Create Shareable Invite Link"}
            </button>
          </form>
        ) : (
          <div className="space-y-4 mt-4">
            <div className="p-4 bg-court-950 border border-gold/30 rounded-2xl text-center shadow-inner">
              <span className="text-xs text-[#9B9691] block mb-1">Your Unique Invite Code</span>
              <span className="text-2xl font-mono font-extrabold text-gold tracking-widest block">
                {inviteCode}
              </span>
              <span className="text-[11px] text-[#9B9691] block mt-1">
                For {sport} in {city}
              </span>
            </div>

            <div className="relative flex items-center">
              <input
                type="text"
                readOnly
                value={inviteUrl}
                className="w-full bg-court-950 border border-court-700 rounded-xl px-3 py-2.5 pr-24 text-xs font-mono text-[#F5F0E6] focus:outline-none focus:border-gold"
              />
              <button
                onClick={handleCopy}
                className="absolute right-1.5 px-3 py-1.5 bg-gold hover:bg-gold-hover text-court-950 font-black rounded-lg text-xs flex items-center gap-1 transition-colors shadow-sm"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-[#9B9691] text-center">
              Share this link on WhatsApp, Telegram, or sports groups. New players who sign up through this link will automatically connect with you!
            </p>

            <button
              onClick={() => setInviteCode("")}
              className="w-full py-2.5 bg-court-800 hover:bg-court-750 text-[#F5F0E6] font-semibold rounded-xl text-xs transition-colors border border-court-700"
            >
              Generate Another Code
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InviteModal;
