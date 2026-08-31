import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SportSelector from "../components/SportSelector";
import DistrictSelector from "../components/DistrictSelector";
import {
  ShieldCheck,
  Award,
  Sparkles,
  CheckCircle2,
  MapPin,
  Clock,
  Camera,
  Briefcase,
  Building2,
  Phone,
  Medal,
} from "lucide-react";
import confetti from "canvas-confetti";

const SAMPLE_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
];

const ProfileCreate = () => {
  const { user, updateProfileData } = useAuth();
  const navigate = useNavigate();

  const isCoach = user?.role === "coach";
  const isGroundOwner = user?.role === "ground_owner";

  const [formData, setFormData] = useState({
    name: user?.name || "",
    sport: "Cricket",
    secondarySports: ["Badminton"],
    skillLevel: "intermediate",
    city: user?.city || "Chennai",
    rating: 4.5,
    bio: isCoach
      ? "Certified sports trainer dedicated to squad building and tactical player development."
      : isGroundOwner
      ? "Providing high-standard synthetic turf, floodlit courts, and seamless hourly bookings."
      : "Passionate athlete looking for weekly games, matches, and tournament squads.",
    preferredPlayTime: "Evenings (5 PM - 8 PM)",
    profilePhoto: SAMPLE_AVATARS[0],
    businessName: isGroundOwner ? `${user?.name || "Sports"}'s Arena & Turfs` : "",
    contactPhone: "+91 98401 23456",
    yearsOfExperience: 5,
    certifications: ["State Certified Trainer", "NIS Diploma"],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await updateProfileData(formData);
    setLoading(false);

    if (res.success) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#D4AF37", "#F0B90B", "#F5F0E6"],
        });
      } catch {}

      if (isGroundOwner) {
        navigate("/venues");
      } else if (isCoach) {
        navigate("/teams");
      } else {
        navigate("/dashboard");
      }
    } else {
      setError(res.message || "Failed to complete sports profile.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6 max-w-2xl mx-auto text-[#F5F0E6]">
      <div className="bg-court-900 border border-court-700 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden shadow-gold/10">
        {/* Glow Header */}
        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-gold/15 border border-gold/40 text-gold-glow rounded-full text-xs font-bold mb-3 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span>Step 2 of 2: Activate Your Sports Passport</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5F0E6]">
            {isCoach
              ? "Set Up Your Certified Coach Profile"
              : isGroundOwner
              ? "Set Up Sports Turf / Facility Profile"
              : "Create Your Athlete Profile"}
          </h2>
          <p className="text-xs text-[#9B9691] mt-2 max-w-md mx-auto">
            {isCoach
              ? "Configure your coaching specialties, experience, and certifications to start managing squads."
              : isGroundOwner
              ? "Set up your venue contact and business details to list synthetic turfs & courts."
              : "Set up your sports preferences to get your verified Digital Sports ID & find nearby players."}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          {/* Ground Owner Business Details */}
          {isGroundOwner && (
            <div className="space-y-4 p-4 bg-court-950 border border-emerald-500/30 rounded-2xl">
              <div>
                <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
                  Sports Turf / Business Name
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    name="businessName"
                    required
                    value={formData.businessName}
                    onChange={handleChange}
                    placeholder="e.g. Marina Grand Sports Arena"
                    className="w-full bg-court-900 border border-court-700 text-[#F5F0E6] rounded-xl pl-10 pr-4 py-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
                  Contact Phone for Inquiries
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    name="contactPhone"
                    required
                    value={formData.contactPhone}
                    onChange={handleChange}
                    placeholder="+91 98401 23456"
                    className="w-full bg-court-900 border border-court-700 text-[#F5F0E6] rounded-xl pl-10 pr-4 py-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Coach Experience Fields */}
          {isCoach && (
            <div className="space-y-4 p-4 bg-court-950 border border-blue-500/30 rounded-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
                    Years of Coaching Experience
                  </label>
                  <input
                    type="number"
                    name="yearsOfExperience"
                    min="0"
                    max="50"
                    value={formData.yearsOfExperience}
                    onChange={handleChange}
                    className="w-full bg-court-900 border border-court-700 text-[#F5F0E6] rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
                    Contact Phone Number
                  </label>
                  <input
                    type="text"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    placeholder="+91 98401 23456"
                    className="w-full bg-court-900 border border-court-700 text-[#F5F0E6] rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Primary Sport Selector */}
          <div>
            <label className="block text-xs font-bold text-[#9B9691] uppercase tracking-wider mb-1.5">
              {isGroundOwner ? "Primary Facility Sport" : "Primary Sport / Specialization"}
            </label>
            <SportSelector
              value={formData.sport}
              onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
            />
          </div>

          {/* Player Skill Level (For Players) */}
          {!isCoach && !isGroundOwner && (
            <div>
              <label className="block text-xs font-bold text-[#9B9691] uppercase tracking-wider mb-2">
                Skill Level
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { level: "beginner", label: "Beginner", desc: "Learning / Casual play" },
                  { level: "intermediate", label: "Intermediate", desc: "Regular club player" },
                  { level: "advanced", label: "Advanced", desc: "Competitive / Tournament" },
                ].map((s) => (
                  <button
                    key={s.level}
                    type="button"
                    onClick={() => setFormData({ ...formData, skillLevel: s.level })}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      formData.skillLevel === s.level
                        ? "bg-gold/15 border-gold text-[#F5F0E6] shadow-md shadow-gold/10"
                        : "bg-court-950 border-court-700 text-[#9B9691] hover:border-court-600"
                    }`}
                  >
                    <span className="font-bold text-xs block text-[#F5F0E6] capitalize">
                      {s.label}
                    </span>
                    <span className="text-[10px] text-[#9B9691] block mt-0.5">{s.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* District & Timing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#9B9691] uppercase tracking-wider mb-1.5">
                Home District (Tamil Nadu)
              </label>
              <DistrictSelector
                value={formData.city}
                onChange={handleChange}
                name="city"
                placeholder="Select District..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#9B9691] uppercase tracking-wider mb-1.5">
                {isGroundOwner ? "Turf Operating Hours" : "Preferred Play Time"}
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-gold absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  name="preferredPlayTime"
                  value={formData.preferredPlayTime}
                  onChange={handleChange}
                  placeholder={isGroundOwner ? "6:00 AM - 11:00 PM" : "e.g. Evenings (5 PM - 8 PM)"}
                  className="w-full bg-court-950 border border-court-700 text-[#F5F0E6] rounded-xl pl-10 pr-4 py-2.5 text-xs focus:ring-2 focus:ring-gold focus:border-gold focus:outline-none placeholder:text-[#656C7D]"
                />
              </div>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-bold text-[#9B9691] uppercase tracking-wider mb-1.5">
              {isCoach
                ? "Coaching Philosophy & Credentials"
                : isGroundOwner
                ? "Facility Amenities & About Turf"
                : "Player Bio & Style"}
            </label>
            <textarea
              name="bio"
              rows={3}
              value={formData.bio}
              onChange={handleChange}
              placeholder={
                isCoach
                  ? "Describe your coaching achievements, teams coached, and training methods..."
                  : isGroundOwner
                  ? "Describe turf specifications, floodlight capacity, and amenities..."
                  : "Tell other players about your playing style, achievements, or favorite positions..."
              }
              className="w-full bg-court-950 border border-court-700 text-[#F5F0E6] rounded-xl p-3.5 text-xs focus:ring-2 focus:ring-gold focus:border-gold focus:outline-none placeholder:text-[#656C7D]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-gold via-amber-400 to-gold-hover hover:from-gold-hover hover:to-amber-500 text-court-950 font-black text-sm rounded-xl shadow-xl shadow-gold/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>
              {loading
                ? "Setting up Profile..."
                : isCoach
                ? "Complete Coach Setup & Enter Arena"
                : isGroundOwner
                ? "Complete Turf Profile & Open Manager"
                : "Complete Profile & Enter Arena"}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileCreate;
