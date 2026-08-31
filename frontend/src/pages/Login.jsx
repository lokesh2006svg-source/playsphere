import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Trophy,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  UserCheck,
  Eye,
  EyeOff,
  AlertCircle,
  Crown,
  Building2,
  Medal,
  Check,
  Copy,
  ShieldCheck,
} from "lucide-react";

const DEMO_ROLES = [
  {
    role: "player",
    label: "Athlete / Player",
    email: "ananya@playsphere.com",
    loginId: "PS-2026-00003",
    name: "Ananya Iyer",
    tag: "Badminton Pro • Chennai",
    icon: Medal,
    badgeColor: "bg-gold/15 text-gold border-gold/40",
    borderHover: "hover:border-gold",
  },
  {
    role: "coach",
    label: "Certified Coach",
    email: "coach@playsphere.com",
    loginId: "PS-COACH-001",
    name: "Coach Ramanathan",
    tag: "BCCI Level-2 • Squad Manager",
    icon: UserCheck,
    badgeColor: "bg-blue-500/15 text-blue-400 border-blue-500/40",
    borderHover: "hover:border-blue-500",
  },
  {
    role: "ground_owner",
    label: "Ground & Turf Owner",
    email: "owner@playsphere.com",
    loginId: "PS-VENUE-001",
    name: "S. Vignesh",
    tag: "Marina Grand Sports Arena",
    icon: Building2,
    badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/40",
    borderHover: "hover:border-emerald-500",
  },
  {
    role: "super_admin",
    label: "Super Admin",
    email: "demo@playsphere.com",
    loginId: "PS-ADMIN-001",
    name: "Platform Admin",
    tag: "Security & Venue Control",
    icon: Crown,
    badgeColor: "bg-amber-500/15 text-amber-400 border-amber-500/40",
    borderHover: "hover:border-amber-400",
  },
];

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const from = location.state?.from?.pathname || "/dashboard";

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await login(formData.email, formData.password);
    setLoading(false);

    if (res.success) {
      if (!res.hasCompletedProfile) {
        navigate("/profile/create");
      } else {
        navigate(from === "/login" ? "/dashboard" : from, { replace: true });
      }
    } else {
      if (res.requiresVerification) {
        navigate("/verify-email", {
          state: {
            email: res.email || formData.email,
            devCode: res.devCode || res.devOtp,
            unverifiedNotice: "Your email is not verified yet. A fresh verification code has been generated.",
          },
        });
        return;
      }
      setError(res.message || "Invalid email, login ID, or password.");
    }
  };

  const handleDemoFill = (email, pwd) => {
    setFormData({ email, password: pwd });
    setError("");
  };

  const handleCopy = (text, idKey) => {
    navigator.clipboard.writeText(text);
    setCopiedId(idKey);
    setTimeout(() => setCopiedId(null), 2000);
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
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5F0E6]">Welcome to PlaySphere</h2>
          <p className="text-xs text-[#9B9691] mt-1 max-w-sm mx-auto">
            Log in with your Email Address or Digital Sports Pass ID to enter the arena
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
              Email Address or Login ID
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gold absolute left-3.5 top-3.5" />
              <input
                type="text"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. ananya@playsphere.com or PS-2026-00003"
                className="w-full bg-court-950 border border-court-700 text-[#F5F0E6] rounded-xl pl-10 pr-4 py-2.5 text-xs focus:ring-2 focus:ring-gold focus:border-gold focus:outline-none placeholder:text-[#656C7D]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-[#9B9691] uppercase tracking-wider">
                Password
              </label>
              <span className="text-[10px] text-[#9B9691]">
                Default Demo Password: <strong className="text-gold font-mono">password123</strong>
              </span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-gold absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
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
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-gold via-amber-400 to-gold-hover hover:from-gold-hover hover:to-amber-500 text-court-950 font-black rounded-xl shadow-lg shadow-gold/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            <span>{loading ? "Signing In..." : "Log In to PlaySphere"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* 1-Click Role Login Passports Section */}
        <div className="mt-6 pt-5 border-t border-court-700 relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-gold" />
              <span className="text-xs font-black text-[#F5F0E6] uppercase tracking-wider">
                1-Click Role Login Passports
              </span>
            </div>
            <span className="text-[10px] text-gold font-mono font-bold bg-gold/15 px-2 py-0.5 rounded-full border border-gold/40">
              🔑 password123
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {DEMO_ROLES.map((demo) => {
              const Icon = demo.icon;
              const isSelected = formData.email === demo.email;
              return (
                <div
                  key={demo.role}
                  className={`p-3 bg-court-950 border rounded-2xl transition-all relative ${
                    isSelected
                      ? "border-gold ring-1 ring-gold shadow-md shadow-gold/10"
                      : `border-court-750 ${demo.borderHover}`
                  }`}
                >
                  <div className="flex items-start justify-between gap-1 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className={`p-1.5 rounded-lg border ${demo.badgeColor}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#F5F0E6] leading-tight">
                          {demo.label}
                        </h4>
                        <span className="text-[10px] text-gold font-mono font-bold block">
                          ID: {demo.loginId}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(demo.email, demo.role)}
                      className="p-1 hover:bg-court-800 rounded text-[#9B9691] hover:text-white transition-colors"
                      title="Copy Login Email"
                    >
                      {copiedId === demo.role ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <p className="text-[10px] text-[#9B9691] truncate mb-2">
                    {demo.name} • {demo.tag}
                  </p>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleDemoFill(demo.email, "password123")}
                      className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-black transition-all flex items-center justify-center gap-1 ${
                        isSelected
                          ? "bg-gold text-court-950 shadow-sm shadow-gold/20"
                          : "bg-court-850 hover:bg-gold/20 text-[#F5F0E6] hover:text-gold border border-court-700"
                      }`}
                    >
                      <span>{isSelected ? "✓ Credentials Filled" : "Auto Fill & Login"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-5 text-center text-xs text-[#9B9691] relative z-10">
          Don't have an account yet?{" "}
          <Link to="/signup" className="text-gold font-bold hover:underline">
            Register as Player, Coach, or Ground Owner →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
