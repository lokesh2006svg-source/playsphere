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
} from "lucide-react";

const PublicProfile = () => {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const res = await fetchPublicProfile(userId);
        if (res.data.success) {
          setProfile(res.data.profile);
        }
      } catch (err) {
        setError("Athlete profile not found or link is invalid.");
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

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-[#9B9691]">
        <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-medium">Loading Athlete Passport...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-court-900 border border-court-700 rounded-3xl text-center text-[#F5F0E6]">
        <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 mx-auto flex items-center justify-center mb-3">
          !
        </div>
        <h3 className="text-lg font-bold mb-2">Profile Not Found</h3>
        <p className="text-xs text-[#9B9691] mb-6">{error || "No player profile exists for this ID."}</p>
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

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 animate-fade-in text-[#F5F0E6]">
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#9B9691] hover:text-[#F5F0E6] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-gold" />
          <span>Back to PlaySphere</span>
        </Link>

        <button
          onClick={handleShare}
          className="px-3.5 py-1.5 bg-court-850 hover:bg-court-800 border border-court-700 hover:border-gold/40 text-[#F5F0E6] text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
        >
          <Share2 className="w-3.5 h-3.5 text-gold" />
          <span>{copied ? "Link Copied!" : "Share Profile"}</span>
        </button>
      </div>

      <div className="bg-court-900 border border-court-700 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden shadow-gold/5">
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-court-700">
          <div className="w-24 h-24 rounded-3xl bg-court-800 border-2 border-gold/50 overflow-hidden flex items-center justify-center text-3xl font-black text-gold shadow-lg shadow-gold/20">
            {profile.profilePhoto ? (
              <img
                src={profile.profilePhoto}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            ) : (
              profile.name?.charAt(0).toUpperCase()
            )}
          </div>

          <div className="text-center sm:text-left space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-black text-[#F5F0E6]">{profile.name}</h1>
              <ShieldCheck className="w-5 h-5 text-gold" />
            </div>

            <p className="text-xs text-gold font-mono font-bold">{profile.playerIdNumber}</p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1 text-xs text-[#9B9691]">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-gold" />
                {profile.city}, Tamil Nadu
              </span>
              <span>•</span>
              <span className="font-semibold text-gold">{profile.sport}</span>
              <span>•</span>
              <span className="capitalize text-amber-300 font-semibold">
                {profile.skillLevel} Level
              </span>
            </div>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="py-4 border-b border-court-700">
            <h4 className="text-xs font-bold text-[#9B9691] uppercase tracking-wider mb-1">
              About Athlete
            </h4>
            <p className="text-xs text-[#F5F0E6] leading-relaxed italic">"{profile.bio}"</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 py-6 border-b border-court-700 text-center">
          <div className="p-3 bg-court-950 rounded-2xl border border-court-700">
            <span className="text-xl font-black text-gold">{profile.matchesPlayed || 0}</span>
            <span className="text-[10px] text-[#9B9691] block uppercase font-bold mt-0.5">
              Matches
            </span>
          </div>
          <div className="p-3 bg-court-950 rounded-2xl border border-court-700">
            <span className="text-xl font-black text-amber-400">{profile.matchesWon || 0}</span>
            <span className="text-[10px] text-[#9B9691] block uppercase font-bold mt-0.5">
              Wins
            </span>
          </div>
          <div className="p-3 bg-court-950 rounded-2xl border border-court-700">
            <span className="text-xl font-black text-gold">
              {profile.rating > 0 ? profile.rating.toFixed(1) : "5.0"}
            </span>
            <span className="text-[10px] text-[#9B9691] block uppercase font-bold mt-0.5">
              Rating
            </span>
          </div>
        </div>

        {/* Badges */}
        {profile.badges && profile.badges.length > 0 && (
          <div className="pt-4">
            <h4 className="text-xs font-bold text-[#9B9691] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-gold" />
              <span>Badges & Recognitions</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {profile.badges.map((b, idx) => (
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
      </div>
    </div>
  );
};

export default PublicProfile;
