import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchPublicProfile } from "../api";
import {
  ShieldCheck,
  Award,
  Star,
  MapPin,
  Clock,
  Trophy,
  ArrowLeft,
  Share2,
  Check,
  Copy,
  Building2,
  Briefcase,
  Medal,
  Users,
  Calendar,
  Phone,
  Send,
  Sparkles,
  QrCode,
  X,
  ExternalLink,
} from "lucide-react";

const PublicProfile = () => {
  const { userId } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [role, setRole] = useState("player");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const res = await fetchPublicProfile(userId);
        if (res.data.success) {
          setProfileData(res.data.profile);
          setRole(res.data.role || "player");
        }
      } catch (err) {
        setError("Sports profile not found or public link is invalid.");
      } finally {
        setLoading(false);
      }
    };

    if (userId) loadProfile();
  }, [userId]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getWhatsAppShareUrl = () => {
    const title =
      role === "coach"
        ? `📋 Check out Coach ${profileData?.name}'s Certified Training Squad & Credentials on PlaySphere:`
        : role === "ground_owner"
        ? `🏟️ Book sports turf slots at ${profileData?.name} on PlaySphere:`
        : `🏆 Check out ${profileData?.name}'s official Athlete Passport on PlaySphere:`;
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(
      `${title}\n\n🔗 ${window.location.href}`
    )}`;
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-[#9B9691]">
        <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-bold text-gold">Loading Sports Passport...</p>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-court-900 border border-court-700 rounded-3xl text-center text-[#F5F0E6]">
        <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 mx-auto flex items-center justify-center mb-3 text-lg font-bold">
          !
        </div>
        <h3 className="text-lg font-bold mb-2">Profile Not Found</h3>
        <p className="text-xs text-[#9B9691] mb-6">{error || "No sports profile exists for this ID."}</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-gold to-amber-500 text-court-950 font-black rounded-xl text-xs shadow-md shadow-gold/20"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to PlaySphere</span>
        </Link>
      </div>
    );
  }

  const isCoach = role === "coach";
  const isGroundOwner = role === "ground_owner";
  const isPlayer = !isCoach && !isGroundOwner;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 animate-fade-in text-[#F5F0E6] space-y-6">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#9B9691] hover:text-[#F5F0E6] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-gold" />
          <span>Back to PlaySphere</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setQrModalOpen(true)}
            className="px-3 py-1.5 bg-court-850 hover:bg-court-800 border border-court-700 text-[#F5F0E6] text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
            title="View QR Verification Code"
          >
            <QrCode className="w-3.5 h-3.5 text-gold" />
            <span className="hidden sm:inline">QR Pass</span>
          </button>

          <a
            href={getWhatsAppShareUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>

          <button
            type="button"
            onClick={handleShare}
            className="px-3.5 py-1.5 bg-gold hover:bg-gold-hover text-court-950 text-xs font-black rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Link Copied!" : "Copy Link"}</span>
          </button>
        </div>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-court-900 border border-court-700 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden shadow-gold/5">
        {/* Glow Accent */}
        <div className="absolute -top-20 -right-20 w-52 h-52 bg-gold/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-court-700 relative z-10">
          {/* Avatar / Badge Icon */}
          <div
            className={`w-24 h-24 rounded-3xl border-2 flex items-center justify-center text-3xl font-black shadow-lg shrink-0 overflow-hidden ${
              isCoach
                ? "bg-blue-950/40 border-blue-500/50 text-blue-400 shadow-blue-500/20"
                : isGroundOwner
                ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-400 shadow-emerald-500/20"
                : "bg-court-800 border-gold/50 text-gold shadow-gold/20"
            }`}
          >
            {profileData.profilePhoto ? (
              <img
                src={profileData.profilePhoto}
                alt={profileData.name}
                className="w-full h-full object-cover"
              />
            ) : isCoach ? (
              <Briefcase className="w-10 h-10" />
            ) : isGroundOwner ? (
              <Building2 className="w-10 h-10" />
            ) : (
              profileData.name?.charAt(0).toUpperCase()
            )}
          </div>

          {/* Profile Identity Details */}
          <div className="text-center sm:text-left space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-[#F5F0E6]">{profileData.name}</h1>
              <ShieldCheck
                className={`w-5 h-5 ${
                  isCoach ? "text-blue-400" : isGroundOwner ? "text-emerald-400" : "text-gold"
                }`}
              />
              <span
                className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                  isCoach
                    ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                    : isGroundOwner
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : "bg-gold/15 text-gold border-gold/40"
                }`}
              >
                {isCoach
                  ? "Certified Coach"
                  : isGroundOwner
                  ? "Verified Turf Owner"
                  : "Verified Athlete"}
              </span>
            </div>

            <p className="text-xs font-mono font-bold text-gold">
              {profileData.playerIdNumber || "PS-MEMBER"}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1 text-xs text-[#9B9691]">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-gold" />
                {profileData.city}, Tamil Nadu
              </span>
              <span>•</span>
              <span className="font-semibold text-gold">{profileData.sport}</span>
              <span>•</span>
              <span className="capitalize text-amber-300 font-semibold">
                {profileData.skillLevel}
              </span>
            </div>
          </div>
        </div>

        {/* Bio / Mission statement */}
        {profileData.bio && (
          <div className="py-4 border-b border-court-700 text-xs text-[#F5F0E6] leading-relaxed italic">
            "{profileData.bio}"
          </div>
        )}

        {/* Dynamic Role Body */}

        {/* 1. COACH SPECIFIC SECTION */}
        {isCoach && (
          <div className="pt-6 space-y-6">
            {/* Certifications row */}
            {profileData.certifications && profileData.certifications.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-[#9B9691] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-blue-400" />
                  <span>Official Coaching Credentials & Certifications</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {profileData.certifications.map((c, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-court-950 border border-blue-500/40 text-blue-300 font-bold text-xs rounded-xl flex items-center gap-1.5"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Managed Squads List */}
            {profileData.managedTeams && profileData.managedTeams.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-[#9B9691] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-gold" />
                  <span>Managed Squads & Teams</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {profileData.managedTeams.map((t) => (
                    <Link
                      key={t._id}
                      to={`/teams/${t._id}`}
                      className="p-3.5 bg-court-950 hover:bg-court-850 border border-court-750 hover:border-gold/50 rounded-2xl flex items-center justify-between group transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-court-900 border border-gold/40 flex items-center justify-center text-gold font-bold">
                          {t.name.charAt(0)}
                        </div>
                        <div>
                          <h5 className="font-bold text-sm text-[#F5F0E6] group-hover:text-gold transition-colors">
                            {t.name}
                          </h5>
                          <span className="text-[11px] text-[#9B9691]">
                            {t.sport} • {t.city} • {t.memberCount} Members
                          </span>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-[#9B9691] group-hover:text-gold" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Coach CTA */}
            <div className="p-5 bg-gradient-to-r from-blue-950/40 via-court-950 to-blue-950/40 border border-blue-500/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-sm text-[#F5F0E6]">Interested in joining this squad?</h4>
                <p className="text-xs text-[#9B9691]">
                  Sign up on PlaySphere to apply for tryouts, receive drills, and play in tournaments.
                </p>
              </div>
              <Link
                to="/signup?role=player"
                className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl text-xs shadow-md transition-all shrink-0"
              >
                Sign Up as Athlete
              </Link>
            </div>
          </div>
        )}

        {/* 2. GROUND OWNER SPECIFIC SECTION */}
        {isGroundOwner && (
          <div className="pt-6 space-y-6">
            {/* Managed Venues List */}
            {profileData.managedVenues && profileData.managedVenues.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-[#9B9691] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <span>Listed Sports Venues & Synthetic Turfs</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profileData.managedVenues.map((v) => (
                    <div
                      key={v._id}
                      className="p-4 bg-court-950 border border-court-750 hover:border-emerald-500/50 rounded-2xl flex flex-col justify-between group transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-md">
                            {v.sportType}
                          </span>
                          <span className="text-xs font-extrabold text-gold">
                            ₹{v.pricePerHour}/hr
                          </span>
                        </div>
                        <h5 className="font-bold text-sm text-[#F5F0E6] mb-1">{v.name}</h5>
                        <p className="text-xs text-[#9B9691] line-clamp-1">{v.address}</p>
                      </div>

                      <Link
                        to={`/venues/${v._id}`}
                        className="mt-4 w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs text-center block transition-colors shadow-sm"
                      >
                        Book Turf Slot
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inquiries Contact Box */}
            <div className="p-5 bg-gradient-to-r from-emerald-950/40 via-court-950 to-emerald-950/40 border border-emerald-500/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-sm text-[#F5F0E6]">Venue Booking & Bulk Slots</h4>
                <p className="text-xs text-[#9B9691]">
                  Contact: <strong className="text-[#F5F0E6]">{profileData.contactPhone}</strong>
                </p>
              </div>
              <Link
                to="/venues"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors shrink-0"
              >
                Explore All Turfs
              </Link>
            </div>
          </div>
        )}

        {/* 3. PLAYER SPECIFIC SECTION */}
        {isPlayer && (
          <div className="pt-6 space-y-6">
            {/* Player Stats Grid */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3.5 bg-court-950 rounded-2xl border border-court-700">
                <span className="text-2xl font-black text-gold">{profileData.matchesPlayed || 0}</span>
                <span className="text-[10px] text-[#9B9691] block uppercase font-bold mt-0.5">
                  Matches
                </span>
              </div>
              <div className="p-3.5 bg-court-950 rounded-2xl border border-court-700">
                <span className="text-2xl font-black text-amber-400">
                  {profileData.matchesWon || 0}
                </span>
                <span className="text-[10px] text-[#9B9691] block uppercase font-bold mt-0.5">
                  Wins
                </span>
              </div>
              <div className="p-3.5 bg-court-950 rounded-2xl border border-court-700">
                <span className="text-2xl font-black text-gold">
                  {profileData.rating > 0 ? profileData.rating.toFixed(1) : "5.0"}
                </span>
                <span className="text-[10px] text-[#9B9691] block uppercase font-bold mt-0.5">
                  Rating
                </span>
              </div>
            </div>

            {/* Badges */}
            {profileData.badges && profileData.badges.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-[#9B9691] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-gold" />
                  <span>Badges & Recognitions</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {profileData.badges.map((b, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-court-950 border border-court-700 rounded-xl text-xs font-bold text-[#F5F0E6] flex items-center gap-1.5"
                    >
                      <Award className="w-3.5 h-3.5 text-gold" />
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Challenge CTA */}
            <div className="p-5 bg-gradient-to-r from-gold/10 via-court-950 to-gold/10 border border-gold/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-sm text-[#F5F0E6]">Want to challenge this athlete?</h4>
                <p className="text-xs text-[#9B9691]">
                  Join PlaySphere to match with nearby athletes in {profileData.city}.
                </p>
              </div>
              <Link
                to="/signup?role=player"
                className="px-5 py-2.5 bg-gradient-to-r from-gold to-amber-500 text-court-950 font-black rounded-xl text-xs shadow-md shadow-gold/20 transition-all shrink-0"
              >
                Join PlaySphere Free
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* QR Code Verification Modal */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-court-900 border border-gold/40 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center relative shadow-2xl shadow-gold/15">
            <button
              onClick={() => setQrModalOpen(false)}
              className="absolute top-4 right-4 text-[#9B9691] hover:text-[#F5F0E6] p-1 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-gold/15 border border-gold/40 flex items-center justify-center text-gold mx-auto mb-3">
              <QrCode className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-black text-[#F5F0E6]">{profileData.name}</h3>
            <p className="text-xs text-gold font-mono mb-4">{profileData.playerIdNumber}</p>

            {/* QR Visual Canvas Box */}
            <div className="p-4 bg-white rounded-2xl mx-auto w-48 h-48 flex items-center justify-center shadow-lg mb-4">
              <div className="w-full h-full border-4 border-black p-2 flex flex-col items-center justify-center">
                <QrCode className="w-32 h-32 text-black" />
              </div>
            </div>

            <p className="text-[11px] text-[#9B9691] mb-4">
              Scan this QR pass to verify athlete authenticity on PlaySphere across all Tamil Nadu venues.
            </p>

            <button
              onClick={() => setQrModalOpen(false)}
              className="w-full py-2.5 bg-court-800 hover:bg-court-750 text-[#F5F0E6] font-bold text-xs rounded-xl"
            >
              Close QR Pass
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicProfile;
