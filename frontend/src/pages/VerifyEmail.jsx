import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { verifyEmail, resendVerificationCode } from "../api";
import { useAuth } from "../context/AuthContext";
import {
  Mail,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  KeyRound,
  Sparkles,
} from "lucide-react";
import confetti from "canvas-confetti";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuthSession } = useAuth();

  // Extract email from navigation state or URL query params
  const queryParams = new URLSearchParams(location.search);
  const initialEmail = location.state?.email || queryParams.get("email") || "";
  const initialNotice = location.state?.unverifiedNotice || "";
  // TEMPORARY: Code shown on-screen for testing since email sending isn't configured. Remove this before production and rely on real email delivery only.
  const initialDevCode = location.state?.devCode || location.state?.devOtp || queryParams.get("code") || "";

  const [email, setEmail] = useState(initialEmail);
  const [isEditingEmail, setIsEditingEmail] = useState(!initialEmail);
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [devCode, setDevCode] = useState(initialDevCode);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60); // 60s cooldown
  const [resendSuccess, setResendSuccess] = useState("");
  const [error, setError] = useState("");
  const [isExpired, setIsExpired] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  const inputRefs = useRef([]);

  // Resend Countdown Timer
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Focus on first input box on mount
  useEffect(() => {
    if (inputRefs.current[0] && !isEditingEmail) {
      inputRefs.current[0].focus();
    }
  }, [isEditingEmail]);

  // Handle single digit input
  const handleDigitChange = (index, value) => {
    const cleanVal = value.replace(/[^0-9]/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = cleanVal;
    setDigits(newDigits);
    setError("");

    // Auto-advance to next input
    if (cleanVal && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle backspace navigation
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      if (inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus();
      }
    }
  };

  // Handle paste for full 6-digit code
  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim().replace(/[^0-9]/g, "").slice(0, 6);
    if (!pasteData) return;

    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasteData[i] || "";
    }
    setDigits(newDigits);
    setError("");

    const focusIndex = Math.min(pasteData.length, 5);
    if (inputRefs.current[focusIndex]) {
      inputRefs.current[focusIndex].focus();
    }
  };

  const getFullCode = () => digits.join("");

  // Submit Verification Code
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const code = getFullCode();

    if (!email) {
      setError("Please enter your registered email address.");
      return;
    }

    if (code.length < 6) {
      setError("Please enter all 6 digits of your verification code.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setIsExpired(false);

      const res = await verifyEmail({
        email: email.trim(),
        code,
      });

      if (res.data.success) {
        setVerificationSuccess(true);

        setAuthSession({
          token: res.data.token,
          user: res.data.user,
          profile: res.data.profile,
        });

        try {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 },
            colors: ["#D4AF37", "#F0B90B", "#F5F0E6", "#10B981"],
          });
        } catch {}

        setTimeout(() => {
          if (!res.data.user?.hasCompletedProfile) {
            navigate("/profile/create");
          } else {
            navigate("/dashboard");
          }
        }, 1500);
      }
    } catch (err) {
      const errRes = err.response?.data;
      setError(errRes?.message || "Invalid or expired verification code.");
      if (errRes?.isExpired) {
        setIsExpired(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // Resend 6-Digit Verification Code
  const handleResend = async () => {
    if (resendCooldown > 0 || resending) return;
    if (!email) {
      setError("Please specify your email address to resend the code.");
      return;
    }

    try {
      setResending(true);
      setError("");
      setResendSuccess("");

      const res = await resendVerificationCode({ email: email.trim() });
      if (res.data.success) {
        setResendSuccess("A fresh 6-digit code was sent! Check your inbox.");
        const newDevCode = res.data.devCode || res.data.devOtp;
        if (newDevCode) {
          setDevCode(newDevCode);
        }
        setResendCooldown(60);
        setDigits(["", "", "", "", "", ""]);
        if (inputRefs.current[0]) inputRefs.current[0].focus();
        setTimeout(() => setResendSuccess(""), 5000);
      }
    } catch (err) {
      const errRes = err.response?.data;
      setError(errRes?.message || "Failed to resend code. Please try again.");
      if (errRes?.retryAfterSeconds) {
        setResendCooldown(errRes.retryAfterSeconds);
      }
    } finally {
      setResending(false);
    }
  };

  const handleAutoFillDevOtp = (otp) => {
    if (!otp) return;
    const cleanOtp = String(otp).trim();
    if (cleanOtp.length === 6) {
      const chars = cleanOtp.split("");
      setDigits(chars);
      if (inputRefs.current[5]) inputRefs.current[5].focus();
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 bg-court-950 animate-fade-in">
      <div className="w-full max-w-md bg-court-900 border border-court-700 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden shadow-gold/10">
        {/* Glow Accents */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-gold/15 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-amber-500/15 rounded-full blur-2xl pointer-events-none"></div>

        {/* Back link */}
        <Link
          to="/signup"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9B9691] hover:text-[#F5F0E6] transition-colors mb-4 relative z-10"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-gold" />
          <span>Back to Signup</span>
        </Link>

        {/* Header */}
        <div className="text-center mb-6 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gold/15 text-gold border border-gold/30 mx-auto flex items-center justify-center shadow-lg shadow-gold/20 mb-3">
            <ShieldCheck className="w-8 h-8 text-gold" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#F5F0E6]">Verify Your Email</h2>
          <p className="text-xs text-[#9B9691] mt-1.5 leading-relaxed">
            We've sent a 6-digit confirmation code to:
          </p>

          {/* Email Pill / Editor */}
          <div className="mt-2 flex items-center justify-center gap-2">
            {!isEditingEmail ? (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-court-950 border border-court-700 rounded-full text-xs font-bold text-gold">
                <Mail className="w-3.5 h-3.5 text-gold" />
                <span className="max-w-[220px] truncate">{email || "your email"}</span>
                <button
                  type="button"
                  onClick={() => setIsEditingEmail(true)}
                  className="text-[10px] text-[#9B9691] hover:text-white underline ml-1"
                >
                  Edit
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 w-full">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="athlete@playsphere.com"
                  className="flex-1 bg-court-950 border border-court-700 text-[#F5F0E6] rounded-xl px-3 py-1.5 text-xs focus:ring-2 focus:ring-gold focus:border-gold focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setIsEditingEmail(false)}
                  className="px-3 py-1.5 bg-court-800 hover:bg-court-750 text-[#F5F0E6] text-xs font-bold rounded-xl border border-court-700"
                >
                  Set
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Notices & Alerts */}
        {initialNotice && !error && !resendSuccess && (
          <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs font-medium flex items-center gap-2 relative z-10">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{initialNotice}</span>
          </div>
        )}

        {resendSuccess && (
          <div className="mb-4 p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2 relative z-10 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{resendSuccess}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold flex items-start gap-2 relative z-10">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{error}</span>
              {isExpired && (
                <button
                  type="button"
                  onClick={handleResend}
                  className="block text-gold underline mt-1 font-bold"
                >
                  Click here to resend a new code now
                </button>
              )}
            </div>
          </div>
        )}

        {/* Verification Success View */}
        {verificationSuccess ? (
          <div className="p-6 bg-court-950 border border-gold/40 rounded-2xl text-center space-y-3 relative z-10 animate-fade-in shadow-inner">
            <div className="w-12 h-12 rounded-full bg-gold/20 text-gold border border-gold/40 flex items-center justify-center mx-auto shadow-md shadow-gold/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-[#F5F0E6]">Email Verified! 🏆</h3>
            <p className="text-xs text-[#9B9691]">
              Welcome to PlaySphere. Redirecting to your digital athlete profile setup...
            </p>
            <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mt-2"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {/* TEMPORARY: Code shown on-screen for testing since email sending isn't configured. Remove this before production and rely on real email delivery only. */}
            {devCode && (
              <div className="p-4 bg-amber-500/20 border-2 border-amber-500/60 rounded-2xl text-amber-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-amber-500/10 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/30 text-amber-300 flex items-center justify-center shrink-0 border border-amber-500/50 shadow-inner">
                    <KeyRound className="w-5 h-5 text-amber-300 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 block">
                      DEV MODE: Your code is
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-white text-xs font-semibold">Verification Code:</span>
                      <span className="font-mono font-black text-amber-300 text-lg tracking-widest bg-court-950 px-2.5 py-0.5 rounded-lg border border-amber-500/50">
                        {devCode}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleAutoFillDevOtp(devCode)}
                  className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-gold via-amber-400 to-gold-hover hover:from-gold-hover hover:to-amber-500 text-court-950 font-black text-xs rounded-xl shadow-md transition-all shrink-0 text-center transform hover:scale-105"
                >
                  Auto-Fill Code
                </button>
              </div>
            )}

            {/* 6-Digit Boxes Input */}
            <div>
              <label className="block text-xs font-bold text-[#9B9691] uppercase tracking-wider text-center mb-3">
                Enter 6-Digit Code
              </label>
              <div className="flex items-center justify-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
                {digits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className={`w-11 h-13 sm:w-12 sm:h-14 bg-court-950 border rounded-2xl text-center text-xl sm:text-2xl font-black text-[#F5F0E6] focus:outline-none transition-all ${
                      digit
                        ? "border-gold shadow-md shadow-gold/20 bg-court-950 text-gold"
                        : "border-court-700 hover:border-court-600 focus:border-gold focus:ring-2 focus:ring-gold/30"
                    }`}
                  />
                ))}
              </div>
              <p className="text-[11px] text-[#656C7D] text-center mt-2.5">
                ⏱️ Code valid for 10 minutes. Check spam/junk folder if not found.
              </p>

              {/* Terminal Console Indicator */}
              <div className="mt-3 p-2.5 bg-court-950/80 border border-court-700 rounded-xl text-center text-[11px] text-[#9B9691] flex items-center justify-center gap-2">
                <KeyRound className="w-3.5 h-3.5 text-gold shrink-0" />
                <span>Verification code is also printed in your <strong>backend terminal console</strong>.</span>
              </div>
            </div>

            {/* Verify Action Button */}
            <button
              type="submit"
              disabled={loading || getFullCode().length < 6}
              className="w-full py-3.5 bg-gradient-to-r from-gold via-amber-400 to-gold-hover hover:from-gold-hover hover:to-amber-500 text-court-950 font-black rounded-xl shadow-xl shadow-gold/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-40 flex items-center justify-center gap-2 text-xs"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify Email & Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Resend Section with Countdown */}
            <div className="pt-3 border-t border-court-700 text-center text-xs text-[#9B9691] flex flex-col items-center gap-1.5">
              <span>Didn't receive the verification code?</span>
              {resendCooldown > 0 ? (
                <span className="text-[11px] text-[#656C7D] font-medium">
                  Resend available in <strong className="text-amber-400 font-mono">{resendCooldown}s</strong>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="text-gold hover:underline font-bold flex items-center gap-1 text-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resending ? "animate-spin" : ""}`} />
                  <span>{resending ? "Sending New Code..." : "Resend 6-Digit Code"}</span>
                </button>
              )}
            </div>
          </form>
        )}

        {/* Footer Note */}
        <div className="mt-6 pt-4 border-t border-court-700 text-center text-[11px] text-[#656C7D] relative z-10">
          Already verified?{" "}
          <Link to="/login" className="text-gold font-bold hover:underline">
            Log In Directly
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
