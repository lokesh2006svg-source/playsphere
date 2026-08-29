import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Trophy, Mail, Lock, User, MapPin, ArrowRight, ShieldCheck, Eye, EyeOff, AlertCircle } from "lucide-react";

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

const Signup = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    city: "Chennai",
    location: "Chennai, Tamil Nadu",
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

    setLoading(true);
    const res = await register(formData);
    setLoading(false);

    if (res.success) {
      if (!res.hasCompletedProfile) {
        navigate("/profile/create");
      } else {
        navigate("/dashboard");
      }
    } else {
      setError(res.message || "Failed to create account.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 bg-court-950">
      <div className="w-full max-w-md bg-court-900 border border-court-700 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden shadow-gold/10">
        {/* Glow accents */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-gold/15 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-amber-500/15 rounded-full blur-2xl pointer-events-none"></div>

        <div className="text-center mb-6 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-court-950 p-1 border border-gold/40 mx-auto flex items-center justify-center shadow-lg shadow-gold/20 mb-3 overflow-hidden">
            <img src="/logo.png" alt="PlaySphere Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#F5F0E6]">Join PlaySphere</h2>
          <p className="text-xs text-[#9B9691] mt-1">
            Create your account to unlock nearby players, court bookings & live scoring
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3.5 bg-red-500/15 border border-red-500/40 rounded-xl text-red-300 text-xs font-semibold flex items-start gap-2.5 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-semibold text-[#9B9691] uppercase tracking-wider mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gold absolute left-3.5 top-3.5" />
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Lokesh Kumar"
                className="w-full bg-court-950 border border-court-700 text-[#F5F0E6] rounded-xl pl-10 pr-4 py-2.5 text-xs focus:ring-2 focus:ring-gold focus:border-gold focus:outline-none placeholder:text-[#656C7D]"
              />
            </div>
          </div>

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
              <div className="mt-2.5 p-3 bg-court-950 border border-court-700 rounded-xl space-y-1.5 animate-fade-in text-[11px]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#9B9691] block mb-1">
                  Password Strength Requirements:
                </span>
                <div className="grid grid-cols-2 gap-1.5">
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

          <div>
            <label className="block text-xs font-semibold text-[#9B9691] uppercase tracking-wider mb-1">
              Primary City (Tamil Nadu)
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-gold absolute left-3.5 top-3.5" />
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full bg-court-950 border border-court-700 text-[#F5F0E6] rounded-xl pl-10 pr-4 py-2.5 text-xs focus:ring-2 focus:ring-gold focus:border-gold focus:outline-none cursor-pointer"
              >
                {TAMIL_NADU_CITIES.map((c) => (
                  <option key={c} value={c} className="bg-court-900 text-[#F5F0E6]">
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-gold via-amber-400 to-gold-hover hover:from-gold-hover hover:to-amber-500 text-court-950 font-black rounded-xl shadow-lg shadow-gold/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            <span>{loading ? "Creating Athlete Account..." : "Create Account & Get Sports Pass"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-court-700 text-center text-xs text-[#9B9691] relative z-10">
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
