import React, { useState } from "react";
import {
  X,
  Share2,
  Copy,
  Check,
  QrCode,
  Sparkles,
  Medal,
  Briefcase,
  Building2,
  Send,
  ExternalLink,
  Smartphone,
  Award,
  Download,
} from "lucide-react";
import { generateInviteCode } from "../api";
import { useAuth } from "../context/AuthContext";
import SportSelector from "./SportSelector";
import DistrictSelector from "./DistrictSelector";

const ShareHubModal = ({ isOpen, onClose, defaultTab = "player" }) => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState(defaultTab || "player");
  const [copied, setCopied] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  // Community Invite generator state
  const [sport, setSport] = useState("All Sports");
  const [city, setCity] = useState(user?.city || "Chennai");
  const [inviteCode, setInviteCode] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);

  if (!isOpen) return null;

  const origin = window.location.origin;

  // Role-Specific Links & Message Templates
  const playerProfileUrl = user?._id
    ? `${origin}/profile/public/${user._id}`
    : `${origin}/signup?role=player`;

  const coachRecruitUrl = user?._id
    ? `${origin}/profile/public/${user._id}`
    : `${origin}/teams`;

  const groundBookingUrl = user?._id
    ? `${origin}/profile/public/${user._id}`
    : `${origin}/venues`;

  const platformInviteUrl = inviteCode
    ? `${origin}/join/${inviteCode}`
    : `${origin}/signup`;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleGenerateInvite = async (e) => {
    e.preventDefault();
    try {
      setInviteLoading(true);
      const res = await generateInviteCode({ sport, city });
      if (res.data.success) {
        setInviteCode(res.data.inviteCode);
      }
    } catch (err) {
      console.error("Failed to generate invite code:", err);
    } finally {
      setInviteLoading(false);
    }
  };

  // WhatsApp Share links
  const getWhatsAppShareUrl = (text, url) => {
    const fullMessage = `${text}\n\n🔗 ${url}`;
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(fullMessage)}`;
  };

  const getTelegramShareUrl = (text, url) => {
    return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
  };

  const getTwitterShareUrl = (text, url) => {
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in text-[#F5F0E6]">
      <div className="bg-court-900 border border-court-700 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative shadow-gold/15 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#9B9691] hover:text-[#F5F0E6] p-1.5 rounded-xl hover:bg-court-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gold/15 border border-gold/40 flex items-center justify-center text-gold shadow-md shadow-gold/10">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-[#F5F0E6]">Public Sports Share Hub</h3>
            <p className="text-xs text-[#9B9691]">
              Share athlete profiles, squad tryouts & turf booking links across Tamil Nadu
            </p>
          </div>
        </div>

        {/* 4 Share Category Tabs */}
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-court-950 rounded-2xl border border-court-750 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab("player")}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
              activeTab === "player"
                ? "bg-gold/20 text-gold-light border border-gold/40 shadow-sm"
                : "text-[#9B9691] hover:text-[#F5F0E6]"
            }`}
          >
            <Medal className="w-3.5 h-3.5" />
            <span className="truncate">Player Pass</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("coach")}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
              activeTab === "coach"
                ? "bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm"
                : "text-[#9B9691] hover:text-[#F5F0E6]"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span className="truncate">Coach Roster</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("owner")}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
              activeTab === "owner"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                : "text-[#9B9691] hover:text-[#F5F0E6]"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span className="truncate">Turf Booking</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("referral")}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
              activeTab === "referral"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                : "text-[#9B9691] hover:text-[#F5F0E6]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="truncate">Community</span>
          </button>
        </div>

        {/* Tab 1: PLAYER SHARE */}
        {activeTab === "player" && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 bg-court-950 border border-gold/30 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold text-gold uppercase tracking-wider flex items-center gap-1.5">
                  <Medal className="w-4 h-4 text-gold" /> Digital Sports Pass & Profile
                </span>
                <span className="text-[10px] bg-gold/15 text-gold px-2 py-0.5 rounded-full font-mono font-bold">
                  {profile?.playerIdNumber || "PS-2026-ATHLETE"}
                </span>
              </div>
              <p className="text-xs text-[#9B9691] leading-relaxed">
                Share your verified sports passport with match statistics, skills, and ratings. Anyone can view your public card without logging in.
              </p>
            </div>

            {/* Share URL input */}
            <div>
              <label className="block text-[11px] font-bold text-[#9B9691] uppercase tracking-wider mb-1.5">
                Shareable Public Profile Link
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  readOnly
                  value={playerProfileUrl}
                  className="w-full bg-court-950 border border-court-700 rounded-xl px-3 py-2.5 pr-24 text-xs font-mono text-[#F5F0E6] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(playerProfileUrl)}
                  className="absolute right-1.5 px-3 py-1.5 bg-gold hover:bg-gold-hover text-court-950 font-black rounded-lg text-xs flex items-center gap-1 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied!" : "Copy"}</span>
                </button>
              </div>
            </div>

            {/* Social Share Buttons */}
            <div>
              <span className="block text-[11px] font-bold text-[#9B9691] uppercase tracking-wider mb-2">
                1-Click Social Sharing
              </span>
              <div className="grid grid-cols-3 gap-2">
                <a
                  href={getWhatsAppShareUrl(
                    `🏆 Connect with me on PlaySphere! Check out my official Athlete Passport, match stats, and challenge me for games in ${profile?.city || "Tamil Nadu"}:`,
                    playerProfileUrl
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 rounded-xl text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>

                <a
                  href={getTelegramShareUrl(
                    `🏆 Official Athlete Profile on PlaySphere:`,
                    playerProfileUrl
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/40 rounded-xl text-sky-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Telegram</span>
                </a>

                <a
                  href={getTwitterShareUrl(
                    `🏆 Track my sports journey on PlaySphere — Tamil Nadu's sports community platform:`,
                    playerProfileUrl
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-court-800 hover:bg-court-750 border border-court-700 rounded-xl text-[#F5F0E6] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-gold" />
                  <span>Twitter / X</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: COACH SHARE */}
        {activeTab === "coach" && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 bg-court-950 border border-blue-500/30 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-blue-400" /> Squad Recruitment & Coaching Portal
                </span>
                <span className="text-[10px] bg-blue-500/15 text-blue-300 px-2 py-0.5 rounded-full font-bold">
                  COACH VERIFIED
                </span>
              </div>
              <p className="text-xs text-[#9B9691] leading-relaxed">
                Invite talented athletes to squad tryouts, publish roster openings, and share coaching credentials across sports federations.
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#9B9691] uppercase tracking-wider mb-1.5">
                Coach Roster & Tryouts Link
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  readOnly
                  value={coachRecruitUrl}
                  className="w-full bg-court-950 border border-court-700 rounded-xl px-3 py-2.5 pr-24 text-xs font-mono text-[#F5F0E6] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(coachRecruitUrl)}
                  className="absolute right-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white font-black rounded-lg text-xs flex items-center gap-1 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied!" : "Copy"}</span>
                </button>
              </div>
            </div>

            <div>
              <span className="block text-[11px] font-bold text-[#9B9691] uppercase tracking-wider mb-2">
                Recruit Players on WhatsApp
              </span>
              <a
                href={getWhatsAppShareUrl(
                  `📋 Coach ${user?.name || "Official Coach"} is recruiting players on PlaySphere! Join our training squad, participate in state championships, and view team rosters:`,
                  coachRecruitUrl
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <Send className="w-4 h-4" />
                <span>Share Squad Tryout Invite on WhatsApp</span>
              </a>
            </div>
          </div>
        )}

        {/* Tab 3: GROUND OWNER SHARE */}
        {activeTab === "owner" && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 bg-court-950 border border-emerald-500/30 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-400" /> Sports Turf & Venue Booking Showcase
                </span>
                <span className="text-[10px] bg-emerald-500/15 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                  TURF PARTNER
                </span>
              </div>
              <p className="text-xs text-[#9B9691] leading-relaxed">
                Share your court booking link with sports clubs and players. Users can see real-time 1-hour slot availability and book immediately.
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#9B9691] uppercase tracking-wider mb-1.5">
                Turf Booking & Amenities Showcase Link
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  readOnly
                  value={groundBookingUrl}
                  className="w-full bg-court-950 border border-court-700 rounded-xl px-3 py-2.5 pr-24 text-xs font-mono text-[#F5F0E6] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(groundBookingUrl)}
                  className="absolute right-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-lg text-xs flex items-center gap-1 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied!" : "Copy"}</span>
                </button>
              </div>
            </div>

            <div>
              <span className="block text-[11px] font-bold text-[#9B9691] uppercase tracking-wider mb-2">
                Promote Turf Booking Slots
              </span>
              <a
                href={getWhatsAppShareUrl(
                  `🏟️ Book slots at our sports turf on PlaySphere! Real-time slot availability, instant confirmation, and floodlight facilities. Check slots & book here:`,
                  groundBookingUrl
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <Send className="w-4 h-4" />
                <span>Share Turf Booking Link on WhatsApp</span>
              </a>
            </div>
          </div>
        )}

        {/* Tab 4: COMMUNITY REFERRAL INVITE */}
        {activeTab === "referral" && (
          <div className="space-y-4 animate-fade-in">
            {!inviteCode ? (
              <form onSubmit={handleGenerateInvite} className="space-y-3.5">
                <div className="p-3.5 bg-court-950 border border-amber-500/30 rounded-2xl text-xs text-[#9B9691]">
                  Generate a customized community invite link tailored to a specific sport and district in Tamil Nadu.
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#9B9691] uppercase tracking-wider mb-1">
                    Sport Community
                  </label>
                  <SportSelector
                    value={sport}
                    onChange={(e) => setSport(e.target.value)}
                    includeAll={true}
                    allLabel="All 33+ Sports Community"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#9B9691] uppercase tracking-wider mb-1">
                    Target District
                  </label>
                  <DistrictSelector
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    includeAll={true}
                    allLabel="All 38 Districts"
                  />
                </div>

                <button
                  type="submit"
                  disabled={inviteLoading}
                  className="w-full py-3 bg-gradient-to-r from-gold to-amber-500 hover:from-gold-hover hover:to-amber-600 text-court-950 font-black rounded-xl text-xs shadow-lg shadow-gold/20 flex items-center justify-center gap-2 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{inviteLoading ? "Generating..." : "Create Shareable Referral Code"}</span>
                </button>
              </form>
            ) : (
              <div className="space-y-3.5">
                <div className="p-4 bg-court-950 border border-gold/30 rounded-2xl text-center">
                  <span className="text-[10px] text-[#9B9691] uppercase font-bold block mb-1">
                    Your Referral Code
                  </span>
                  <span className="text-2xl font-mono font-extrabold text-gold tracking-widest block">
                    {inviteCode}
                  </span>
                  <span className="text-xs text-[#9B9691] block mt-1">
                    Valid for {sport} in {city}
                  </span>
                </div>

                <div className="relative flex items-center">
                  <input
                    type="text"
                    readOnly
                    value={platformInviteUrl}
                    className="w-full bg-court-950 border border-court-700 rounded-xl px-3 py-2.5 pr-24 text-xs font-mono text-[#F5F0E6] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(platformInviteUrl)}
                    className="absolute right-1.5 px-3 py-1.5 bg-gold hover:bg-gold-hover text-court-950 font-black rounded-lg text-xs flex items-center gap-1 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied!" : "Copy"}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setInviteCode("")}
                  className="w-full py-2 bg-court-850 hover:bg-court-800 text-[#F5F0E6] text-xs font-bold rounded-xl border border-court-700"
                >
                  Generate Another District Code
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareHubModal;
