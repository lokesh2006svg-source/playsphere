import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DistrictSelector from "../components/DistrictSelector";
import {
  Trophy,
  Mail,
  Lock,
  User,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  Building2,
  Phone,
  Briefcase,
  Medal,
  Sparkles,
} from "lucide-react";

const TAMIL_NADU_CITIES = [
  "Chennai",
  "Coimbatore",
  "Madurai",
  "Trichy",
  "Salem",
  "Tirunelveli",
  "Erode",
  "Vellore",
  "Thanjavur",
  "Dindigul",
];

const SPORTS_LIST = [
  "Cricket",
  "Football",
  "Badminton",
  "Basketball",
  "Tennis",
  "Volleyball",
  "Kabaddi",
  "Table Tennis",
];

const ACCOUNT_TYPES = [
  {
    id: "player",
    label: "Player",
    tagline: "Join teams, book courts & compete",
    icon: Medal,
    color: "from-gold/20 to-amber-500/20 border-gold text-gold",
  },
  {
    id: "ground_owner",
    label: "Ground Owner",
    tagline: "List, manage & monetize venues",
    icon: Building2,
    color: "from-emerald-500/20 to-teal-500/20 border-emerald-500 text-emerald-400",
  },
  {
    id: "coach",
    label: "Coach",
    tagline: "Create teams & manage rosters",
    icon: Briefcase,
    color: "from-blue-500/20 to-indigo-500/20 border-blue-500 text-blue-400",
  },
];

const Signup = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [accountType, setAccountType] = useState("player");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    city: "Chennai",
    location: "Chennai, Tamil Nadu",
    sport: "Cricket",
    businessName: "",
    contactPhone: "",
    yearsOfExperience: 3,
    bio: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "city" ? { location: `${value}, Tamil Nadu` } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (accountType === "ground_owner" && !formData.businessName.trim()) {
      setError("Please provide your Sports Venue / Business Name.");
      return;
    }

    if (accountType === "ground_owner" && !formData.contactPhone.trim()) {
      setError("Please provide a contact phone number for venue inquiries.");
      return;
    }

    setLoading(true);
    const res = await register({
      ...formData,
      accountType,
      role: accountType,
    });
    setLoading(false);

    if (res.success) {
      if (accountType === "ground_owner") {
        navigate("/venues");
      } else {
        navigate("/dashboard");
      }
    } else {
      setError(res.message || "Failed to create account.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 bg-court-950">
      <div className="w-full max-w-lg bg-court-900 border border-court-700 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden shadow-gold/10">
        {/* Glow accents */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-gold/15 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-amber-500/15 rounded-full blur-2xl pointer-events-none"></div>

        <div className="text-center mb-6 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-court-950 p-1 border border-gold/40 mx-auto flex items-center justify-center shadow-lg shadow-gold/20 mb-3 overflow-hidden">
            <img src="/logo.png" alt="PlaySphere Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#F5F0E6]">Join PlaySphere</h2>
          <p className="text-xs text-[#9B9691] mt-1">
            Choose your account role to unlock customized tools across Tamil Nadu
          </p>
        </div>

        {/* 3-Role Selector Cards */}
        <div className="mb-5 relative z-10">
          <label className="block text-[11px] font-bold text-[#9B9691] uppercase tracking-wider mb-2 text-center">
            Select Account Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            {ACCOUNT_TYPES.map((type) => {
              const Icon = type.icon;
              const isSelected = accountType === type.id;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setAccountType(type.id)}
                  className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                    isSelected
                      ? `bg-court-950 ${type.color} ring-2 ring-gold/40 shadow-lg`
                      : "bg-court-950/60 border-court-750 text-[#9B9691] hover:border-court-600 hover:text-[#F5F0E6]"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isSelected ? "" : "text-[#656C7D]"}`} />
                  <div>
                    <span className="text-xs font-black block leading-tight">{type.label}</span>
                    <span className="text-[9px] opacity-75 hidden sm:block mt-0.5 line-clamp-1">
                      {type.tagline}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3.5 bg-red-500/15 border border-red-500/40 rounded-xl text-red-300 text-xs font-semibold flex items-start gap-2.5 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 relative z-10">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-[#9B9691] uppercase tracking-wider mb-1">
              {accountType === "ground_owner" ? "Owner / Representative Name" : "Full Name"}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gold absolute left-3.5 top-3.5" />
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder={accountType === "coach" ? "Coach S. Ramesh" : "e.g. Lokesh Kumar"}
                className="w-full bg-court-950 border border-court-700 text-[#F5F0E6] rounded-xl pl-10 pr-4 py-2.5 text-xs focus:ring-2 focus:ring-gold focus:border-gold focus:outline-none placeholder:text-[#656C7D]"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-[#9B9691] uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gold absolute left-3.5 top-3.5" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="athlete@playsphere.com"
                className="w-full bg-court-950 border border-court-700 text-[#F5F0E6] rounded-xl pl-10 pr-4 py-2.5 text-xs focus:ring-2 focus:ring-gold focus:border-gold focus:outline-none placeholder:text-[#656C7D]"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-[#9B9691] uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gold absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Must include 8+ chars, uppercase, number & symbol"
                className="w-full bg-court-950 border border-court-700 text-[#F5F0E6] rounded-xl pl-10 pr-10 py-2.5 text-xs focus:ring-2 focus:ring-gold focus:border-gold focus:outline-none placeholder:text-[#656C7D]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-[#9B9691] hover:text-gold transition-colors focus:outline-none"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Live Password Requirements Checklist */}
            {formData.password.length > 0 && (
              <div className="mt-2 p-2.5 bg-court-950 border border-court-700 rounded-xl space-y-1 animate-fade-in text-[10px]">
                <div className="grid grid-cols-2 gap-1">
                  <span className={`flex items-center gap-1.5 ${formData.password.length >= 8 ? "text-gold font-bold" : "text-[#656C7D]"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${formData.password.length >= 8 ? "bg-gold" : "bg-court-700"}`}></span>
                    8+ Characters
                  </span>
                  <span className={`flex items-center gap-1.5 ${/[A-Z]/.test(formData.password) ? "text-gold font-bold" : "text-[#656C7D]"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${/[A-Z]/.test(formData.password) ? "bg-gold" : "bg-court-700"}`}></span>
                    1+ Uppercase (A-Z)
                  </span>
                  <span className={`flex items-center gap-1.5 ${/\d/.test(formData.password) ? "text-gold font-bold" : "text-[#656C7D]"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${/\d/.test(formData.password) ? "bg-gold" : "bg-court-700"}`}></span>
                    1+ Number (0-9)
                  </span>
                  <span className={`flex items-center gap-1.5 ${/[@$!%*?&#^()_+=\-[\]{};:'",.<>/?\\|]/.test(formData.password) ? "text-gold font-bold" : "text-[#656C7D]"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${/[@$!%*?&#^()_+=\-[\]{};:'",.<>/?\\|]/.test(formData.password) ? "bg-gold" : "bg-court-700"}`}></span>
                    1+ Special Char
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Role Specific Fields: Ground Owner */}
          {accountType === "ground_owner" && (
            <div className="space-y-3.5 animate-fade-in pt-1">
              <div>
                <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                  Venue / Business Name
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    name="businessName"
                    required
                    value={formData.businessName}
                    onChange={handleChange}
                    placeholder="e.g. Marina Arena Turfs & Sports Club"
                    className="w-full bg-court-950 border border-court-700 text-[#F5F0E6] rounded-xl pl-10 pr-4 py-2.5 text-xs focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 focus:outline-none placeholder:text-[#656C7D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                  Contact Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    name="contactPhone"
                    required
                    value={formData.contactPhone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="w-full bg-court-950 border border-court-700 text-[#F5F0E6] rounded-xl pl-10 pr-4 py-2.5 text-xs focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 focus:outline-none placeholder:text-[#656C7D]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Role Specific Fields: Coach or Player (Sport Selection) */}
          {(accountType === "player" || accountType === "coach") && (
            <div>
              <label className="block text-xs font-semibold text-[#9B9691] uppercase tracking-wider mb-1">
                Primary Sport
              </label>
              <div className="relative">
                <Trophy className="w-4 h-4 text-gold absolute left-3.5 top-3.5" />
                <select
                  name="sport"
                  value={formData.sport}
                  onChange={handleChange}
                  className="w-full bg-court-950 border border-court-700 text-[#F5F0E6] rounded-xl pl-10 pr-4 py-2.5 text-xs focus:ring-2 focus:ring-gold focus:border-gold focus:outline-none cursor-pointer"
                >
                  {SPORTS_LIST.map((s) => (
                    <option key={s} value={s} className="bg-court-900 text-[#F5F0E6]">
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Role Specific Fields: Coach (Experience) */}
          {accountType === "coach" && (
            <div className="animate-fade-in pt-1">
              <label className="block text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
                Coaching Experience (Years)
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-blue-400 absolute left-3.5 top-3.5" />
                <input
                  type="number"
                  min="0"
                  max="50"
                  name="yearsOfExperience"
                  value={formData.yearsOfExperience}
                  onChange={handleChange}
                  placeholder="e.g. 5"
                  className="w-full bg-court-950 border border-court-700 text-[#F5F0E6] rounded-xl pl-10 pr-4 py-2.5 text-xs focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Primary City / District */}
          <div>
            <label className="block text-xs font-semibold text-[#9B9691] uppercase tracking-wider mb-1">
              Primary District (Tamil Nadu)
            </label>
            <DistrictSelector
              value={formData.city}
              onChange={handleChange}
              name="city"
              placeholder="Select Home District..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-gold via-amber-400 to-gold-hover hover:from-gold-hover hover:to-amber-500 text-court-950 font-black rounded-xl shadow-lg shadow-gold/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2 mt-3"
          >
            <span>
              {loading
                ? "Creating Account..."
                : accountType === "ground_owner"
                ? "Register as Ground Owner"
                : accountType === "coach"
                ? "Register as Certified Coach"
                : "Create Player Account & Sports Pass"}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-[#9B9691] relative z-10">
          Already have an account?{" "}
          <Link to="/login" className="text-gold font-bold hover:underline">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
