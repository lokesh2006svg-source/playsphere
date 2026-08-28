import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchInviteDetails, redeemInvite } from "../api";
import { useAuth } from "../context/AuthContext";
import {
  Trophy,
  Users,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  User,
  Mail,
  Lock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import confetti from "canvas-confetti";

const JoinInvite = () => {
  const { inviteCode } = useParams();
  const { register } = useAuth();
  const navigate = useNavigate();

  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    city: "Chennai",
    location: "Chennai, Tamil Nadu",
  });
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState("");

  // Password rules validation
  const hasMinLength = formData.password.length >= 8;
  const hasUppercase = /[A-Z]/.test(formData.password);
  const hasNumber = /\d/.test(formData.password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password);
  const isPasswordStrong = hasMinLength && hasUppercase && hasNumber && hasSpecial;

  useEffect(() => {
    const loadInvite = async () => {
      try {
        setLoading(true);
        const res = await fetchInviteDetails(inviteCode);
        if (res.data.success) {
          setInvite(res.data.invite);
          setFormData((prev) => ({
            ...prev,
            city: res.data.invite.city || "Chennai",
            location: `${res.data.invite.city || "Chennai"}, Tamil Nadu`,
          }));
        }
      } catch (err) {
        setError("This invite link is invalid or has expired.");
      } finally {
        setLoading(false);
      }
    };

    if (inviteCode) loadInvite();
  }, [inviteCode]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setSignupError("");

    if (!isPasswordStrong) {
      setSignupError("Please create a password that meets all security requirements.");
      return;
    }

    try {
      setSignupLoading(true);
      const res = await register(formData);
      if (res.success) {
        await redeemInvite(inviteCode).catch(() => {});

        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#D4AF37", "#F0B90B", "#F5F0E6"],
          });
        } catch {}

        if (!res.hasCompletedProfile) {
          navigate("/profile/create");
        } else {
          navigate("/dashboard");
        }
      } else {
        setSignupError(res.message || "Failed to create account.");
      }
    } catch (err) {
      setSignupError("Registration failed.");
    } finally {
      setSignupLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-[#9B9691]">
        <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-medium">Validating Squad Invite...</p>
      </div>
    );
  }

  if (error || !invite) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-court-900 border border-court-700 rounded-3xl text-center text-[#F5F0E6]">
        <h3 className="text-lg font-bold mb-2">Invalid Invite Link</h3>
        <p className="text-xs text-[#9B9691] mb-6">{error || "This invite code does not exist."}</p>
        <Link
          to="/"
          className="inline-block px-5 py-2.5 bg-gradient-to-r from-gold to-amber-500 text-court-950 font-black rounded-xl text-xs shadow-md shadow-gold/20"
        >
          Go to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 bg-court-950 text-[#F5F0E6]">
      <div className="w-full max-w-md bg-court-900 border border-court-700 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden shadow-gold/10">
        {/* Glow */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-gold/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* Inviter Greeting */}
        <div className="text-center mb-6 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gold/15 border border-gold/30 mx-auto flex items-center justify-center text-gold mb-3 shadow-lg shadow-gold/20">
            <Users className="w-7 h-7" />
          </div>

          <span className="px-2.5 py-0.5 bg-gold/15 text-gold-glow border border-gold/30 rounded-full text-[10px] font-bold uppercase tracking-wider">
            Special Community Invite
          </span>

          <h2 className="text-2xl font-extrabold text-[#F5F0E6] mt-2">
            {invite.inviterName} invited you!
          </h2>

          <p className="text-xs text-[#9B9691] mt-1">
            Join the <strong className="text-gold">{invite.sport}</strong> network in{" "}
            <strong className="text-[#F5F0E6]">{invite.city}</strong>
          </p>
        </div>

        {signupError && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold">
            {signupError}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-semibold text-[#9B9691] uppercase mb-1">
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
                placeholder="e.g. Rahul Sundaram"
                className="w-full bg-court-950 border border-court-700 text-[#F5F0E6] rounded-xl pl-10 pr-4 py-2.5 text-xs focus:ring-2 focus:ring-gold focus:border-gold focus:outline-none placeholder:text-[#656C7D]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#9B9691] uppercase mb-1">
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
            <label className="block text-xs font-semibold text-[#9B9691] uppercase mb-1">
              Create Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gold absolute left-3.5 top-3.5" />
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 8 characters (Uppercase, Number, Symbol)"
                className="w-full bg-court-950 border border-court-700 text-[#F5F0E6] rounded-xl pl-10 pr-4 py-2.5 text-xs focus:ring-2 focus:ring-gold focus:border-gold focus:outline-none placeholder:text-[#656C7D]"
              />
            </div>

            {/* Password security checklist */}
            {formData.password && (
              <div className="mt-2.5 p-3 bg-court-950 border border-court-700 rounded-xl space-y-1.5 animate-fade-in text-[11px]">
                <div className={`flex items-center gap-1.5 ${hasMinLength ? "text-emerald-400 font-semibold" : "text-[#656C7D]"}`}>
                  {hasMinLength ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  <span>At least 8 characters</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasUppercase ? "text-emerald-400 font-semibold" : "text-[#656C7D]"}`}>
                  {hasUppercase ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  <span>At least 1 uppercase letter (A-Z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasNumber ? "text-emerald-400 font-semibold" : "text-[#656C7D]"}`}>
                  {hasNumber ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  <span>At least 1 number (0-9)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasSpecial ? "text-emerald-400 font-semibold" : "text-[#656C7D]"}`}>
                  {hasSpecial ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  <span>At least 1 special character (!@#$%^&*)</span>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 bg-court-950 border border-court-700 rounded-2xl flex items-center justify-between text-xs text-[#9B9691]">
            <span>Invite Code:</span>
            <span className="font-mono text-gold font-bold">{invite.inviteCode}</span>
          </div>

          <button
            type="submit"
            disabled={signupLoading || !isPasswordStrong}
            className="w-full py-3 bg-gradient-to-r from-gold via-amber-400 to-gold-hover hover:from-gold-hover hover:to-amber-500 text-court-950 font-black rounded-xl shadow-lg shadow-gold/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span>{signupLoading ? "Joining Arena..." : "Accept Invite & Create Account"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-[#9B9691]">
          Already have an account?{" "}
          <Link to="/login" className="text-gold font-bold hover:underline">
            Log In Directly
          </Link>
        </div>
      </div>
    </div>
  );
};

export default JoinInvite;
