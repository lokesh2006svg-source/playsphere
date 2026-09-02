import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchPlayerCard, uploadProfilePhoto, deleteProfilePhoto } from "../api";
import PlayerIdCard from "../components/PlayerIdCard";
import SportSelector from "../components/SportSelector";
import DistrictSelector from "../components/DistrictSelector";
import {
  User,
  Shield,
  Award,
  Edit3,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  Sparkles,
  Star,
  CheckCircle,
  Share2,
  ExternalLink,
  Camera,
  Trash2,
  X,
  Upload,
  Loader2,
  AlertCircle,
  Building2,
  Briefcase,
  Phone,
  DollarSign,
  PlusCircle,
  PlayCircle,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

const Profile = () => {
  const { user, profile, updateProfileData, updateProfilePhotoState } = useAuth();
  const role = user?.role || "player";
  const isCoach = role === "coach";
  const isGroundOwner = role === "ground_owner";
  const isPlayer = !isCoach && !isGroundOwner;

  const [activeTab, setActiveTab] = useState(isCoach ? "teams" : isGroundOwner ? "venues" : "card");
  const [cardData, setCardData] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Photo upload states
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [photoSuccess, setPhotoSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: user?.name || "",
    sport: profile?.sport || "Cricket",
    skillLevel: profile?.skillLevel || "intermediate",
    city: profile?.city || user?.city || "Chennai",
    bio: profile?.bio || "",
    phone: profile?.phone || profile?.contactPhone || "",
    preferredPlayTime: profile?.preferredPlayTime || "Evenings (5 PM - 8 PM)",
    profilePhoto: profile?.profilePhoto || "",
    businessName: profile?.businessName || `${user?.name || "My"}'s Sports Venue`,
    contactPhone: profile?.contactPhone || profile?.phone || "+91 98401 23456",
    address: profile?.address || `${profile?.city || user?.city || "Chennai"}, Tamil Nadu`,
    gstNumber: profile?.gstNumber || "",
    yearsOfExperience: profile?.yearsOfExperience !== undefined ? profile.yearsOfExperience : 10,
    certifications: profile?.certifications?.join(", ") || "BCCI Level-2 Coach, NIS Certified",
  });

  useEffect(() => {
    setFormData({
      name: user?.name || "",
      sport: profile?.sport || "Cricket",
      skillLevel: profile?.skillLevel || "intermediate",
      city: profile?.city || user?.city || "Chennai",
      bio: profile?.bio || "",
      phone: profile?.phone || profile?.contactPhone || "",
      preferredPlayTime: profile?.preferredPlayTime || "Evenings (5 PM - 8 PM)",
      profilePhoto: profile?.profilePhoto || "",
      businessName: profile?.businessName || `${user?.name || "My"}'s Sports Venue`,
      contactPhone: profile?.contactPhone || profile?.phone || "+91 98401 23456",
      address: profile?.address || `${profile?.city || user?.city || "Chennai"}, Tamil Nadu`,
      gstNumber: profile?.gstNumber || "",
      yearsOfExperience: profile?.yearsOfExperience !== undefined ? profile.yearsOfExperience : 10,
      certifications: Array.isArray(profile?.certifications) ? profile.certifications.join(", ") : (profile?.certifications || "BCCI Level-2 Coach, NIS Certified"),
    });
  }, [profile, user]);

  useEffect(() => {
    if (user?._id && isPlayer) {
      fetchPlayerCard(user._id)
        .then((res) => {
          if (res.data.success) {
            setCardData(res.data.card);
          }
        })
        .catch((err) => console.warn(err));
    }
  }, [user, profile, isPlayer]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSaveSuccess(false);

    const submitData = {
      ...formData,
      certifications: typeof formData.certifications === "string"
        ? formData.certifications.split(",").map((s) => s.trim()).filter(Boolean)
        : formData.certifications,
      yearsOfExperience: Number(formData.yearsOfExperience) || 0,
    };

    const res = await updateProfileData(submitData);
    setLoading(false);

    if (res.success) {
      setSaveSuccess(true);
      if (user?._id && isPlayer) {
        const cardRes = await fetchPlayerCard(user._id);
        if (cardRes.data.success) setCardData(cardRes.data.card);
      }
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handlePickPhoto = () => {
    setPhotoError("");
    setPhotoSuccess("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setPhotoError("Please select a valid image file (JPG, PNG, or WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("Image size exceeds 5MB. Please choose a smaller photo.");
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleCancelPreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setSelectedFile(null);
    setPhotoError("");
  };

  const handleConfirmUpload = async () => {
    if (!selectedFile) return;

    try {
      setPhotoUploading(true);
      setPhotoError("");

      const res = await uploadProfilePhoto(selectedFile);
      if (res.data.success) {
        updateProfilePhotoState(res.data.profilePhoto);
        setPhotoSuccess("Profile picture updated successfully!");
        handleCancelPreview();

        if (user?._id && isPlayer) {
          const cardRes = await fetchPlayerCard(user._id);
          if (cardRes.data.success) setCardData(cardRes.data.card);
        }

        setTimeout(() => setPhotoSuccess(""), 4000);
      }
    } catch (err) {
      setPhotoError(err.response?.data?.message || "Failed to upload photo. Please try again.");
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!window.confirm("Are you sure you want to remove your profile photo?")) return;

    try {
      setPhotoUploading(true);
      setPhotoError("");
      const res = await deleteProfilePhoto();
      if (res.data.success) {
        updateProfilePhotoState("");
        setPhotoSuccess("Profile photo removed.");
        if (user?._id && isPlayer) {
          const cardRes = await fetchPlayerCard(user._id);
          if (cardRes.data.success) setCardData(cardRes.data.card);
        }
        setTimeout(() => setPhotoSuccess(""), 3000);
      }
    } catch (err) {
      setPhotoError(err.response?.data?.message || "Failed to remove photo.");
    } finally {
      setPhotoUploading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in text-[#F5F0E6]">
      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Success / Error Messages */}
      {photoSuccess && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs font-semibold flex items-center justify-between animate-fade-in shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{photoSuccess}</span>
          </div>
          <button onClick={() => setPhotoSuccess("")} className="hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {photoError && (
        <div className="p-4 bg-red-500/15 border border-red-500/30 rounded-2xl text-red-300 text-xs font-semibold flex items-center justify-between animate-fade-in shadow-md">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span>{photoError}</span>
          </div>
          <button onClick={() => setPhotoError("")} className="hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. ROLE-SPECIFIC PROFILE OVERVIEW BANNER                                  */}
      {/* ========================================================================= */}

      {/* 1A. COACH BANNER */}
      {isCoach && (
        <div className="bg-gradient-to-r from-court-950 via-court-900 to-court-950 border border-blue-500/40 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden shadow-blue-500/5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              {/* Coach Avatar */}
              <div className="relative group">
                <div
                  onClick={handlePickPhoto}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-blue-950 border-2 border-blue-400 flex items-center justify-center text-3xl font-black text-blue-300 shadow-2xl shadow-blue-500/20 overflow-hidden cursor-pointer relative"
                  title="Click to change profile picture"
                >
                  {profile?.profilePhoto ? (
                    <img
                      src={profile.profilePhoto}
                      alt={user?.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <Briefcase className="w-10 h-10 text-blue-400" />
                  )}
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                    <Camera className="w-5 h-5 text-blue-300 mb-0.5" />
                    <span className="text-[9px] font-bold tracking-wider uppercase">Change</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-[#F5F0E6]">{user?.name}</h1>
                  <span className="px-2.5 py-0.5 bg-blue-500/15 border border-blue-500/40 text-blue-300 text-xs font-bold rounded-full">
                    PS-COACH
                  </span>
                </div>
                <p className="text-xs text-[#9B9691] mt-1 flex items-center justify-center sm:justify-start gap-3">
                  <span className="flex items-center gap-1 text-[#F5F0E6]">
                    <MapPin className="w-3.5 h-3.5 text-gold" />
                    {profile?.city || user?.city || "Chennai"}
                  </span>
                  <span>•</span>
                  <span className="text-blue-300 font-semibold">{profile?.sport || "Cricket"} Head Coach</span>
                  <span>•</span>
                  <span className="text-gold font-semibold">{profile?.yearsOfExperience || 10}+ Yrs Coaching Experience</span>
                </p>
                <div className="flex items-center gap-2 mt-2 flex-wrap justify-center sm:justify-start">
                  {(profile?.certifications || ["BCCI Level-2 Coach", "NIS Certified"]).map((cert, i) => (
                    <span key={i} className="px-2 py-0.5 bg-court-850 border border-blue-500/30 text-[10px] text-blue-200 font-semibold rounded-md">
                      ✓ {cert}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {user?._id && (
                <Link
                  to={`/profile/public/${user._id}`}
                  target="_blank"
                  className="px-4 py-2 bg-court-800 hover:bg-court-750 border border-court-700 hover:border-blue-400/40 text-[#F5F0E6] text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Public Coach Card</span>
                  <ExternalLink className="w-3 h-3 text-[#9B9691]" />
                </Link>
              )}
            </div>
          </div>

          {profile?.bio && (
            <div className="mt-6 pt-4 border-t border-court-750 text-xs text-[#F5F0E6] relative z-10 leading-relaxed italic">
              "{profile.bio}"
            </div>
          )}
        </div>
      )}

      {/* 1B. GROUND OWNER BANNER */}
      {isGroundOwner && (
        <div className="bg-gradient-to-r from-court-950 via-court-900 to-court-950 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden shadow-emerald-500/5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              {/* Ground Owner Avatar */}
              <div className="relative group">
                <div
                  onClick={handlePickPhoto}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-950 border-2 border-emerald-400 flex items-center justify-center text-3xl font-black text-emerald-300 shadow-2xl shadow-emerald-500/20 overflow-hidden cursor-pointer relative"
                  title="Click to change profile picture"
                >
                  {profile?.profilePhoto ? (
                    <img
                      src={profile.profilePhoto}
                      alt={user?.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <Building2 className="w-10 h-10 text-emerald-400" />
                  )}
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                    <Camera className="w-5 h-5 text-emerald-300 mb-0.5" />
                    <span className="text-[9px] font-bold tracking-wider uppercase">Change</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-[#F5F0E6]">
                    {profile?.businessName || user?.name}
                  </h1>
                  <span className="px-2.5 py-0.5 bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-full">
                    PS-VENUE-OWNER
                  </span>
                </div>
                <p className="text-xs text-[#9B9691] mt-1 flex items-center justify-center sm:justify-start gap-3">
                  <span className="text-[#F5F0E6] font-semibold">Owner: {user?.name}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-[#F5F0E6]">
                    <MapPin className="w-3.5 h-3.5 text-gold" />
                    {profile?.city || user?.city || "Chennai"}
                  </span>
                  <span>•</span>
                  <span className="text-emerald-300 font-semibold">📞 {profile?.contactPhone || "+91 98401 23456"}</span>
                </p>
                <div className="flex items-center gap-2 mt-2 flex-wrap justify-center sm:justify-start">
                  <span className="px-2 py-0.5 bg-court-850 border border-emerald-500/30 text-[10px] text-emerald-300 font-semibold rounded-md">
                    ✓ Verified Venue Partner
                  </span>
                  <span className="px-2 py-0.5 bg-court-850 border border-court-700 text-[10px] text-[#9B9691] font-semibold rounded-md">
                    📍 {profile?.address || "Marina Beach Road, Chennai"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {user?._id && (
                <Link
                  to={`/profile/public/${user._id}`}
                  target="_blank"
                  className="px-4 py-2 bg-court-800 hover:bg-court-750 border border-court-700 hover:border-emerald-400/40 text-[#F5F0E6] text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Public Turf Page</span>
                  <ExternalLink className="w-3 h-3 text-[#9B9691]" />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 1C. PLAYER BANNER */}
      {isPlayer && (
        <div className="bg-court-900 border border-court-700 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden shadow-gold/5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              {/* Athlete Avatar */}
              <div className="relative group">
                <div
                  onClick={handlePickPhoto}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-court-800 border-2 border-gold flex items-center justify-center text-3xl font-black text-gold shadow-2xl shadow-gold/20 overflow-hidden cursor-pointer relative"
                  title="Click to change profile picture"
                >
                  {profile?.profilePhoto ? (
                    <img
                      src={profile.profilePhoto}
                      alt={user?.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    user?.name?.charAt(0).toUpperCase()
                  )}
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                    <Camera className="w-5 h-5 text-gold mb-0.5" />
                    <span className="text-[9px] font-bold tracking-wider uppercase">Change</span>
                  </div>
                </div>

                {profile?.profilePhoto && (
                  <button
                    onClick={handleRemovePhoto}
                    disabled={photoUploading}
                    className="absolute -bottom-1 -right-1 p-1.5 bg-court-950 hover:bg-red-500 border border-court-700 hover:border-red-500 rounded-full text-[#9B9691] hover:text-white shadow-lg transition-colors"
                    title="Remove Profile Photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-[#F5F0E6]">{user?.name}</h1>
                  <span className="px-2.5 py-0.5 bg-gold/15 border border-gold/40 text-gold text-xs font-bold rounded-full">
                    {profile?.playerIdNumber || "PS-2026-MEMBER"}
                  </span>
                </div>
                <p className="text-xs text-[#9B9691] mt-1 flex items-center justify-center sm:justify-start gap-3">
                  <span className="flex items-center gap-1 text-[#F5F0E6]">
                    <MapPin className="w-3.5 h-3.5 text-gold" />
                    {profile?.city || user?.city || "Chennai"}
                  </span>
                  <span>•</span>
                  <span className="text-gold font-semibold">{profile?.sport} Specialist</span>
                  <span>•</span>
                  <span className="capitalize text-amber-300 font-semibold">{profile?.skillLevel}</span>
                  <span>•</span>
                  <span className="text-amber-400 font-bold">★ {profile?.rating ? profile.rating.toFixed(1) : "4.8"}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {user?._id && (
                <Link
                  to={`/profile/public/${user._id}`}
                  target="_blank"
                  className="px-4 py-2 bg-court-800 hover:bg-court-750 border border-court-700 hover:border-gold/40 text-[#F5F0E6] text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5 text-gold" />
                  <span>Public Athlete Passport</span>
                  <ExternalLink className="w-3 h-3 text-[#9B9691]" />
                </Link>
              )}
            </div>
          </div>

          {profile?.bio && (
            <div className="mt-6 pt-4 border-t border-court-700 text-xs text-[#F5F0E6] relative z-10 leading-relaxed italic">
              "{profile.bio}"
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ROLE-SPECIFIC TABS NAVIGATION                                          */}
      {/* ========================================================================= */}
      <div className="flex gap-2 border-b border-court-700 pb-4 overflow-x-auto">
        {isCoach && (
          <>
            <button
              onClick={() => setActiveTab("teams")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === "teams"
                  ? "bg-blue-500 text-white shadow-md shadow-blue-500/20 font-black"
                  : "bg-court-900 text-[#9B9691] hover:bg-court-800 hover:text-white border border-court-700"
              }`}
            >
              🛡️ My Teams & Squad Rosters
            </button>
            <button
              onClick={() => setActiveTab("matches")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === "matches"
                  ? "bg-blue-500 text-white shadow-md shadow-blue-500/20 font-black"
                  : "bg-court-900 text-[#9B9691] hover:bg-court-800 hover:text-white border border-court-700"
              }`}
            >
              🏆 Upcoming Matches
            </button>
            <button
              onClick={() => setActiveTab("edit")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === "edit"
                  ? "bg-blue-500 text-white shadow-md shadow-blue-500/20 font-black"
                  : "bg-court-900 text-[#9B9691] hover:bg-court-800 hover:text-white border border-court-700"
              }`}
            >
              ✏️ Edit Coach Profile
            </button>
          </>
        )}

        {isGroundOwner && (
          <>
            <button
              onClick={() => setActiveTab("venues")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === "venues"
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20 font-black"
                  : "bg-court-900 text-[#9B9691] hover:bg-court-800 hover:text-white border border-court-700"
              }`}
            >
              🏟️ My Venues & Facilities
            </button>
            <button
              onClick={() => setActiveTab("reservations")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === "reservations"
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20 font-black"
                  : "bg-court-900 text-[#9B9691] hover:bg-court-800 hover:text-white border border-court-700"
              }`}
            >
              📅 Slot Reservations & Earnings
            </button>
            <button
              onClick={() => setActiveTab("edit")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === "edit"
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20 font-black"
                  : "bg-court-900 text-[#9B9691] hover:bg-court-800 hover:text-white border border-court-700"
              }`}
            >
              ✏️ Edit Business Profile
            </button>
          </>
        )}

        {isPlayer && (
          <>
            <button
              onClick={() => setActiveTab("card")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === "card"
                  ? "bg-gold text-court-950 shadow-md shadow-gold/20 font-black"
                  : "bg-court-900 text-[#9B9691] hover:bg-court-800 hover:text-white border border-court-700"
              }`}
            >
              🪪 Digital Sports Pass
            </button>
            <button
              onClick={() => setActiveTab("edit")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === "edit"
                  ? "bg-gold text-court-950 shadow-md shadow-gold/20 font-black"
                  : "bg-court-900 text-[#9B9691] hover:bg-court-800 hover:text-white border border-court-700"
              }`}
            >
              ✏️ Edit Athlete Details
            </button>
            <button
              onClick={() => setActiveTab("stats")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === "stats"
                  ? "bg-gold text-court-950 shadow-md shadow-gold/20 font-black"
                  : "bg-court-900 text-[#9B9691] hover:bg-court-800 hover:text-white border border-court-700"
              }`}
            >
              📊 Career Stats & Badges
            </button>
          </>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. ROLE-SPECIFIC TAB CONTENTS                                             */}
      {/* ========================================================================= */}

      {/* ----------------- COACH TAB 1: MANAGED TEAMS & ROSTERS ----------------- */}
      {isCoach && activeTab === "teams" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#F5F0E6]">Teams Managed by Coach</h2>
              <p className="text-xs text-[#9B9691]">View full player roster lists and roles</p>
            </div>
            <Link
              to="/teams"
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Squad</span>
            </Link>
          </div>

          <div className="space-y-6">
            {(profile?.managedTeams?.length > 0
              ? profile.managedTeams
              : [
                  {
                    name: "Chennai Super Smashers",
                    sport: "Cricket",
                    city: "Chennai",
                    bio: "Active T20 weekend cricket club based out of Chennai.",
                    members: [
                      { userId: { name: "Lokesh Kumar", email: "demo@playsphere.com" }, role: "captain" },
                      { userId: { name: "Karthik Subramanian", email: "karthik@playsphere.com" }, role: "player" },
                      { userId: { name: "Vikram Sethuraman", email: "vikram@playsphere.com" }, role: "player" },
                    ],
                  },
                  {
                    name: "Kovai Thunderbolts",
                    sport: "Cricket",
                    city: "Coimbatore",
                    bio: "Coimbatore division champions known for aggressive batting lineups.",
                    members: [
                      { userId: { name: "Ananya Ramesh", email: "ananya@playsphere.com" }, role: "captain" },
                      { userId: { name: "Dinesh Kumar", email: "dinesh@playsphere.com" }, role: "player" },
                    ],
                  },
                ]
            ).map((team, idx) => (
              <div key={idx} className="bg-court-900 border border-court-700 rounded-3xl p-6 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-court-750">
                  <div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-blue-400" />
                      <h3 className="text-base font-bold text-white">{team.name}</h3>
                      <span className="px-2 py-0.5 bg-blue-500/15 border border-blue-500/40 text-blue-300 text-[10px] font-bold rounded-full">
                        {team.members?.length || 0} Players
                      </span>
                    </div>
                    <p className="text-xs text-[#9B9691] mt-1">
                      {team.sport} • {team.city} • "{team.bio || "Active sports team"}"
                    </p>
                  </div>

                  <Link
                    to="/teams"
                    className="px-3.5 py-1.5 bg-court-800 hover:bg-court-750 text-[#F5F0E6] text-xs font-semibold rounded-xl border border-court-700 self-start sm:self-auto"
                  >
                    Manage Lineup
                  </Link>
                </div>

                {/* Team Roster Players Table */}
                <div className="mt-4">
                  <h4 className="text-xs font-bold text-[#9B9691] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-400" />
                    <span>Squad Roster Details</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {team.members?.map((m, mIdx) => (
                      <div
                        key={mIdx}
                        className="p-3 bg-court-950 border border-court-800 rounded-xl flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-court-900 border border-blue-500/30 flex items-center justify-center text-xs font-bold text-blue-300">
                            {m.userId?.name?.charAt(0) || "P"}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#F5F0E6] truncate max-w-[120px]">
                              {m.userId?.name || "Player"}
                            </p>
                            <p className="text-[10px] text-[#9B9691] truncate max-w-[120px]">
                              {m.userId?.email || "Athlete"}
                            </p>
                          </div>
                        </div>

                        <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                          m.role === "captain"
                            ? "bg-gold/20 text-gold border border-gold/40"
                            : "bg-court-850 text-[#9B9691] border border-court-700"
                        }`}>
                          {m.role || "Player"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ----------------- COACH TAB 2: UPCOMING MATCHES ----------------- */}
      {isCoach && activeTab === "matches" && (
        <div className="space-y-4 max-w-3xl mx-auto">
          {(profile?.upcomingMatches && profile.upcomingMatches.length > 0
            ? profile.upcomingMatches
            : [
                {
                  team1Id: { name: "Chennai Super Smashers" },
                  team2Id: { name: "Kovai Thunderbolts" },
                  sport: "Cricket",
                  status: "live",
                  scheduledTime: new Date(),
                  liveStatus: "Live Score: Smashers 168/4 (20.0) • Thunderbolts 142/6 (18.2)",
                  venueId: { name: "Chepauk Pavilion Cricket Ground, Chennai" },
                },
                {
                  team1Id: { name: "Chennai Super Smashers" },
                  team2Id: { name: "Rockfort Blasters" },
                  sport: "Cricket",
                  status: "scheduled",
                  scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
                  venueId: { name: "Chepauk Ground, Chennai" },
                },
              ]
          ).map((m, idx) => (
            <div key={idx} className="p-5 bg-court-900 border border-court-700 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2.5 py-0.5 text-xs font-bold rounded-md ${
                  m.status === "live"
                    ? "bg-red-500/20 text-red-400 animate-pulse"
                    : "bg-gold/15 text-gold"
                }`}>
                  {m.status === "live" ? "LIVE MATCH" : "SCHEDULED FIXTURE"}
                </span>
                <span className="text-xs text-[#9B9691]">{m.sport || "Cricket"}</span>
              </div>
              <h3 className="text-base font-bold text-white mt-1">
                {m.team1Id?.name || "Team 1"} vs {m.team2Id?.name || "Team 2"}
              </h3>
              <p className={`text-xs font-semibold mt-1 ${m.status === "live" ? "text-red-300" : "text-gold"}`}>
                {m.status === "live"
                  ? m.liveStatus || "Match in progress"
                  : `Scheduled on ${new Date(m.scheduledTime || Date.now()).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })} at ${new Date(m.scheduledTime || Date.now()).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`}
              </p>
              <p className="text-xs text-[#9B9691] mt-2 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-gold" />
                {m.venueId?.name || m.venue || "Chepauk Pavilion Cricket Ground, Chennai"}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ----------------- GROUND OWNER TAB 1: VENUES ----------------- */}
      {isGroundOwner && activeTab === "venues" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#F5F0E6]">Registered Grounds & Turfs</h2>
              <p className="text-xs text-[#9B9691]">Facilities owned and operated by your organization</p>
            </div>
            <Link
              to="/venues"
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Add New Ground</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {(profile?.managedVenues?.length > 0
              ? profile.managedVenues
              : [
                  {
                    name: "Marina Grand Sports Turf",
                    sportType: "Football",
                    city: "Chennai",
                    address: "54 Kamarajar Salai, Marina Beach Road, Chennai",
                    pricePerHour: 1200,
                    photos: ["https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80"],
                    amenities: ["FIFA AstroTurf", "LED Floodlights", "Bibs & Balls"],
                    rating: 4.9,
                    reviewCount: 56,
                  },
                  {
                    name: "Chepauk Pavilion Cricket Nets & Ground",
                    sportType: "Cricket",
                    city: "Chennai",
                    address: "Victoria Hostel Rd, Chepauk, Chennai",
                    pricePerHour: 800,
                    photos: ["https://images.unsplash.com/photo-1531415074868-036b1c57e329?auto=format&fit=crop&w=800&q=80"],
                    amenities: ["4 Turf Nets", "Bowling Machine", "Sight Screens"],
                    rating: 4.8,
                    reviewCount: 42,
                  },
                ]
            ).map((v, idx) => (
              <div key={idx} className="bg-court-900 border border-court-700 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="h-44 rounded-2xl bg-court-950 overflow-hidden mb-4 relative">
                    <img
                      src={v.photos?.[0] || "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80"}
                      alt={v.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-court-950/90 backdrop-blur-xs border border-emerald-500/40 text-emerald-300 text-[10px] font-bold rounded-lg">
                      {v.sportType}
                    </span>
                    <span className="absolute top-3 right-3 px-2.5 py-1 bg-court-950/90 backdrop-blur-xs border border-gold/40 text-gold text-xs font-black rounded-lg">
                      ₹{v.pricePerHour} / hr
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-1">{v.name}</h3>
                  <p className="text-xs text-[#9B9691] flex items-center gap-1.5 mb-3">
                    <MapPin className="w-3.5 h-3.5 text-gold shrink-0" />
                    {v.address || v.city}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {v.amenities?.map((a, aIdx) => (
                      <span key={aIdx} className="px-2 py-0.5 bg-court-950 text-[10px] text-[#9B9691] rounded-md border border-court-800">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-court-800 flex items-center justify-between">
                  <span className="text-xs text-amber-400 font-bold">
                    ★ {v.rating || 4.8} ({v.reviewCount || 24} reviews)
                  </span>
                  <Link
                    to="/venues"
                    className="px-3 py-1.5 bg-court-800 hover:bg-court-750 text-emerald-400 font-bold rounded-xl text-xs border border-court-700 transition-colors"
                  >
                    Edit Ground Info
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ----------------- GROUND OWNER TAB 2: RESERVATIONS ----------------- */}
      {isGroundOwner && activeTab === "reservations" && (
        <div className="bg-court-900 border border-court-700 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-court-750">
            <div>
              <h2 className="text-lg font-bold text-white">Turf Slot Reservations</h2>
              <p className="text-xs text-[#9B9691]">Recent customer bookings and transaction status</p>
            </div>
            <span className="px-3 py-1 bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-full">
              Live System
            </span>
          </div>

          <div className="space-y-3">
            {(profile?.bookingStats?.recentBookings && profile.bookingStats.recentBookings.length > 0
              ? profile.bookingStats.recentBookings
              : [
                  {
                    userId: { name: "Karthik Subramanian" },
                    venueId: { name: "Marina Grand Sports Turf" },
                    slot: "06:00 PM - 07:00 PM",
                    date: new Date(),
                    totalPrice: 1200,
                    paymentStatus: "paid",
                    paymentId: "UPI-TXN-98401234",
                  },
                  {
                    userId: { name: "Ananya Ramesh" },
                    venueId: { name: "Marina Grand Sports Turf" },
                    slot: "07:00 PM - 08:00 PM",
                    date: new Date(),
                    totalPrice: 1200,
                    paymentStatus: "paid",
                    paymentId: "UPI-TXN-98401235",
                  },
                ]
            ).map((b, bIdx) => (
              <div
                key={bIdx}
                className="p-4 bg-court-950 border border-court-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <span className="text-emerald-400 font-bold block">{b.userId?.name || "Customer Athlete"}</span>
                  <span className="text-[#9B9691]">{b.venueId?.name || "Sports Ground"} • {b.slot || "1-Hour Slot"}</span>
                  <p className="text-[11px] text-gold mt-0.5">
                    {new Date(b.date || Date.now()).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })} • {b.slot || "06:00 PM - 07:00 PM"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg text-[10px] font-bold">
                    {b.paymentStatus === "paid" ? `PAID (₹${b.totalPrice || 1200})` : "CONFIRMED"}
                  </span>
                  <span className="text-[#9B9691] font-mono text-[10px]">{b.paymentId || "UPI-TXN-VERIFIED"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ----------------- PLAYER TAB 1: DIGITAL CARD ----------------- */}
      {isPlayer && activeTab === "card" && (
        <div className="flex flex-col items-center">
          <PlayerIdCard cardData={cardData} playerName={user?.name} />
        </div>
      )}

      {/* ----------------- PLAYER TAB 3: STATS & BADGES ----------------- */}
      {isPlayer && activeTab === "stats" && (
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 bg-court-900 border border-court-700 rounded-2xl text-center">
              <span className="text-3xl font-black text-[#F5F0E6] block">
                {profile?.matchesPlayed || 41}
              </span>
              <span className="text-[11px] font-bold text-[#9B9691] uppercase tracking-wider">
                Matches Played
              </span>
            </div>
            <div className="p-5 bg-court-900 border border-court-700 rounded-2xl text-center">
              <span className="text-3xl font-black text-gold block">{profile?.matchesWon || 33}</span>
              <span className="text-[11px] font-bold text-[#9B9691] uppercase tracking-wider">
                Matches Won
              </span>
            </div>
            <div className="p-5 bg-court-900 border border-court-700 rounded-2xl text-center">
              <span className="text-3xl font-black text-amber-400 block">
                {profile?.rating ? profile.rating.toFixed(1) : "4.8"}
              </span>
              <span className="text-[11px] font-bold text-[#9B9691] uppercase tracking-wider">
                Community Rating
              </span>
            </div>
            <div className="p-5 bg-court-900 border border-court-700 rounded-2xl text-center">
              <span className="text-3xl font-black text-amber-300 block">
                {profile?.badges?.length || 3}
              </span>
              <span className="text-[11px] font-bold text-[#9B9691] uppercase tracking-wider">
                Earned Badges
              </span>
            </div>
          </div>

          <div className="bg-court-900 border border-court-700 rounded-3xl p-6 shadow-xl shadow-gold/5">
            <h3 className="text-sm font-bold text-[#F5F0E6] uppercase tracking-wider mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-gold" />
              <span>Player Badges & Recognitions</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(profile?.badges || ["Verified Athlete", "Early Adopter", "State Finalist"]).map((badge, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-court-950 border border-court-700 rounded-2xl flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold shrink-0">
                    <Star className="w-4 h-4 fill-gold text-gold" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#F5F0E6] text-xs">{badge}</h4>
                    <p className="text-[10px] text-[#9B9691]">Awarded by PlaySphere Tamil Nadu</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ----------------- EDIT PROFILE FORM (ROLE SPECIFIC) ----------------- */}
      {activeTab === "edit" && (
        <div className="bg-court-900 border border-court-700 rounded-3xl p-6 sm:p-8 max-w-2xl mx-auto shadow-xl">
          <h2 className="text-lg font-bold text-[#F5F0E6] mb-1">
            {isCoach
              ? "Edit Coach Profile & Credentials"
              : isGroundOwner
              ? "Edit Sports Ground & Business Details"
              : "Edit Athlete Profile & Sport Preferences"}
          </h2>
          <p className="text-xs text-[#9B9691] mb-6">
            {isCoach
              ? "Update your coaching sport, years of experience, and state certifications."
              : isGroundOwner
              ? "Update your facility name, contact phone, and ground address."
              : "Update your primary sport, skill level, and match availability."}
          </p>

          {saveSuccess && (
            <div className="mb-4 p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Profile details saved successfully!</span>
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-4">
            {/* Common Name */}
            <div>
              <label className="block text-xs font-bold text-[#9B9691] uppercase mb-1">
                {isGroundOwner ? "Owner Full Name" : isCoach ? "Coach Full Name" : "Athlete Full Name"}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-court-950 border border-court-700 text-[#F5F0E6] rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-gold focus:border-gold focus:outline-none"
              />
            </div>

            {/* Coach Specific Fields */}
            {isCoach && (
              <>
                <div>
                  <label className="block text-xs font-bold text-[#9B9691] uppercase mb-1">
                    Primary Coaching Sport
                  </label>
                  <SportSelector
                    value={formData.sport}
                    onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#9B9691] uppercase mb-1">
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={formData.yearsOfExperience}
                      onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                      className="w-full bg-court-950 border border-court-700 text-[#F5F0E6] rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#9B9691] uppercase mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98401 55667"
                      className="w-full bg-court-950 border border-court-700 text-[#F5F0E6] rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#9B9691] uppercase mb-1">
                    Certifications (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.certifications}
                    onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                    placeholder="BCCI Level-2 Coach, NIS Certified"
                    className="w-full bg-court-950 border border-court-700 text-[#F5F0E6] rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </>
            )}

            {/* Ground Owner Specific Fields */}
            {isGroundOwner && (
              <>
                <div>
                  <label className="block text-xs font-bold text-[#9B9691] uppercase mb-1">
                    Business / Arena Name
                  </label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    placeholder="Marina Grand Sports Arena & Turfs"
                    className="w-full bg-court-950 border border-court-700 text-[#F5F0E6] rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#9B9691] uppercase mb-1">
                      Contact Phone Number
                    </label>
                    <input
                      type="text"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      placeholder="+91 98401 23456"
                      className="w-full bg-court-950 border border-court-700 text-[#F5F0E6] rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#9B9691] uppercase mb-1">
                      GST / Tax Number (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.gstNumber}
                      onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                      placeholder="33AAAAA0000A1Z5"
                      className="w-full bg-court-950 border border-court-700 text-[#F5F0E6] rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#9B9691] uppercase mb-1">
                    Facility Ground Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="54 Kamarajar Salai, Marina Beach Road, Chennai"
                    className="w-full bg-court-950 border border-court-700 text-[#F5F0E6] rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </>
            )}

            {/* Player Specific Fields */}
            {isPlayer && (
              <>
                <div>
                  <label className="block text-xs font-bold text-[#9B9691] uppercase mb-1">
                    Primary Sport
                  </label>
                  <SportSelector
                    value={formData.sport}
                    onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#9B9691] uppercase mb-1">
                    Skill Level
                  </label>
                  <select
                    value={formData.skillLevel}
                    onChange={(e) => setFormData({ ...formData, skillLevel: e.target.value })}
                    className="w-full bg-court-950 border border-court-700 text-[#F5F0E6] rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-gold focus:border-gold focus:outline-none cursor-pointer"
                  >
                    <option value="beginner" className="bg-court-900">Beginner</option>
                    <option value="intermediate" className="bg-court-900">Intermediate</option>
                    <option value="advanced" className="bg-court-900">Advanced</option>
                    <option value="pro" className="bg-court-900">Pro / State Level</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#9B9691] uppercase mb-1">
                    Preferred Match Timing
                  </label>
                  <input
                    type="text"
                    value={formData.preferredPlayTime}
                    onChange={(e) => setFormData({ ...formData, preferredPlayTime: e.target.value })}
                    placeholder="e.g. Weekends 6 AM - 9 AM, Weekdays Evenings"
                    className="w-full bg-court-950 border border-court-700 text-[#F5F0E6] rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-gold focus:border-gold focus:outline-none"
                  />
                </div>
              </>
            )}

            {/* Home District */}
            <div>
              <label className="block text-xs font-bold text-[#9B9691] uppercase mb-1">
                Home District (Tamil Nadu)
              </label>
              <DistrictSelector
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                name="city"
                placeholder="Select District..."
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-bold text-[#9B9691] uppercase mb-1">
                Bio & Details
              </label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder={
                  isCoach
                    ? "Tell athletes and teams about your coaching philosophy and track record..."
                    : isGroundOwner
                    ? "Tell sports teams about your turf facilities, night lighting, and amenities..."
                    : "Tell other athletes about your playing style, achievements, or availability..."
                }
                className="w-full bg-court-950 border border-court-700 text-[#F5F0E6] rounded-xl p-3 text-xs focus:ring-2 focus:ring-gold focus:border-gold focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 font-black rounded-xl shadow-lg transition-all disabled:opacity-50 ${
                isCoach
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-blue-500/20"
                  : isGroundOwner
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-emerald-500/20"
                  : "bg-gradient-to-r from-gold via-amber-400 to-gold-hover hover:from-gold-hover hover:to-amber-500 text-court-950 shadow-gold/20"
              }`}
            >
              {loading ? "Saving Changes..." : "Save Profile Details"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;
