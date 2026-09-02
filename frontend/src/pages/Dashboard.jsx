import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  fetchLiveMatches,
  fetchNextMatch,
  fetchTournaments,
  fetchVenues,
} from "../api";
import {
  Users,
  Calendar,
  Trophy,
  Shield,
  Radio,
  BookOpen,
  Building2,
  ArrowRight,
  Sparkles,
  MapPin,
  Clock,
  PlayCircle,
  Crown,
  ShieldCheck,
  Info,
  Medal,
  Briefcase,
  Share2,
  CheckCircle,
  Phone,
  DollarSign,
  PlusCircle,
  Star,
  Activity,
  Ticket,
} from "lucide-react";

const Dashboard = () => {
  const { user, profile } = useAuth();
  const [liveMatches, setLiveMatches] = useState([]);
  const [nextMatch, setNextMatch] = useState(null);
  const [venueCount, setVenueCount] = useState(6);
  const [tournamentCount, setTournamentCount] = useState(3);
  const [loading, setLoading] = useState(true);

  const isSuperAdmin = user?.role === "super_admin" || user?.role === "admin";
  const isVenueAdmin = user?.role === "venue_admin";
  const isAdmin = isSuperAdmin || isVenueAdmin;

  const role = user?.role || "player";
  const isCoach = role === "coach";
  const isGroundOwner = role === "ground_owner";
  const isPlayer = !isCoach && !isGroundOwner;

  useEffect(() => {
    const loadOverview = async () => {
      try {
        setLoading(true);
        const [liveRes, nextRes, venuesRes, tourRes] = await Promise.allSettled([
          fetchLiveMatches(),
          fetchNextMatch(),
          fetchVenues(),
          fetchTournaments(),
        ]);

        if (liveRes.status === "fulfilled" && liveRes.value.data.success) {
          setLiveMatches(liveRes.value.data.matches || []);
        }
        if (nextRes.status === "fulfilled" && nextRes.value.data.success) {
          setNextMatch(nextRes.value.data.match || null);
        }
        if (venuesRes.status === "fulfilled" && venuesRes.value.data.success) {
          setVenueCount(venuesRes.value.data.count || 6);
        }
        if (tourRes.status === "fulfilled" && tourRes.value.data.success) {
          setTournamentCount(tourRes.value.data.count || 3);
        }
      } catch (err) {
        console.warn("Error fetching dashboard overview:", err);
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, []);

  // Dynamic role-based feature cards
  const getFeatureCards = () => {
    if (isGroundOwner) {
      return [
        {
          title: "My Listed Venues & Turfs",
          description: "Manage your registered venues, update court pricing, availability & photos.",
          path: "/venues",
          icon: Building2,
          color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400",
          cta: "Manage My Venues",
        },
        {
          title: "Turf Slot Reservations",
          description: "View real-time player slot bookings, customer contact & revenue tracking.",
          path: "/bookings",
          icon: Clock,
          color: "from-amber-400/20 to-gold/20 border-gold/40 text-gold-light",
          cta: "View Reservations",
        },
        {
          title: "Live Match Feeds",
          description: "Watch live matches hosted across Tamil Nadu grounds and stadiums.",
          path: "/live",
          icon: Radio,
          color: "from-red-500/20 to-rose-500/20 border-red-500/30 text-red-400",
          cta: "Watch Live",
          badge: "LIVE",
        },
        {
          title: "33+ Sports Rules Guide",
          description: "Official ground dimensions, rulebooks, and referee guidelines.",
          path: "/rules",
          icon: BookOpen,
          color: "from-gold/15 to-amber-500/15 border-gold/30 text-gold",
          cta: "Read Rules",
        },
        {
          title: "Official Sports Bodies",
          description: "Directory of recognized State & District sports associations.",
          path: "/official-bodies",
          icon: ShieldCheck,
          color: "from-court-800 to-court-850 border-court-700 text-[#F5F0E6]",
          cta: "View Directory",
        },
        {
          title: "Tournaments & Cups",
          description: "Host knockout leagues and view automated match brackets.",
          path: "/tournaments",
          icon: Trophy,
          color: "from-gold/20 to-yellow-500/20 border-gold/40 text-gold",
          cta: "View Tournaments",
        },
      ];
    }

    if (isCoach) {
      return [
        {
          title: "My Managed Squads & Teams",
          description: "Manage player rosters, assign jersey numbers, and monitor team performance.",
          path: "/teams",
          icon: Shield,
          color: "from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-400",
          cta: "Manage My Teams",
        },
        {
          title: "Create & Register New Squad",
          description: "Form a certified team, invite talented players, and prepare for state leagues.",
          path: "/teams",
          icon: Users,
          color: "from-gold/20 to-amber-500/20 border-gold/30 text-gold",
          cta: "Create Squad",
        },
        {
          title: "Tournaments & Championships",
          description: "Register your squads for upcoming knockout cups and view automated brackets.",
          path: "/tournaments",
          icon: Trophy,
          color: "from-gold/25 to-yellow-500/20 border-gold/50 text-gold",
          cta: "Enter Tournaments",
        },
        {
          title: "Scout Nearby Talent",
          description: "Discover verified local players in your city with skill filters and stats.",
          path: "/players",
          icon: Sparkles,
          color: "from-amber-400/20 to-gold/20 border-gold/40 text-gold-light",
          cta: "Scout Players",
        },
        {
          title: "Book Training Turfs",
          description: "Reserve synthetic turf and grounds for team practice sessions.",
          path: "/venues",
          icon: Calendar,
          color: "from-amber-600/20 to-gold/20 border-amber-500/30 text-amber-300",
          cta: "Book Training Slot",
        },
        {
          title: "33+ Official Sports Rules",
          description: "Official rulebooks, foul clarifications, and coaching guidelines.",
          path: "/rules",
          icon: BookOpen,
          color: "from-gold/15 to-amber-500/15 border-gold/30 text-gold",
          cta: "Explore Rules",
        },
      ];
    }

    // Default: Player Cards
    return [
      {
        title: "Find Nearby Players",
        description: "Discover local athletes in your city with GPS distance matching & skill filters.",
        path: "/players",
        icon: Users,
        color: "from-gold/20 to-amber-500/20 border-gold/30 text-gold",
        cta: "Explore Players",
      },
      {
        title: "Book Courts & Turfs",
        description: "Reserve synthetic turf, badminton courts & grounds with real-time slot booking.",
        path: "/venues",
        icon: Calendar,
        color: "from-amber-400/20 to-gold/20 border-gold/40 text-gold-light",
        cta: "Book a Slot",
      },
      {
        title: "Tournaments & Brackets",
        description: "Register your squad for knockout leagues and view automated match brackets.",
        path: "/tournaments",
        icon: Trophy,
        color: "from-gold/25 to-yellow-500/20 border-gold/50 text-gold",
        cta: "Join Tournaments",
      },
      {
        title: "Teams & Squads",
        description: "Join team rosters with invite codes and participate in championships.",
        path: "/teams",
        icon: Shield,
        color: "from-amber-600/20 to-gold/20 border-amber-500/30 text-amber-300",
        cta: "View Squads",
      },
      {
        title: "Live Scores & Streams",
        description: "Real-time ball-by-ball updates, live YouTube streams, and official match feeds.",
        path: "/live",
        icon: Radio,
        color: "from-red-500/20 to-rose-500/20 border-red-500/30 text-red-400",
        cta: "Watch Live",
        badge: "LIVE NOW",
      },
      {
        title: "33+ Sports Rules Guide",
        description: "Official rulebooks, foul clarifications, and referee guidelines across all sports.",
        path: "/rules",
        icon: BookOpen,
        color: "from-gold/15 to-amber-500/15 border-gold/30 text-gold",
        cta: "Read Rules",
      },
    ];
  };

  const featureCards = getFeatureCards();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 text-[#F5F0E6]">
      {/* ========================================================================= */}
      {/* 1. ROLE-SPECIFIC HERO WELCOME BANNER                                      */}
      {/* ========================================================================= */}

      {/* 1A. COACH HERO BANNER */}
      {isCoach && (
        <div className="bg-gradient-to-br from-court-900 via-blue-950/40 to-court-950 border border-blue-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden shadow-blue-500/10">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/15 border border-blue-500/40 text-blue-300 rounded-full text-xs font-bold">
                <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                <span>Certified Coach Command Center</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-[#F5F0E6] tracking-tight">
                Vanakkam, Coach {user ? user.name.replace("Coach ", "").split(" ")[0] : "Coach"}! 📋
              </h1>

              <p className="text-sm text-[#9B9691] leading-relaxed">
                Managing <strong className="text-[#F5F0E6]">{profile?.sport || "Cricket"}</strong> squads in{" "}
                <strong className="text-[#F5F0E6]">{profile?.city || user?.city || "Chennai"}</strong> with{" "}
                <strong className="text-blue-300">{profile?.yearsOfExperience || 10}+ years</strong> of professional coaching experience. Track team rosters, prepare match lineups, and scout talent.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-3">
                <Link
                  to="/teams"
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-black rounded-xl text-xs shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5"
                >
                  Manage My Teams ({profile?.managedTeams?.length || 2})
                </Link>
                <Link
                  to="/players"
                  className="px-5 py-2.5 bg-court-800 hover:bg-court-750 border border-court-700 hover:border-blue-400/40 text-[#F5F0E6] font-bold rounded-xl text-xs transition-colors"
                >
                  Scout Nearby Athletes
                </Link>
                <Link
                  to="/venues"
                  className="px-5 py-2.5 bg-court-800 hover:bg-court-750 border border-court-700 hover:border-gold/40 text-gold font-bold rounded-xl text-xs transition-colors"
                >
                  Book Training Turf
                </Link>
              </div>
            </div>

            {/* Quick Coach ID Badge */}
            <div className="w-full md:w-auto shrink-0 bg-court-950/90 border border-blue-500/40 rounded-2xl p-4 sm:p-5 flex items-center gap-4 shadow-xl shadow-blue-500/5">
              <div className="w-14 h-14 rounded-2xl bg-blue-950 border-2 border-blue-400 flex items-center justify-center text-xl font-bold text-blue-300 shadow-inner overflow-hidden">
                {profile?.profilePhoto ? (
                  <img
                    src={profile.profilePhoto}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Briefcase className="w-7 h-7 text-blue-400" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-blue-300 font-mono font-bold block">
                    PS-COACH
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-blue-500/20 border border-blue-500/40 text-blue-300 font-bold rounded">
                    OFFICIAL COACH
                  </span>
                </div>
                <h4 className="font-bold text-[#F5F0E6] text-sm">{user?.name}</h4>
                <p className="text-[11px] text-[#9B9691]">
                  {profile?.sport || "Cricket"} Coach • {profile?.yearsOfExperience || 10} Yrs Exp • {profile?.city || user?.city || "Chennai"}
                </p>
                <div className="text-[10px] text-[#9B9691] flex items-center gap-2 mt-1">
                  <span>Squads: <strong className="text-blue-300">{profile?.managedTeams?.length || 2} Active Teams</strong></span>
                  <span>•</span>
                  <span>Phone: <strong className="text-[#F5F0E6]">{profile?.phone || "+91 98401 55667"}</strong></span>
                </div>
                <Link
                  to="/profile"
                  className="text-[10px] font-bold text-blue-400 hover:underline inline-block mt-1"
                >
                  View Coach Profile & Rosters →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1B. GROUND OWNER HERO BANNER */}
      {isGroundOwner && (
        <div className="bg-gradient-to-br from-court-900 via-emerald-950/30 to-court-950 border border-emerald-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden shadow-emerald-500/10">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 rounded-full text-xs font-bold">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified Turf & Sports Ground Partner</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-[#F5F0E6] tracking-tight">
                Vanakkam, {user ? user.name.split(" ")[0] : "Owner"}! 🏟️
              </h1>

              <p className="text-sm text-[#9B9691] leading-relaxed">
                Managing <strong className="text-[#F5F0E6]">{profile?.businessName || "Marina Grand Sports Arena & Turfs"}</strong> in{" "}
                <strong className="text-[#F5F0E6]">{profile?.city || user?.city || "Chennai"}</strong>. Manage your synthetic grounds, set hourly rates, and monitor real-time booking reservations and earnings.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-3">
                <Link
                  to="/venues"
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black rounded-xl text-xs shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5"
                >
                  My Listed Venues ({profile?.managedVenues?.length || 2})
                </Link>
                <Link
                  to="/bookings"
                  className="px-5 py-2.5 bg-court-800 hover:bg-court-750 border border-court-700 hover:border-emerald-400/40 text-[#F5F0E6] font-bold rounded-xl text-xs transition-colors"
                >
                  View Slot Reservations
                </Link>
                <Link
                  to="/venues"
                  className="px-5 py-2.5 bg-court-800 hover:bg-court-750 border border-court-700 hover:border-gold/40 text-gold font-bold rounded-xl text-xs transition-colors"
                >
                  + Add New Ground
                </Link>
              </div>
            </div>

            {/* Quick Venue Owner ID Badge */}
            <div className="w-full md:w-auto shrink-0 bg-court-950/90 border border-emerald-500/40 rounded-2xl p-4 sm:p-5 flex items-center gap-4 shadow-xl shadow-emerald-500/5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-950 border-2 border-emerald-400 flex items-center justify-center text-xl font-bold text-emerald-300 shadow-inner overflow-hidden">
                <Building2 className="w-7 h-7 text-emerald-400" />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-emerald-300 font-mono font-bold block">
                    PS-VENUE-OWNER
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold rounded">
                    VERIFIED PARTNER
                  </span>
                </div>
                <h4 className="font-bold text-[#F5F0E6] text-sm">{profile?.businessName || user?.name}</h4>
                <p className="text-[11px] text-[#9B9691]">
                  Facility Owner: {user?.name} • {profile?.city || user?.city || "Chennai"}
                </p>
                <div className="text-[10px] text-[#9B9691] flex items-center gap-2 mt-1">
                  <span>Venues: <strong className="text-emerald-300">{profile?.managedVenues?.length || 2} Turfs Listed</strong></span>
                  <span>•</span>
                  <span>Contact: <strong className="text-[#F5F0E6]">{profile?.contactPhone || "+91 98401 23456"}</strong></span>
                </div>
                <Link
                  to="/profile"
                  className="text-[10px] font-bold text-emerald-400 hover:underline inline-block mt-1"
                >
                  View Facility Profile & Pricing →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1C. PLAYER / GENERAL ATHLETE HERO BANNER */}
      {isPlayer && (
        <div className="bg-gradient-to-br from-court-900 via-court-850 to-court-950 border border-gold/30 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden shadow-gold/10">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-gold/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/15 border border-gold/40 text-gold-glow rounded-full text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-gold" />
                <span>Tamil Nadu Centralized Sports Arena</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-[#F5F0E6] tracking-tight">
                Vanakkam, {user ? user.name.split(" ")[0] : "Player"}! 👋
              </h1>

              <p className="text-sm text-[#9B9691] leading-relaxed">
                Find nearby players for <strong className="text-[#F5F0E6]">{profile?.sport || "Cricket"}</strong> in{" "}
                <strong className="text-[#F5F0E6]">{profile?.city || user?.city || "Chennai"}</strong>, book top-rated courts, register for state tournaments, or track live matches in real time.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-3">
                <Link
                  to="/players"
                  className="px-5 py-2.5 bg-gradient-to-r from-gold via-amber-400 to-gold-hover hover:from-gold-hover hover:to-amber-500 text-court-950 font-black rounded-xl text-xs shadow-lg shadow-gold/20 transition-all transform hover:-translate-y-0.5"
                >
                  Find Nearby Players
                </Link>
                <Link
                  to="/venues"
                  className="px-5 py-2.5 bg-court-800 hover:bg-court-750 border border-court-700 hover:border-gold/40 text-[#F5F0E6] font-bold rounded-xl text-xs transition-colors"
                >
                  Book a Court
                </Link>
              </div>
            </div>

            {/* Quick Athlete Badge Card */}
            {user && (
              <div className="w-full md:w-auto shrink-0 bg-court-950/90 border border-gold/30 rounded-2xl p-4 sm:p-5 flex items-center gap-4 shadow-xl shadow-gold/5">
                <div className="w-14 h-14 rounded-2xl bg-court-800 border-2 border-gold/60 flex items-center justify-center text-xl font-bold text-gold shadow-inner overflow-hidden">
                  {profile?.profilePhoto ? (
                    <img
                      src={profile.profilePhoto}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-gold font-mono font-bold block">
                      {profile?.playerIdNumber || "PS-MEMBER"}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold rounded">
                      ACTIVE ATHLETE
                    </span>
                  </div>
                  <h4 className="font-bold text-[#F5F0E6] text-sm">{user.name}</h4>
                  <p className="text-[11px] text-[#9B9691]">
                    {profile?.sport || "Multi-Sport"} • <span className="capitalize">{profile?.skillLevel || "Intermediate"}</span> • {profile?.city || user?.city || "Chennai"}
                  </p>
                  <div className="text-[10px] text-[#9B9691] flex items-center gap-2 mt-1">
                    <span>⭐ Rating: <strong className="text-amber-400">{profile?.rating ? profile.rating.toFixed(1) : "4.8"} / 5.0</strong></span>
                    <span>•</span>
                    <span>Won: <strong className="text-gold">{profile?.matchesWon || 0} Matches</strong></span>
                  </div>
                  <Link
                    to="/profile"
                    className="text-[10px] font-bold text-gold hover:underline inline-block mt-1"
                  >
                    View Full Athlete Passport & ID Card →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ROLE-SPECIFIC DETAILED SECTIONS                                        */}
      {/* ========================================================================= */}

      {/* 2A. COACH: MANAGED TEAMS & UPCOMING FIXTURES */}
      {isCoach && (
        <div className="space-y-8 animate-fade-in">
          {/* Managed Teams Section */}
          <div className="bg-court-900 border border-court-700 rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-500/5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-court-750">
              <div>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-400" />
                  <h2 className="text-xl font-black text-[#F5F0E6]">My Managed Teams & Squads</h2>
                </div>
                <p className="text-xs text-[#9B9691] mt-0.5">
                  Rosters, player assignments, and official tournament entries under your supervision
                </p>
              </div>

              <Link
                to="/teams"
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all self-start sm:self-auto"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create New Squad</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {(profile?.managedTeams?.length > 0
                ? profile.managedTeams
                : [
                    {
                      name: "Chennai Super Smashers",
                      sport: "Cricket",
                      city: "Chennai",
                      rosterCount: 3,
                      bio: "Active T20 weekend cricket club based out of Chennai.",
                      stats: { matchesPlayed: 14, matchesWon: 11, matchesLost: 3 },
                    },
                    {
                      name: "Kovai Thunderbolts",
                      sport: "Cricket",
                      city: "Coimbatore",
                      rosterCount: 2,
                      bio: "Coimbatore division champions known for aggressive batting lineups.",
                      stats: { matchesPlayed: 12, matchesWon: 8, matchesLost: 4 },
                    },
                  ]
              ).map((team, idx) => (
                <div
                  key={idx}
                  className="p-5 bg-court-950 border border-blue-500/30 hover:border-blue-400 rounded-2xl flex flex-col justify-between group transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-blue-950 border border-blue-500/40 flex items-center justify-center text-blue-300 font-bold text-lg shadow-sm">
                          {team.logo ? (
                            <img src={team.logo} alt={team.name} className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            <Shield className="w-6 h-6 text-blue-400" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-[#F5F0E6] text-base group-hover:text-blue-300 transition-colors">
                            {team.name}
                          </h3>
                          <p className="text-xs text-[#9B9691] flex items-center gap-2">
                            <span>⚡ {team.sport}</span>
                            <span>•</span>
                            <span>📍 {team.city}</span>
                          </p>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 bg-blue-500/15 border border-blue-500/40 text-blue-300 text-[10px] font-bold rounded-full">
                        {team.rosterCount || team.members?.length || 0} Players Roster
                      </span>
                    </div>

                    <p className="text-xs text-[#9B9691] line-clamp-2 leading-relaxed mb-4 italic">
                      "{team.bio || "Competitive sports squad competing in state divisions."}"
                    </p>

                    {/* Team Record */}
                    <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-court-900 rounded-xl border border-court-800 text-center text-xs mb-4">
                      <div>
                        <span className="text-[10px] text-[#9B9691] block">Played</span>
                        <strong className="text-[#F5F0E6]">{team.stats?.matchesPlayed || 0}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-emerald-400 block">Won</span>
                        <strong className="text-emerald-400">{team.stats?.matchesWon || 0}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-red-400 block">Lost</span>
                        <strong className="text-red-400">{team.stats?.matchesLost || 0}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-court-800 flex items-center justify-between">
                    <Link
                      to="/teams"
                      className="text-xs font-bold text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <span>Manage Squad Roster</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <Link
                      to="/tournaments"
                      className="px-3 py-1 bg-court-850 hover:bg-court-800 border border-court-700 text-[#F5F0E6] text-xs font-semibold rounded-lg transition-colors"
                    >
                      Enter Cup
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Matches for Coach */}
          <div className="bg-court-900 border border-court-700 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-court-750">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-red-400" />
                <h2 className="text-xl font-black text-[#F5F0E6]">Upcoming Team Fixtures</h2>
              </div>
              <Link to="/live" className="text-xs font-bold text-gold hover:underline">
                View All Match Feeds →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-court-950 border border-red-500/30 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-extrabold rounded-md animate-pulse">
                      LIVE MATCH
                    </span>
                    <span className="text-xs text-[#9B9691]">Cricket • State T20</span>
                  </div>
                  <h3 className="font-bold text-white text-base">
                    Chennai Super Smashers vs Kovai Thunderbolts
                  </h3>
                  <p className="text-xs text-red-300 font-medium mt-1">
                    Live • Kovai Thunderbolts require 27 runs from 10 balls
                  </p>
                  <p className="text-[11px] text-[#9B9691] mt-2 flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-gold" />
                    Chepauk Pavilion Cricket Nets & Ground, Chennai
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-court-800 flex justify-end">
                  <Link
                    to="/live"
                    className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-red-600/30 transition-all"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>Watch Match Feed</span>
                  </Link>
                </div>
              </div>

              <div className="p-4 bg-court-950 border border-court-750 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 bg-gold/15 text-gold text-[10px] font-bold rounded-md">
                      SCHEDULED
                    </span>
                    <span className="text-xs text-[#9B9691]">Cricket • Semifinal</span>
                  </div>
                  <h3 className="font-bold text-white text-base">
                    Chennai Super Smashers vs Rockfort Blasters
                  </h3>
                  <p className="text-xs text-gold-glow font-medium mt-1">
                    Scheduled Tomorrow • 04:00 PM IST
                  </p>
                  <p className="text-[11px] text-[#9B9691] mt-2 flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-gold" />
                    Chepauk Stadium, Chennai
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-court-800 flex justify-end">
                  <Link
                    to="/tournaments"
                    className="px-3.5 py-1.5 bg-court-800 hover:bg-court-750 text-[#F5F0E6] font-bold rounded-xl text-xs border border-court-700 transition-colors"
                  >
                    <span>View Tournament Bracket</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2B. GROUND OWNER: MANAGED VENUES & RECENT BOOKINGS */}
      {isGroundOwner && (
        <div className="space-y-8 animate-fade-in">
          {/* Revenue & Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 bg-court-900 border border-emerald-500/30 rounded-2xl text-center">
              <span className="text-3xl font-black text-emerald-400 block">
                {profile?.managedVenues?.length || 2}
              </span>
              <span className="text-[11px] font-bold text-[#9B9691] uppercase tracking-wider">
                Listed Grounds
              </span>
            </div>
            <div className="p-5 bg-court-900 border border-emerald-500/30 rounded-2xl text-center">
              <span className="text-3xl font-black text-[#F5F0E6] block">
                {profile?.bookingStats?.totalBookings || 24}
              </span>
              <span className="text-[11px] font-bold text-[#9B9691] uppercase tracking-wider">
                Total Bookings
              </span>
            </div>
            <div className="p-5 bg-court-900 border border-emerald-500/30 rounded-2xl text-center">
              <span className="text-3xl font-black text-gold block">
                ₹{(profile?.bookingStats?.totalRevenue || 28800).toLocaleString("en-IN")}
              </span>
              <span className="text-[11px] font-bold text-[#9B9691] uppercase tracking-wider">
                Turf Revenue
              </span>
            </div>
            <div className="p-5 bg-court-900 border border-emerald-500/30 rounded-2xl text-center">
              <span className="text-3xl font-black text-amber-300 block">4.9 ★</span>
              <span className="text-[11px] font-bold text-[#9B9691] uppercase tracking-wider">
                Avg Turf Rating
              </span>
            </div>
          </div>

          {/* Managed Venues List */}
          <div className="bg-court-900 border border-court-700 rounded-3xl p-6 sm:p-8 shadow-xl shadow-emerald-500/5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-court-750">
              <div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-xl font-black text-[#F5F0E6]">My Listed Venues & Turfs</h2>
                </div>
                <p className="text-xs text-[#9B9691] mt-0.5">
                  Real-time court availability, slot pricing, and synthetic turf configurations
                </p>
              </div>

              <Link
                to="/venues"
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all self-start sm:self-auto"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ List New Turf</span>
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
                      rating: 4.8,
                      reviewCount: 42,
                    },
                  ]
              ).map((venue, idx) => (
                <div
                  key={idx}
                  className="bg-court-950 border border-emerald-500/30 hover:border-emerald-400 rounded-2xl p-4 flex flex-col justify-between group transition-all"
                >
                  <div className="flex gap-4">
                    <div className="w-24 h-24 rounded-xl bg-court-900 border border-court-700 overflow-hidden shrink-0">
                      <img
                        src={venue.photos?.[0] || "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=400&q=80"}
                        alt={venue.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-300 text-[10px] font-bold rounded-md">
                          {venue.sportType}
                        </span>
                        <span className="text-xs text-amber-400 font-bold">
                          ★ {venue.rating || 4.8} ({venue.reviewCount || 24})
                        </span>
                      </div>
                      <h3 className="font-bold text-[#F5F0E6] text-sm group-hover:text-emerald-300 transition-colors line-clamp-1">
                        {venue.name}
                      </h3>
                      <p className="text-[11px] text-[#9B9691] flex items-center gap-1 line-clamp-1">
                        <MapPin className="w-3 h-3 text-gold shrink-0" />
                        {venue.address || venue.city}
                      </p>
                      <p className="text-xs font-black text-gold">
                        ₹{venue.pricePerHour} <span className="text-[10px] text-[#9B9691] font-normal">/ hour slot</span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-court-800 flex items-center justify-between">
                    <Link
                      to="/bookings"
                      className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>View Slot Bookings</span>
                    </Link>
                    <Link
                      to="/venues"
                      className="px-3 py-1 bg-court-850 hover:bg-court-800 text-[#F5F0E6] text-xs font-semibold rounded-lg border border-court-700 transition-colors"
                    >
                      Edit Ground Info
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2C. PLAYER: STATS & DISCOVERY OVERVIEW */}
      {isPlayer && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-in">
          <div className="p-5 bg-court-900 border border-gold/30 rounded-2xl text-center">
            <span className="text-3xl font-black text-[#F5F0E6] block">
              {profile?.matchesPlayed || 41}
            </span>
            <span className="text-[11px] font-bold text-[#9B9691] uppercase tracking-wider">
              Matches Played
            </span>
          </div>
          <div className="p-5 bg-court-900 border border-gold/30 rounded-2xl text-center">
            <span className="text-3xl font-black text-gold block">
              {profile?.matchesWon || 33}
            </span>
            <span className="text-[11px] font-bold text-[#9B9691] uppercase tracking-wider">
              Matches Won
            </span>
          </div>
          <div className="p-5 bg-court-900 border border-gold/30 rounded-2xl text-center">
            <span className="text-3xl font-black text-amber-400 block">
              {profile?.rating ? profile.rating.toFixed(1) : "4.8"} ★
            </span>
            <span className="text-[11px] font-bold text-[#9B9691] uppercase tracking-wider">
              Athlete Rating
            </span>
          </div>
          <div className="p-5 bg-court-900 border border-gold/30 rounded-2xl text-center">
            <span className="text-3xl font-black text-emerald-400 block">
              {tournamentCount}
            </span>
            <span className="text-[11px] font-bold text-[#9B9691] uppercase tracking-wider">
              Active Tournaments
            </span>
          </div>
        </div>
      )}

      {/* Featured Live Match Alert (For Players & Owners if live match exists) */}
      {!isCoach && liveMatches.length > 0 && (
        <div className="bg-gradient-to-r from-red-950/40 via-court-900 to-red-950/40 border border-red-500/40 rounded-3xl p-6 shadow-xl relative overflow-hidden animate-glow">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-500/20 rounded-2xl text-red-400">
                <Radio className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-red-500 text-white font-extrabold text-[10px] rounded-md tracking-wider">
                    LIVE MATCH
                  </span>
                  <span className="text-xs font-bold text-slate-300">{liveMatches[0].sport}</span>
                </div>
                <h3 className="text-lg font-black text-white mt-0.5">
                  {liveMatches[0].team1Id?.name} vs {liveMatches[0].team2Id?.name}
                </h3>
                <p className="text-xs text-red-300 font-semibold">{liveMatches[0].liveStatus}</p>
              </div>
            </div>

            <Link
              to={`/matches/${liveMatches[0]._id}`}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all shrink-0"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Watch & Track Score</span>
            </Link>
          </div>
        </div>
      )}

      {/* Dedicated Admin Operations Banner (For Admins Only) */}
      {isAdmin && (
        <div
          className={`p-6 sm:p-7 rounded-3xl border shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 ${
            isSuperAdmin
              ? "bg-gradient-to-r from-amber-950/40 via-court-900 to-amber-950/30 border-gold/50 shadow-gold/15"
              : "bg-gradient-to-r from-court-900 via-court-850 to-court-900 border-amber-500/40 shadow-amber-500/10"
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${
                isSuperAdmin
                  ? "bg-gold/20 text-gold-glow border-gold/50 shadow-[0_0_12px_rgba(240,185,11,0.25)]"
                  : "bg-amber-500/20 text-amber-300 border-amber-500/40"
              }`}
            >
              {isSuperAdmin ? <Crown className="w-7 h-7 text-gold-glow" /> : <ShieldCheck className="w-7 h-7 text-amber-400" />}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                    isSuperAdmin
                      ? "bg-gold/20 text-gold-glow border-gold/50 shadow-sm shadow-gold/20"
                      : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  }`}
                >
                  {isSuperAdmin ? "Super Admin Active" : "Venue Admin Active"}
                </span>
                <span className="text-xs text-[#9B9691]">• Elevated Control Center</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-[#F5F0E6]">
                {isSuperAdmin
                  ? "Platform Operations & Security Center"
                  : "Manage Sports Venues & Live Match Fixtures"}
              </h2>
              <p className="text-xs text-[#9B9691] mt-1 max-w-xl">
                {isSuperAdmin
                  ? "Full access to user permissions, security audit logs, venue catalogs, and live tournament feeds."
                  : "Create and update local turf facilities, configure match streams, and broadcast live scores."}
              </p>
            </div>
          </div>

          <Link
            to="/admin"
            className={`px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2 shadow-lg transition-all transform hover:-translate-y-0.5 shrink-0 ${
              isSuperAdmin
                ? "bg-gradient-to-r from-gold to-amber-500 hover:from-gold-hover hover:to-amber-600 text-court-950 shadow-gold/25"
                : "bg-amber-400 hover:bg-amber-300 text-court-950 shadow-amber-400/25"
            }`}
          >
            <span>Open Admin Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. PLATFORM MODULES & FEATURE GRID                                        */}
      {/* ========================================================================= */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#F5F0E6]">
              {isCoach
                ? "Coach Tools & Resources"
                : isGroundOwner
                ? "Facility Owner Operations"
                : "Platform Modules & Features"}
            </h2>
            <p className="text-xs text-[#9B9691] mt-0.5">
              {isCoach
                ? "Everything you need to manage your squad, scout players, and win cups"
                : isGroundOwner
                ? "Tools to monetize your sports ground and manage real-time reservations"
                : "Everything you need to organize, compete, and connect"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featureCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.title}
                to={card.path}
                className="group relative bg-court-900 border border-court-700 rounded-3xl p-6 shadow-lg hover:border-gold/50 transition-all duration-200 flex flex-col justify-between hover:-translate-y-1 hover:shadow-gold/10"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.color} border flex items-center justify-center shadow-md`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    {card.badge && (
                      <span className="px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-bold rounded-md animate-pulse">
                        {card.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-[#F5F0E6] group-hover:text-gold transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs text-[#9B9691] mt-1.5 leading-relaxed">
                    {card.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-court-700 flex items-center justify-between text-xs font-bold text-gold">
                  <span>{card.cta}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Role Comparison & Access Note */}
      <div className="bg-court-900/80 border border-court-700 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-gold/15 border border-gold/30 rounded-2xl text-gold shrink-0 mt-0.5 sm:mt-0">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-[#F5F0E6] text-sm flex items-center gap-2">
              <span>PlaySphere Role Context</span>
              {user && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isSuperAdmin 
                    ? "bg-gold/20 text-gold-glow border-gold/50" 
                    : isCoach
                    ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                    : isGroundOwner
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : "bg-court-800 text-[#9B9691] border-court-700"
                }`}>
                  Current Role: {user.role ? user.role.replace("_", " ").toUpperCase() : "PLAYER"}
                </span>
              )}
            </h4>
            <p className="text-[#9B9691] mt-1 leading-relaxed">
              {isCoach && "You are viewing the Coach Command Portal. You can register teams, manage squad rosters, and prepare tournament lineups."}
              {isGroundOwner && "You are viewing the Ground Owner Facility Portal. You can manage synthetic turfs, set hourly pricing, and view reservations."}
              {isPlayer && "You are viewing the Athlete Portal. You can find nearby players, book turf slots, and register for state championships."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
