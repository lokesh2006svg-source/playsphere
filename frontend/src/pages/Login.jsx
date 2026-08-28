import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Trophy, Mail, Lock, ArrowRight, Sparkles, UserCheck } from "lucide-react";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      setError(res.message || "Invalid email or password.");
    }
  };

  const handleDemoFill = (email, pwd) => {
    setFormData({ email, password: pwd });
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
          <h2 className="text-2xl font-extrabold text-[#F5F0E6]">Welcome Back</h2>
          <p className="text-xs text-[#9B9691] mt-1">
            Access your sports passport, court bookings & live matches
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
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
                placeholder="demo@playsphere.com"
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
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-court-950 border border-court-700 text-[#F5F0E6] rounded-xl pl-10 pr-4 py-2.5 text-xs focus:ring-2 focus:ring-gold focus:border-gold focus:outline-none placeholder:text-[#656C7D]"
              />
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

        {/* 1-Click Quick Demo Accounts */}
        <div className="mt-6 pt-4 border-t border-court-700 relative z-10">
          <span className="text-[11px] font-bold text-[#9B9691] uppercase tracking-wider block text-center mb-2.5">
            Quick Demo Login (1-Click)
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoFill("demo@playsphere.com", "PlaySphere@Admin2026")}
              className="px-3 py-2 bg-court-800 hover:bg-court-750 text-[#F5F0E6] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-court-700 hover:border-gold/40 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-gold" />
              <span>Admin / Lokesh</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill("ananya@playsphere.com", "password123")}
              className="px-3 py-2 bg-court-800 hover:bg-court-750 text-[#F5F0E6] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-court-700 hover:border-gold/40 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-action" />
              <span>Ananya (Player)</span>
            </button>
          </div>
        </div>

        <div className="mt-5 text-center text-xs text-[#9B9691] relative z-10">
          Don't have an account?{" "}
          <Link to="/signup" className="text-gold font-bold hover:underline">
            Create One
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
