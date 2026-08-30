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
} from "lucide-react";
import { Link } from "react-router-dom";

const Profile = () => {
  const { user, profile, updateProfileData, updateProfilePhotoState } = useAuth();
  const [activeTab, setActiveTab] = useState("card"); // 'card' | 'edit' | 'stats'
  const [cardData, setCardData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
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
    phone: profile?.phone || "",
    preferredPlayTime: profile?.preferredPlayTime || "Evenings (5 PM - 8 PM)",
    profilePhoto: profile?.profilePhoto || "",
  });

  useEffect(() => {
    setFormData({
      name: user?.name || "",
      sport: profile?.sport || "Cricket",
      skillLevel: profile?.skillLevel || "intermediate",
      city: profile?.city || user?.city || "Chennai",
      bio: profile?.bio || "",
      phone: profile?.phone || "",
      preferredPlayTime: profile?.preferredPlayTime || "Evenings (5 PM - 8 PM)",
      profilePhoto: profile?.profilePhoto || "",
    });
  }, [profile, user]);

  useEffect(() => {
    if (user?._id) {
      fetchPlayerCard(user._id)
        .then((res) => {
          if (res.data.success) {
            setCardData(res.data.card);
          }
        })
        .catch((err) => console.warn(err));
    }
  }, [user, profile]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSaveSuccess(false);

    const res = await updateProfileData(formData);
    setLoading(false);

    if (res.success) {
      setSaveSuccess(true);
      setIsEditing(false);
      if (user?._id) {
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

        if (user?._id) {
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
        if (user?._id) {
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

      {/* Profile Overview Banner */}
      <div className="bg-court-900 border border-court-700 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden shadow-gold/5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            {/* Avatar with Camera Icon Overlay */}
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

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                  <Camera className="w-5 h-5 text-gold mb-0.5" />
                  <span className="text-[9px] font-bold tracking-wider uppercase">Change</span>
                </div>
              </div>

              {/* Remove Photo Action Trigger if photo set */}
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
                  {profile?.playerIdNumber || "PS-MEMBER"}
                </span>
              </div>
              <p className="text-xs text-[#9B9691] mt-1 flex items-center justify-center sm:justify-start gap-3">
                <span className="flex items-center gap-1 text-[#F5F0E6]">
                  <MapPin className="w-3.5 h-3.5 text-gold" />
                  {profile?.city || user?.city}
                </span>
                <span>•</span>
                <span className="text-gold font-semibold">{profile?.sport} Specialist</span>
                <span>•</span>
                <span className="capitalize text-amber-300 font-semibold">{profile?.skillLevel}</span>
              </p>
              <button
                onClick={handlePickPhoto}
                className="mt-2 text-[11px] font-bold text-gold hover:underline inline-flex items-center gap-1 sm:hidden"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Upload New Picture</span>
              </button>
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
                <span>View Public Profile</span>
                <ExternalLink className="w-3 h-3 text-[#9B9691]" />
              </Link>
            )}
          </div>
        </div>

        {/* Bio */}
        {profile?.bio && (
          <div className="mt-6 pt-4 border-t border-court-700 text-xs text-[#F5F0E6] relative z-10 leading-relaxed italic">
            "{profile.bio}"
          </div>
        )}
      </div>

      {/* Circular Image Crop & Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-court-900 border border-court-700 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center relative text-[#F5F0E6] shadow-gold/10">
            <button
              onClick={handleCancelPreview}
              className="absolute top-5 right-5 text-[#9B9691] hover:text-white p-1 rounded-xl hover:bg-court-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-[#F5F0E6] mb-1">Preview Profile Picture</h3>
            <p className="text-xs text-[#9B9691] mb-6">
              Confirm how your photo will appear across your ID Card and player listings
            </p>

            {/* Circular Preview Container */}
            <div className="w-36 h-36 mx-auto rounded-full overflow-hidden border-4 border-gold shadow-2xl shadow-gold/20 relative mb-6 bg-court-950">
              <img
                src={previewUrl}
                alt="Upload Preview"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="text-[11px] text-[#9B9691] mb-6 bg-court-950 p-2.5 rounded-xl border border-court-700 truncate">
              {selectedFile?.name} ({(selectedFile?.size / (1024 * 1024)).toFixed(2)} MB)
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCancelPreview}
                disabled={photoUploading}
                className="flex-1 py-2.5 bg-court-800 hover:bg-court-750 border border-court-700 text-[#F5F0E6] font-bold rounded-xl text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmUpload}
                disabled={photoUploading}
                className="flex-1 py-2.5 bg-gradient-to-r from-gold via-amber-400 to-gold-hover hover:from-gold-hover hover:to-amber-500 text-court-950 font-black rounded-xl text-xs shadow-lg shadow-gold/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {photoUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Save Photo</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-court-700 pb-4 mb-8">
        <button
          onClick={() => setActiveTab("card")}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "card"
              ? "bg-gold text-court-950 shadow-md shadow-gold/20 font-black"
              : "bg-court-900 text-[#9B9691] hover:bg-court-800 hover:text-white border border-court-700"
          }`}
        >
          🪪 Digital Sports Pass
        </button>
        <button
          onClick={() => setActiveTab("edit")}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "edit"
              ? "bg-gold text-court-950 shadow-md shadow-gold/20 font-black"
              : "bg-court-900 text-[#9B9691] hover:bg-court-800 hover:text-white border border-court-700"
          }`}
        >
          ✏️ Edit Athlete Details
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "stats"
              ? "bg-gold text-court-950 shadow-md shadow-gold/20 font-black"
              : "bg-court-900 text-[#9B9691] hover:bg-court-800 hover:text-white border border-court-700"
          }`}
        >
          📊 Career Stats & Badges
        </button>
      </div>

      {/* Tab 1: Digital Sports Card */}
      {activeTab === "card" && (
        <div className="flex flex-col items-center">
          <PlayerIdCard cardData={cardData} playerName={user?.name} />
        </div>
      )}

      {/* Tab 2: Edit Profile Form */}
      {activeTab === "edit" && (
        <div className="bg-court-900 border border-court-700 rounded-3xl p-6 sm:p-8 max-w-2xl mx-auto shadow-xl shadow-gold/5">
          <h2 className="text-lg font-bold text-[#F5F0E6] mb-4">Edit Profile & Sport Preferences</h2>

          {saveSuccess && (
            <div className="mb-4 p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Profile saved successfully!</span>
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#9B9691] uppercase mb-1">
                Athlete Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your full name"
                className="w-full bg-court-950 border border-court-700 text-[#F5F0E6] rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-gold focus:border-gold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#9B9691] uppercase mb-1">
                Primary Sport
              </label>
              <SportSelector
                value={formData.sport}
                onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  Home District (Tamil Nadu)
                </label>
                <DistrictSelector
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  name="city"
                  placeholder="Select District..."
                />
              </div>
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

            <div>
              <label className="block text-xs font-bold text-[#9B9691] uppercase mb-1">
                Bio & Player Profile
              </label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell other athletes about your playing style, achievements, or availability..."
                className="w-full bg-court-950 border border-court-700 text-[#F5F0E6] rounded-xl p-3 text-xs focus:ring-2 focus:ring-gold focus:border-gold focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-gold via-amber-400 to-gold-hover hover:from-gold-hover hover:to-amber-500 text-court-950 font-black rounded-xl shadow-lg shadow-gold/20 transition-all disabled:opacity-50"
            >
              {loading ? "Saving Changes..." : "Save Athlete Profile"}
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Stats & Badges */}
      {activeTab === "stats" && (
        <div className="space-y-6 max-w-3xl mx-auto">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 bg-court-900 border border-court-700 rounded-2xl text-center">
              <span className="text-3xl font-black text-[#F5F0E6] block">
                {profile?.matchesPlayed || 0}
              </span>
              <span className="text-[11px] font-bold text-[#9B9691] uppercase tracking-wider">
                Matches Played
              </span>
            </div>
            <div className="p-5 bg-court-900 border border-court-700 rounded-2xl text-center">
              <span className="text-3xl font-black text-gold block">{profile?.matchesWon || 0}</span>
              <span className="text-[11px] font-bold text-[#9B9691] uppercase tracking-wider">
                Matches Won
              </span>
            </div>
            <div className="p-5 bg-court-900 border border-court-700 rounded-2xl text-center">
              <span className="text-3xl font-black text-amber-400 block">
                {profile?.rating ? profile.rating.toFixed(1) : "4.5"}
              </span>
              <span className="text-[11px] font-bold text-[#9B9691] uppercase tracking-wider">
                Community Rating
              </span>
            </div>
            <div className="p-5 bg-court-900 border border-court-700 rounded-2xl text-center">
              <span className="text-3xl font-black text-amber-300 block">
                {profile?.badges?.length || 2}
              </span>
              <span className="text-[11px] font-bold text-[#9B9691] uppercase tracking-wider">
                Earned Badges
              </span>
            </div>
          </div>

          {/* Badges Section */}
          <div className="bg-court-900 border border-court-700 rounded-3xl p-6 shadow-xl shadow-gold/5">
            <h3 className="text-sm font-bold text-[#F5F0E6] uppercase tracking-wider mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-gold" />
              <span>Player Badges & Recognitions</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(profile?.badges || ["Verified Athlete", "Early Adopter"]).map((badge, idx) => (
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
    </div>
  );
};

export default Profile;
