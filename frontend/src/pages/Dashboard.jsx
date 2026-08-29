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
  HelpCircle,
  Info,
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
    if (user?.role === "ground_owner") {
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
          title: "List a New Turf / Court",
          description: "Add a new synthetic turf, tennis court, or cricket ground to PlaySphere.",
          path: "/venues",
          icon: Calendar,
          color: "from-gold/20 to-amber-500/20 border-gold/30 text-gold",
          cta: "Add New Ground",
        },
        {
          title: "Turf Slot Reservations",
          description: "View real-time player slot bookings, revenue & confirmed time slots.",
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
      ];
    }

    if (user?.role === "coach") {
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Hero Welcome Banner */}
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
              Vanakkam, {user ? user.name.split(" ")[0] : "Athlete"}! 👋
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
                <span className="text-[10px] text-gold font-mono font-bold block">
                  {profile?.playerIdNumber || "PS-MEMBER"}
                </span>
                <h4 className="font-bold text-[#F5F0E6] text-sm">{user.name}</h4>
                <p className="text-[11px] text-[#9B9691]">
                  {profile?.sport || "Multi-Sport"} • {profile?.skillLevel || "Intermediate"}
                </p>
                <Link
                  to="/profile"
                  className="text-[10px] font-bold text-gold hover:underline inline-block mt-1"
                >
                  View Digital Sports Pass →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Featured Live Match Alert (if any live match) */}
      {liveMatches.length > 0 && (
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

      {/* Main Navigation Feature Grid (Player-Focused) */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#F5F0E6]">Platform Modules & Features</h2>
            <p className="text-xs text-[#9B9691] mt-0.5">
              Everything you need to organize, compete, and connect
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
              <span>PlaySphere Role Permissions</span>
              {user && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isSuperAdmin 
                    ? "bg-gold/20 text-gold-glow border-gold/50" 
                    : isVenueAdmin 
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40" 
                    : "bg-court-800 text-[#9B9691] border-court-700"
                }`}>
                  Your Role: {isSuperAdmin ? "Super Admin" : isVenueAdmin ? "Venue Admin" : "Player"}
                </span>
              )}
            </h4>
            <p className="text-[#9B9691] mt-1 leading-relaxed">
              <strong className="text-[#F5F0E6]">Players</strong> can book venues, join squads, register for cups, and view live matches.{" "}
              <strong className="text-[#F5F0E6]">Admins</strong> can additionally create venues, schedule live broadcast fixtures, view audit logs, and manage platform data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
