import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  fetchAdminOverview,
  fetchPlatformStats,
  fetchAdminVenues,
  createAdminVenue,
  updateAdminVenue,
  deleteAdminVenue,
  fetchAdminMatches,
  createAdminMatch,
  updateAdminMatch,
  deleteAdminMatch,
  fetchAdminUsers,
  updateUserRole,
  deleteAdminUser,
  fetchBrokenStreamLinks,
  fetchTeams,
  fetchSyncStatus,
  triggerSyncNow,
  fetchAuditLogs,
} from "../api";
import SportSelector from "../components/SportSelector";
import {
  ShieldAlert,
  ShieldCheck,
  Crown,
  Building2,
  Trophy,
  Calendar,
  Users,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Radio,
  Play,
  RefreshCw,
  Search,
  ExternalLink,
  MapPin,
  Clock,
  DollarSign,
  AlertCircle,
  X,
  Video,
  Tv,
  BarChart3,
  Link as LinkIcon,
  Shield,
  Activity,
  UserCheck,
  UserX,
  Sparkles,
  Lock,
  Key,
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
];

const CITY_COORDS = {
  Chennai: { lat: 13.0827, lng: 80.2707 },
  Coimbatore: { lat: 11.0168, lng: 76.9558 },
  Madurai: { lat: 9.9252, lng: 78.1198 },
  Trichy: { lat: 10.7905, lng: 78.7047 },
  Salem: { lat: 11.6643, lng: 78.146 },
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Role identification
  const isSuperAdmin = user?.role === "super_admin" || user?.role === "admin";
  const isVenueAdmin = user?.role === "venue_admin";
  const isAdmin = isSuperAdmin || isVenueAdmin;

  const [activeTab, setActiveTab] = useState("venues"); // 'venues' | 'matches' | 'streams' | 'sync' | 'users' | 'stats' | 'security'
  const [overview, setOverview] = useState(null);
  const [platformStats, setPlatformStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Audit Logs state (Super Admin only)
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditFilter, setAuditFilter] = useState({ action: "All", search: "" });
  const [auditLoading, setAuditLoading] = useState(false);

  // Super Admin Password Confirmation (Re-auth) Modal
  const [reauthModal, setReauthModal] = useState({
    isOpen: false,
    title: "",
    description: "",
    adminPassword: "",
    error: "",
    onConfirm: null,
  });

  // Venues state
  const [venues, setVenues] = useState([]);
  const [venueFilter, setVenueFilter] = useState({ city: "All", sport: "All", search: "" });
  const [venueModalOpen, setVenueModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const [venueForm, setVenueForm] = useState({
    name: "",
    sportType: "Cricket",
    city: "Chennai",
    address: "",
    lat: 13.0827,
    lng: 80.2707,
    venueType: "private_turf",
    pricePerHour: 800,
    openingTime: "06:00",
    closingTime: "22:00",
    photos: "",
    amenities: "Floodlights, Parking, Changing Room, First Aid",
    contactPhone: "+91 98765 43210",
    isActive: true,
  });

  // Matches state
  const [matches, setMatches] = useState([]);
  const [teamsList, setTeamsList] = useState([]);
  const [matchFilter, setMatchFilter] = useState({ status: "All", sport: "All", search: "" });
  const [matchModalOpen, setMatchModalOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);
  const [matchForm, setMatchForm] = useState({
    title: "",
    sport: "Cricket",
    team1Id: "",
    team2Id: "",
    venueId: "",
    scheduledTime: new Date().toISOString().slice(0, 16),
    status: "scheduled",
    liveStatus: "Scheduled Fixture",
    liveStreamUrl: "",
    team1Score: "0",
    team2Score: "0",
    commentary: "",
  });

  // Users state (Super Admin only)
  const [usersList, setUsersList] = useState([]);
  const [userFilter, setUserFilter] = useState({ role: "All", search: "" });

  // Streams health state
  const [streamHealthList, setStreamHealthList] = useState([]);

  // Sync state
  const [syncStatus, setSyncStatus] = useState(null);

  useEffect(() => {
    if (isAdmin) {
      loadInitialData();
    }
  }, [user]);

  useEffect(() => {
    if (isSuperAdmin && activeTab === "security") {
      loadAuditLogs();
    }
  }, [activeTab, auditFilter]);

  const loadAuditLogs = async () => {
    try {
      setAuditLoading(true);
      const res = await fetchAuditLogs({
        limit: 50,
        action: auditFilter.action !== "All" ? auditFilter.action : undefined,
        search: auditFilter.search || undefined,
      });
      if (res.data.success) {
        setAuditLogs(res.data.logs || []);
      }
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setAuditLoading(false);
    }
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [overviewRes, venuesRes, matchesRes, teamsRes] = await Promise.all([
        fetchAdminOverview().catch(() => ({ data: { stats: null } })),
        fetchAdminVenues(),
        fetchAdminMatches(),
        fetchTeams().catch(() => ({ data: { teams: [] } })),
      ]);

      if (overviewRes.data?.stats) setOverview(overviewRes.data.stats);
      if (venuesRes.data?.venues) setVenues(venuesRes.data.venues);
      if (matchesRes.data?.matches) setMatches(matchesRes.data.matches);
      if (teamsRes.data?.teams) setTeamsList(teamsRes.data.teams);

      // Load Super Admin resources
      if (isSuperAdmin) {
        const [usersRes, statsRes, auditRes] = await Promise.all([
          fetchAdminUsers().catch(() => ({ data: { users: [] } })),
          fetchPlatformStats().catch(() => ({ data: { stats: null } })),
          fetchAuditLogs({ limit: 50 }).catch(() => ({ data: { logs: [] } })),
        ]);
        if (usersRes.data?.users) setUsersList(usersRes.data.users);
        if (statsRes.data?.stats) setPlatformStats(statsRes.data.stats);
        if (auditRes.data?.logs) setAuditLogs(auditRes.data.logs);
      }

      // Load Stream links health and sync logs
      const [streamRes, syncRes] = await Promise.all([
        fetchBrokenStreamLinks().catch(() => ({ data: { streams: [] } })),
        fetchSyncStatus().catch(() => ({ data: null })),
      ]);
      if (streamRes.data?.streams) setStreamHealthList(streamRes.data.streams);
      if (syncRes.data) setSyncStatus(syncRes.data);
    } catch (err) {
      console.error("Failed to load admin data:", err);
      setMessage({ text: "Failed to load dashboard data.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const showToast = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 4000);
  };

  // ================= VENUE ACTIONS =================

  const handleOpenVenueModal = (venue = null) => {
    if (venue) {
      setEditingVenue(venue);
      setVenueForm({
        name: venue.name || "",
        sportType: venue.sportType || "Cricket",
        city: venue.city || "Chennai",
        address: venue.address || "",
        lat: venue.location?.coordinates?.[1] || 13.0827,
        lng: venue.location?.coordinates?.[0] || 80.2707,
        venueType: venue.venueType || "private_turf",
        pricePerHour: venue.pricePerHour || 800,
        openingTime: venue.openingTime || "06:00",
        closingTime: venue.closingTime || "22:00",
        photos: venue.photos?.join(", ") || "",
        amenities: venue.amenities?.join(", ") || "",
        contactPhone: venue.contactPhone || "+91 98765 43210",
        isActive: venue.isActive !== undefined ? venue.isActive : true,
      });
    } else {
      setEditingVenue(null);
      setVenueForm({
        name: "",
        sportType: "Cricket",
        city: "Chennai",
        address: "",
        lat: 13.0827,
        lng: 80.2707,
        venueType: "private_turf",
        pricePerHour: 800,
        openingTime: "06:00",
        closingTime: "22:00",
        photos: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800",
        amenities: "Floodlights, Parking, Changing Room, First Aid",
        contactPhone: "+91 98765 43210",
        isActive: true,
      });
    }
    setVenueModalOpen(true);
  };

  const handleSaveVenue = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const payload = {
        ...venueForm,
        photos: venueForm.photos
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean),
        amenities: venueForm.amenities
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean),
        coordinates: [Number(venueForm.lng), Number(venueForm.lat)],
      };

      if (editingVenue) {
        const res = await updateAdminVenue(editingVenue._id, payload);
        if (res.data.success) {
          showToast(`Venue "${payload.name}" updated successfully.`);
        }
      } else {
        const res = await createAdminVenue(payload);
        if (res.data.success) {
          showToast(`Venue "${payload.name}" created successfully.`);
        }
      }

      setVenueModalOpen(false);
      const freshVenues = await fetchAdminVenues();
      if (freshVenues.data.venues) setVenues(freshVenues.data.venues);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to save venue.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleVenueActive = async (venue) => {
    try {
      setActionLoading(true);
      const newStatus = !venue.isActive;
      await updateAdminVenue(venue._id, { isActive: newStatus });
      showToast(`Venue ${venue.name} is now ${newStatus ? "Active" : "Deactivated"}.`);
      const freshVenues = await fetchAdminVenues();
      if (freshVenues.data.venues) setVenues(freshVenues.data.venues);
    } catch (err) {
      showToast("Failed to toggle venue status.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ================= MATCH ACTIONS =================

  const handleOpenMatchModal = (match = null) => {
    if (match) {
      setEditingMatch(match);
      setMatchForm({
        title: match.title || "",
        sport: match.sport || "Cricket",
        team1Id: match.team1Id?._id || match.team1Id || "",
        team2Id: match.team2Id?._id || match.team2Id || "",
        venueId: match.venueId?._id || match.venueId || "",
        scheduledTime: match.scheduledTime
          ? new Date(match.scheduledTime).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16),
        status: match.status || "scheduled",
        liveStatus: match.liveStatus || "Live in Progress",
        liveStreamUrl: match.liveStreamUrl || "",
        team1Score: match.team1Score || "0",
        team2Score: match.team2Score || "0",
        commentary: "",
      });
    } else {
      setEditingMatch(null);
      setMatchForm({
        title: "",
        sport: "Cricket",
        team1Id: teamsList[0]?._id || "",
        team2Id: teamsList[1]?._id || "",
        venueId: venues[0]?._id || "",
        scheduledTime: new Date().toISOString().slice(0, 16),
        status: "scheduled",
        liveStatus: "Scheduled Fixture",
        liveStreamUrl: "",
        team1Score: "0",
        team2Score: "0",
        commentary: "",
      });
    }
    setMatchModalOpen(true);
  };

  const handleSaveMatch = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      if (editingMatch) {
        await updateAdminMatch(editingMatch._id, matchForm);
        showToast("Match fixture updated successfully.");
      } else {
        await createAdminMatch(matchForm);
        showToast("New match fixture created successfully.");
      }

      setMatchModalOpen(false);
      const freshMatches = await fetchAdminMatches();
      if (freshMatches.data.matches) setMatches(freshMatches.data.matches);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to save match.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleQuickStatus = async (matchId, newStatus, liveText) => {
    try {
      setActionLoading(true);
      await updateAdminMatch(matchId, {
        status: newStatus,
        liveStatus: liveText,
      });
      showToast(`Match marked as ${newStatus.toUpperCase()}`);
      const freshMatches = await fetchAdminMatches();
      if (freshMatches.data.matches) setMatches(freshMatches.data.matches);
    } catch (err) {
      showToast("Failed to update status.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteMatch = async (matchId) => {
    if (!window.confirm("Are you sure you want to delete this match fixture?")) return;
    try {
      setActionLoading(true);
      await deleteAdminMatch(matchId);
      showToast("Match deleted successfully.");
      const freshMatches = await fetchAdminMatches();
      if (freshMatches.data.matches) setMatches(freshMatches.data.matches);
    } catch (err) {
      showToast("Failed to delete match.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ================= SUPER ADMIN RE-AUTHENTICATION =================

  const openReauthModal = (title, description, onConfirmAction) => {
    setReauthModal({
      isOpen: true,
      title,
      description,
      adminPassword: "",
      error: "",
      onConfirm: onConfirmAction,
    });
  };

  const executeReauthConfirm = async (e) => {
    e.preventDefault();
    if (!reauthModal.adminPassword) {
      setReauthModal((prev) => ({ ...prev, error: "Please enter your Super Admin password." }));
      return;
    }

    try {
      setActionLoading(true);
      await reauthModal.onConfirm(reauthModal.adminPassword);
      setReauthModal({ isOpen: false, title: "", description: "", adminPassword: "", error: "", onConfirm: null });
    } catch (err) {
      setReauthModal((prev) => ({
        ...prev,
        error: err.response?.data?.message || "Re-authentication failed. Incorrect password.",
      }));
    } finally {
      setActionLoading(false);
    }
  };

  // ================= USER ROLE ACTIONS (SUPER ADMIN) =================

  const handleRoleChange = (targetUserId, newRole) => {
    openReauthModal(
      "Confirm Role Change",
      `Are you sure you want to promote/change this user's role to "${newRole}"? Please confirm your Super Admin password to verify your identity.`,
      async (adminPassword) => {
        const res = await updateUserRole(targetUserId, newRole, adminPassword);
        if (res.data.success) {
          showToast(res.data.message);
          const freshUsers = await fetchAdminUsers();
          if (freshUsers.data.users) setUsersList(freshUsers.data.users);
          loadAuditLogs();
        }
      }
    );
  };

  const handleDeleteUser = (targetUserId, userName) => {
    openReauthModal(
      "Confirm User Account Deletion",
      `Are you sure you want to permanently delete user account "${userName}"? This action cannot be undone. Enter your Super Admin password.`,
      async (adminPassword) => {
        const res = await deleteAdminUser(targetUserId, adminPassword);
        if (res.data.success) {
          showToast(`User ${userName} deleted successfully.`);
          const freshUsers = await fetchAdminUsers();
          if (freshUsers.data.users) setUsersList(freshUsers.data.users);
          loadAuditLogs();
        }
      }
    );
  };

  const handleDeleteVenue = (venue) => {
    if (venue.bookingCount > 0) {
      openReauthModal(
        "Confirm Venue Deletion (Active Bookings Exist)",
        `Venue "${venue.name}" has ${venue.bookingCount} active/confirmed bookings. Super Admin password verification is required to deactivate it.`,
        async (adminPassword) => {
          const res = await deleteAdminVenue(venue._id, adminPassword);
          if (res.data.success) {
            showToast(res.data.message);
            const freshVenues = await fetchAdminVenues();
            if (freshVenues.data.venues) setVenues(freshVenues.data.venues);
            loadAuditLogs();
          }
        }
      );
    } else {
      if (!window.confirm(`Are you sure you want to deactivate venue "${venue.name}"?`)) return;
      deleteAdminVenue(venue._id)
        .then((res) => {
          showToast(res.data.message);
          return fetchAdminVenues();
        })
        .then((fresh) => {
          if (fresh?.data?.venues) setVenues(fresh.data.venues);
          loadAuditLogs();
        })
        .catch((err) => showToast(err.response?.data?.message || "Failed to deactivate venue.", "error"));
    }
  };

  // ================= DATA SYNC ACTIONS =================

  const handleTriggerSync = async () => {
    try {
      setActionLoading(true);
      const res = await triggerSyncNow();
      showToast("Daily sync routine executed successfully.");
      loadInitialData();
    } catch (err) {
      showToast("Failed to trigger sync.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Unauthorized guard for regular players
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-court-900 border border-amber-500/30 rounded-3xl text-center shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Administrator Access Required</h2>
        <p className="text-xs text-slate-300 mb-6 leading-relaxed">
          This section is for administrators only. Contact a platform admin if you believe you should have access.
        </p>
        <Link
          to="/dashboard"
          className="px-6 py-2.5 bg-turf hover:bg-turf-hover text-court-950 font-bold rounded-xl text-xs inline-block shadow-lg shadow-turf/20 transition-all"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  // Filtered venues, matches, and users
  const filteredVenues = venues.filter((v) => {
    if (venueFilter.city !== "All" && v.city !== venueFilter.city) return false;
    if (venueFilter.sport !== "All" && v.sportType !== venueFilter.sport) return false;
    if (venueFilter.search) {
      const s = venueFilter.search.toLowerCase();
      return v.name?.toLowerCase().includes(s) || v.address?.toLowerCase().includes(s);
    }
    return true;
  });

  const filteredMatches = matches.filter((m) => {
    if (matchFilter.status !== "All" && m.status !== matchFilter.status) return false;
    if (matchFilter.sport !== "All" && m.sport !== matchFilter.sport) return false;
    if (matchFilter.search) {
      const s = matchFilter.search.toLowerCase();
      return (
        m.title?.toLowerCase().includes(s) ||
        m.team1Id?.name?.toLowerCase().includes(s) ||
        m.team2Id?.name?.toLowerCase().includes(s)
      );
    }
    return true;
  });

  const filteredUsers = usersList.filter((u) => {
    if (userFilter.role !== "All" && u.role !== userFilter.role) return false;
    if (userFilter.search) {
      const s = userFilter.search.toLowerCase();
      return (
        u.name?.toLowerCase().includes(s) ||
        u.email?.toLowerCase().includes(s) ||
        u.city?.toLowerCase().includes(s)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in text-slate-100">
      {/* Toast Notification */}
      {message.text && (
        <div
          className={`mb-6 p-4 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-lg ${
            message.type === "error"
              ? "bg-red-500/15 border border-red-500/40 text-red-300"
              : "bg-turf/15 border border-turf/40 text-turf"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "error" ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage({ text: "", type: "" })} className="hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-court-900 via-court-850 to-court-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden mb-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              {isSuperAdmin ? (
                <span className="px-3 py-1 bg-amber-400/15 border border-amber-400/30 text-amber-400 text-[11px] font-black rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                  <Crown className="w-3.5 h-3.5" />
                  <span>SUPER ADMIN (Platform Owner)</span>
                </span>
              ) : (
                <span className="px-3 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-black rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>VENUE ADMIN (Grounds & Matches)</span>
                </span>
              )}
              <span className="text-xs text-slate-400">• PlaySphere Control Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {isSuperAdmin ? "Super Admin Platform Operations" : "Venue & Fixtures Management"}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {isSuperAdmin
                ? "Full control over user permissions, venues, live scoring feeds, and platform-wide analytics."
                : "Manage sports venue availability, pricing, and live tournament fixtures across Tamil Nadu."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleTriggerSync}
              disabled={actionLoading}
              className="px-4 py-2.5 bg-court-800 hover:bg-court-700 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-turf ${actionLoading ? "animate-spin" : ""}`} />
              <span>Trigger Daily Sync</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Overview */}
        {overview && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800">
            <div className="bg-court-950/70 border border-slate-800 rounded-2xl p-4 text-center">
              <span className="text-2xl font-black text-turf block">{overview.totalVenues}</span>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Venues</span>
            </div>
            <div className="bg-court-950/70 border border-slate-800 rounded-2xl p-4 text-center">
              <span className="text-2xl font-black text-action block">{overview.totalMatches}</span>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Matches ({overview.liveMatches} Live)
              </span>
            </div>
            <div className="bg-court-950/70 border border-slate-800 rounded-2xl p-4 text-center">
              <span className="text-2xl font-black text-amber-400 block">{overview.totalBookings}</span>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Bookings</span>
            </div>
            <div className="bg-court-950/70 border border-slate-800 rounded-2xl p-4 text-center">
              <span className="text-2xl font-black text-purple-400 block">{overview.totalUsers}</span>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Registered Users</span>
            </div>
          </div>
        )}
      </div>

      {/* Role-Tiered Tabs */}
      <div className="flex flex-wrap gap-2.5 border-b border-slate-800 pb-4 mb-6">
        <button
          onClick={() => setActiveTab("venues")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "venues"
              ? "bg-turf text-court-950 shadow-md shadow-turf/20"
              : "bg-court-900 text-slate-300 hover:bg-court-800 hover:text-white"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Venues & Turfs ({venues.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("matches")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "matches"
              ? "bg-turf text-court-950 shadow-md shadow-turf/20"
              : "bg-court-900 text-slate-300 hover:bg-court-800 hover:text-white"
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Matches & Scores ({matches.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("streams")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "streams"
              ? "bg-turf text-court-950 shadow-md shadow-turf/20"
              : "bg-court-900 text-slate-300 hover:bg-court-800 hover:text-white"
          }`}
        >
          <LinkIcon className="w-4 h-4" />
          <span>Stream Links ({streamHealthList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("sync")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "sync"
              ? "bg-turf text-court-950 shadow-md shadow-turf/20"
              : "bg-court-900 text-slate-300 hover:bg-court-800 hover:text-white"
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Data Sync</span>
        </button>

        {/* Super Admin Only Tabs */}
        {isSuperAdmin && (
          <>
            <div className="h-6 w-px bg-slate-800 my-auto hidden sm:block"></div>

            <button
              onClick={() => setActiveTab("users")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "users"
                  ? "bg-amber-400 text-court-950 shadow-md shadow-amber-400/20"
                  : "bg-court-900 text-amber-400 hover:bg-court-800 border border-amber-400/30"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>👑 Users & Roles ({usersList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("stats")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "stats"
                  ? "bg-amber-400 text-court-950 shadow-md shadow-amber-400/20"
                  : "bg-court-900 text-amber-400 hover:bg-court-800 border border-amber-400/30"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>📊 Platform Stats</span>
            </button>

            <button
              onClick={() => setActiveTab("security")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "security"
                  ? "bg-purple-400 text-court-950 shadow-md shadow-purple-400/20"
                  : "bg-court-900 text-purple-400 hover:bg-court-800 border border-purple-400/30"
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>🛡️ Security & Audit Logs ({auditLogs.length})</span>
            </button>
          </>
        )}
      </div>

      {/* Permission guard for Super Admin tabs if accessed by non-super admin */}
      {!isSuperAdmin && (activeTab === "users" || activeTab === "stats") && (
        <div className="p-8 bg-court-900 border border-red-500/30 rounded-3xl text-center my-6">
          <ShieldAlert className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">Super Admin Role Required</h3>
          <p className="text-xs text-slate-400 mb-4">
            You are logged in as a <strong>Venue Admin</strong>. User role management and global platform statistics are restricted to Super Admins.
          </p>
          <button
            onClick={() => setActiveTab("venues")}
            className="px-4 py-2 bg-court-800 hover:bg-court-700 text-slate-200 font-bold rounded-xl text-xs"
          >
            Back to Venues
          </button>
        </div>
      )}

      {/* ====================================================
          TAB 1: VENUES MANAGEMENT
         ==================================================== */}
      {activeTab === "venues" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-court-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-60">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search venue name, area..."
                  value={venueFilter.search}
                  onChange={(e) => setVenueFilter({ ...venueFilter, search: e.target.value })}
                  className="w-full bg-court-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-turf"
                />
              </div>

              <select
                value={venueFilter.city}
                onChange={(e) => setVenueFilter({ ...venueFilter, city: e.target.value })}
                className="bg-court-950 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-turf"
              >
                <option value="All">All Cities</option>
                {TAMIL_NADU_CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => handleOpenVenueModal()}
              className="w-full sm:w-auto px-4 py-2.5 bg-turf hover:bg-turf-hover text-court-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-turf/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Venue</span>
            </button>
          </div>

          <div className="bg-court-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-court-950 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Venue Details</th>
                    <th className="px-4 py-4">Sport</th>
                    <th className="px-4 py-4">City</th>
                    <th className="px-4 py-4">Price/Hr</th>
                    <th className="px-4 py-4">Hours</th>
                    <th className="px-4 py-4">Bookings</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredVenues.map((venue) => (
                    <tr key={venue._id} className="hover:bg-court-850/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={venue.photos?.[0] || "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=200"}
                            alt={venue.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                          />
                          <div>
                            <span className="font-bold text-white block text-sm">{venue.name}</span>
                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-turf" />
                              {venue.address}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="px-2.5 py-1 bg-court-950 border border-slate-700 rounded-lg font-semibold text-slate-200">
                          {venue.sportType}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-semibold text-slate-300">{venue.city}</td>
                      <td className="px-4 py-4 font-black text-turf">₹{venue.pricePerHour}</td>
                      <td className="px-4 py-4 text-slate-400">
                        {venue.openingTime} - {venue.closingTime}
                      </td>
                      <td className="px-4 py-4">
                        <span className="px-2.5 py-1 bg-action/15 border border-action/30 text-action rounded-full font-bold">
                          {venue.bookingCount || 0}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {venue.isActive ? (
                          <span className="px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold rounded-full text-[10px]">
                            Active
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-red-500/15 border border-red-500/30 text-red-400 font-bold rounded-full text-[10px]">
                            Deactivated
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenVenueModal(venue)}
                            className="p-2 bg-court-950 hover:bg-court-800 border border-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors"
                            title="Edit Venue"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleVenueActive(venue)}
                            className={`p-2 border rounded-xl transition-colors ${
                              venue.isActive
                                ? "bg-court-950 hover:bg-red-500/20 border-slate-700 text-slate-400 hover:text-red-400"
                                : "bg-court-950 hover:bg-emerald-500/20 border-slate-700 text-slate-400 hover:text-emerald-400"
                            }`}
                            title={venue.isActive ? "Deactivate Venue" : "Activate Venue"}
                          >
                            {venue.isActive ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleDeleteVenue(venue)}
                            className="p-2 bg-court-950 hover:bg-red-500/20 border border-slate-700 text-slate-400 hover:text-red-400 rounded-xl transition-colors"
                            title="Delete / Deactivate Venue"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <Link
                            to={`/venues/${venue._id}`}
                            target="_blank"
                            className="p-2 bg-court-950 hover:bg-court-800 border border-slate-700 text-action rounded-xl transition-colors"
                            title="View Public Page"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredVenues.length === 0 && (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center text-slate-500">
                        No venues match the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          TAB 2: MATCHES MANAGEMENT
         ==================================================== */}
      {activeTab === "matches" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-court-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-60">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search teams or title..."
                  value={matchFilter.search}
                  onChange={(e) => setMatchFilter({ ...matchFilter, search: e.target.value })}
                  className="w-full bg-court-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-turf"
                />
              </div>

              <select
                value={matchFilter.status}
                onChange={(e) => setMatchFilter({ ...matchFilter, status: e.target.value })}
                className="bg-court-950 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-turf"
              >
                <option value="All">All Statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="live">Live</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <button
              onClick={() => handleOpenMatchModal()}
              className="w-full sm:w-auto px-4 py-2.5 bg-turf hover:bg-turf-hover text-court-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-turf/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule New Match</span>
            </button>
          </div>

          <div className="bg-court-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-court-950 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Match / Teams</th>
                    <th className="px-4 py-4">Sport</th>
                    <th className="px-4 py-4">Scores</th>
                    <th className="px-4 py-4">Venue</th>
                    <th className="px-4 py-4">Date & Time</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4">Live Stream</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredMatches.map((match) => (
                    <tr key={match._id} className="hover:bg-court-850/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span className="font-bold text-white block text-sm">{match.title}</span>
                          <div className="flex items-center gap-2 text-slate-300 font-semibold text-xs">
                            <span>{match.team1Id?.name || "Team 1"}</span>
                            <span className="text-turf font-black">vs</span>
                            <span>{match.team2Id?.name || "Team 2"}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 font-semibold text-slate-300">{match.sport}</td>
                      <td className="px-4 py-4">
                        <div className="px-3 py-1.5 bg-court-950 border border-slate-700 rounded-xl inline-block font-black text-turf tracking-wider">
                          {match.team1Score || 0} - {match.team2Score || 0}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-400">{match.venueId?.name || "TBD / Open Field"}</td>
                      <td className="px-4 py-4 text-slate-300">
                        {new Date(match.scheduledTime).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-4">
                        {match.status === "live" && (
                          <span className="px-2.5 py-1 bg-red-500/15 border border-red-500/30 text-red-400 font-bold rounded-full text-[10px] flex items-center gap-1.5 w-max animate-pulse">
                            <Radio className="w-3 h-3" />
                            LIVE
                          </span>
                        )}
                        {match.status === "scheduled" && (
                          <span className="px-2.5 py-1 bg-blue-500/15 border border-blue-500/30 text-blue-400 font-bold rounded-full text-[10px]">
                            Scheduled
                          </span>
                        )}
                        {match.status === "completed" && (
                          <span className="px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold rounded-full text-[10px]">
                            Completed
                          </span>
                        )}
                        {match.status === "cancelled" && (
                          <span className="px-2.5 py-1 bg-slate-700/50 text-slate-400 font-bold rounded-full text-[10px]">
                            Cancelled
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {match.videoId ? (
                          <a
                            href={match.liveStreamUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 bg-red-600/20 border border-red-500/40 text-red-400 rounded-lg inline-flex items-center gap-1 text-[11px] font-semibold hover:bg-red-600/30"
                          >
                            <Video className="w-3 h-3" />
                            <span>Feed Link</span>
                          </a>
                        ) : (
                          <span className="text-[11px] text-slate-500">None</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {match.status !== "live" && (
                            <button
                              onClick={() => handleQuickStatus(match._id, "live", "Live in progress")}
                              className="px-2 py-1 bg-red-600/15 hover:bg-red-600/30 border border-red-500/30 text-red-400 text-[10px] font-bold rounded-lg"
                              title="Go Live"
                            >
                              Go Live
                            </button>
                          )}
                          {match.status === "live" && (
                            <button
                              onClick={() => handleQuickStatus(match._id, "completed", "Match ended")}
                              className="px-2 py-1 bg-emerald-600/15 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold rounded-lg"
                              title="Mark Completed"
                            >
                              End
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenMatchModal(match)}
                            className="p-2 bg-court-950 hover:bg-court-800 border border-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors"
                            title="Edit Match"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteMatch(match._id)}
                            className="p-2 bg-court-950 hover:bg-red-500/20 border border-slate-700 text-slate-400 hover:text-red-400 rounded-xl transition-colors"
                            title="Delete Match"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <Link
                            to={`/live/${match._id}`}
                            target="_blank"
                            className="p-2 bg-court-950 hover:bg-court-800 border border-slate-700 text-turf rounded-xl transition-colors"
                            title="Open Match Arena"
                          >
                            <Tv className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredMatches.length === 0 && (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center text-slate-500">
                        No matches match the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          TAB 3: STREAM LINKS & BROKEN LINK DETECTOR
         ==================================================== */}
      {activeTab === "streams" && (
        <div className="space-y-6">
          <div className="bg-court-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2 flex items-center gap-2">
              <Video className="w-4 h-4 text-red-400" />
              <span>YouTube Live Streams & Feed Integrity</span>
            </h3>
            <p className="text-xs text-slate-400">
              Audit active match feeds and ensure YouTube live stream embed IDs are healthy for spectator rooms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {streamHealthList.map((stream) => (
              <div
                key={stream._id}
                className="p-5 bg-court-900 border border-slate-800 rounded-2xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-bold text-white text-sm truncate">{stream.title}</span>
                    {stream.healthStatus === "healthy" && (
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-black rounded-md flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Healthy Feed
                      </span>
                    )}
                    {stream.healthStatus === "broken" && (
                      <span className="px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] font-black rounded-md flex items-center gap-1 animate-pulse">
                        <AlertCircle className="w-3 h-3" /> Broken Link
                      </span>
                    )}
                    {stream.healthStatus === "missing_live_url" && (
                      <span className="px-2 py-0.5 bg-amber-400/20 text-amber-400 border border-amber-400/40 text-[10px] font-black rounded-md flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Live Without URL
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 font-semibold mb-1">{stream.teams}</p>
                  <p className="text-[11px] text-slate-400 mb-3">{stream.venue} • {stream.sport}</p>
                  {stream.liveStreamUrl && (
                    <div className="p-2 bg-court-950 rounded-xl border border-slate-800 text-[11px] text-slate-300 truncate font-mono mb-3">
                      {stream.liveStreamUrl}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-3 border-t border-slate-800">
                  <button
                    onClick={() => {
                      const match = matches.find((m) => m._id === stream._id);
                      if (match) handleOpenMatchModal(match);
                    }}
                    className="flex-1 py-2 bg-court-800 hover:bg-court-700 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Update Stream Link</span>
                  </button>
                  <Link
                    to={`/live/${stream._id}`}
                    target="_blank"
                    className="px-3 py-2 bg-court-950 hover:bg-court-800 text-turf border border-slate-700 rounded-xl text-xs flex items-center gap-1"
                  >
                    <Tv className="w-3.5 h-3.5" />
                    <span>Arena</span>
                  </Link>
                </div>
              </div>
            ))}
            {streamHealthList.length === 0 && (
              <div className="col-span-2 p-12 bg-court-900 border border-slate-800 rounded-3xl text-center text-slate-500 text-xs">
                No active or scheduled stream links require review.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ====================================================
          TAB 4: DATA SYNC (DAILY ROUTINES)
         ==================================================== */}
      {activeTab === "sync" && (
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="bg-court-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-turf" />
                  <span>Automated Daily Sync Operations</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Runs daily at 06:00 AM IST to close stale match feeds and sync tournament standings.
                </p>
              </div>

              <button
                onClick={handleTriggerSync}
                disabled={actionLoading}
                className="px-4 py-2.5 bg-turf hover:bg-turf-hover text-court-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-turf/20 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${actionLoading ? "animate-spin" : ""}`} />
                <span>Execute Sync Now</span>
              </button>
            </div>

            {/* Latest execution */}
            {syncStatus?.latestSync && (
              <div className="p-5 bg-court-950 border border-slate-800 rounded-2xl mb-6">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                  Latest Routine Execution
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">
                    {syncStatus.latestSync.executedAt
                      ? new Date(syncStatus.latestSync.executedAt).toLocaleString()
                      : "Pending initial scheduled trigger"}
                  </span>
                  <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-black rounded-md">
                    {syncStatus.latestSync.status || "SUCCESS"}
                  </span>
                </div>
              </div>
            )}

            {/* Sync History Logs */}
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Recent Execution Logs</h4>
            <div className="space-y-2">
              {(syncStatus?.recentLogs || []).map((log, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-court-950 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs"
                >
                  <span className="text-slate-300 font-mono">
                    {new Date(log.executedAt).toLocaleString()}
                  </span>
                  <span className="text-slate-400">
                    Stale closed: {log.details?.staleClosedCount || 0} • Today: {log.details?.todayCount || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          TAB 5: USERS & ROLE MANAGEMENT (SUPER ADMIN ONLY)
         ==================================================== */}
      {isSuperAdmin && activeTab === "users" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-court-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-60">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search user name, email, city..."
                  value={userFilter.search}
                  onChange={(e) => setUserFilter({ ...userFilter, search: e.target.value })}
                  className="w-full bg-court-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-turf"
                />
              </div>

              <select
                value={userFilter.role}
                onChange={(e) => setUserFilter({ ...userFilter, role: e.target.value })}
                className="bg-court-950 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-turf"
              >
                <option value="All">All Roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="venue_admin">Venue Admin</option>
                <option value="user">Regular User</option>
                <option value="player">Player</option>
              </select>
            </div>

            <div className="text-xs text-slate-400">
              Showing <strong>{filteredUsers.length}</strong> platform accounts
            </div>
          </div>

          <div className="bg-court-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-court-950 text-[#9B9691] uppercase tracking-wider font-bold border-b border-court-700">
                  <tr>
                    <th className="px-6 py-4">User Details</th>
                    <th className="px-4 py-4">City</th>
                    <th className="px-4 py-4">Current Role</th>
                    <th className="px-4 py-4">Profile Status</th>
                    <th className="px-4 py-4">Player ID</th>
                    <th className="px-4 py-4">Sport & Rating</th>
                    <th className="px-4 py-4">Joined Date</th>
                    <th className="px-6 py-4 text-right">Role Assignment & Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-court-800">
                  {filteredUsers.map((targetUser) => {
                    const isSelf = targetUser._id === user?._id;
                    const isCompleted = targetUser.hasCompletedProfile || !!targetUser.profile;

                    return (
                      <tr key={targetUser._id} className="hover:bg-court-850/60 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-court-800 border border-gold/40 overflow-hidden flex items-center justify-center font-bold text-gold shrink-0">
                              {targetUser.profile?.profilePhoto ? (
                                <img
                                  src={targetUser.profile.profilePhoto}
                                  alt={targetUser.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                targetUser.name?.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-[#F5F0E6] block text-sm flex items-center gap-1.5 truncate">
                                {targetUser.name}
                                {isSelf && (
                                  <span className="text-[10px] text-gold bg-gold/15 px-1.5 py-0.5 rounded border border-gold/30 font-extrabold">
                                    You
                                  </span>
                                )}
                              </span>
                              <span className="text-[11px] text-[#9B9691] truncate block">{targetUser.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 font-semibold text-[#F5F0E6]">{targetUser.city || "Chennai"}</td>
                        <td className="px-4 py-4">
                          {targetUser.role === "super_admin" && (
                            <span className="px-2.5 py-1 bg-gold/20 border border-gold/40 text-gold-glow font-bold rounded-full text-[10px] flex items-center gap-1 w-max shadow-sm">
                              <Crown className="w-3 h-3 text-gold" /> Super Admin
                            </span>
                          )}
                          {targetUser.role === "venue_admin" && (
                            <span className="px-2.5 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold rounded-full text-[10px] flex items-center gap-1 w-max">
                              <ShieldCheck className="w-3 h-3" /> Venue Admin
                            </span>
                          )}
                          {targetUser.role !== "super_admin" && targetUser.role !== "venue_admin" && (
                            <span className="px-2.5 py-1 bg-court-800 border border-court-700 text-[#9B9691] font-bold rounded-full text-[10px]">
                              {targetUser.role === "player" ? "Player" : "Athlete / User"}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          {isCompleted ? (
                            <span className="px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold rounded-full text-[10px] flex items-center gap-1 w-max">
                              <CheckCircle2 className="w-3 h-3" /> Active Profile
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-court-950 border border-court-700 text-[#9B9691] rounded-full text-[10px] flex items-center gap-1 w-max">
                              <Clock className="w-3 h-3 text-amber-400/80" /> Pending Profile
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 font-mono text-[11px] text-gold font-bold">
                          {targetUser.profile?.playerIdNumber ? (
                            <Link
                              to={`/profile/public/${targetUser._id}`}
                              className="hover:underline hover:text-gold-light"
                            >
                              {targetUser.profile.playerIdNumber}
                            </Link>
                          ) : (
                            <span className="text-[#656C7D]">N/A</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-[#F5F0E6]">
                          {targetUser.profile?.sport ? (
                            <div className="space-y-0.5">
                              <span className="font-semibold text-xs text-gold-glow block">{targetUser.profile.sport}</span>
                              <span className="text-[10px] text-[#9B9691] capitalize">
                                {targetUser.profile.skillLevel || "Intermediate"} • ★ {targetUser.profile.rating || 4.0}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-[#656C7D]">No sport set</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-[#9B9691] text-[11px]">
                          {new Date(targetUser.createdAt).toLocaleDateString([], {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Role Selector */}
                            <select
                              value={targetUser.role}
                              disabled={isSelf || actionLoading}
                              onChange={(e) => handleRoleChange(targetUser._id, e.target.value)}
                              className="bg-court-950 border border-court-700 rounded-xl px-2.5 py-1 text-[11px] font-bold text-[#F5F0E6] focus:outline-none focus:border-gold disabled:opacity-50 cursor-pointer"
                            >
                              <option value="user" className="bg-court-900">User</option>
                              <option value="player" className="bg-court-900">Player</option>
                              <option value="venue_admin" className="bg-court-900">Venue Admin</option>
                              <option value="super_admin" className="bg-court-900">Super Admin</option>
                            </select>

                            {/* Delete User */}
                            {!isSelf && (
                              <button
                                onClick={() => handleDeleteUser(targetUser._id, targetUser.name)}
                                disabled={actionLoading}
                                className="p-1.5 bg-court-950 hover:bg-red-500/20 border border-court-700 text-red-400 rounded-xl transition-colors disabled:opacity-50"
                                title="Delete User Account"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          TAB 6: PLATFORM STATS (SUPER ADMIN ONLY)
         ==================================================== */}
      {isSuperAdmin && activeTab === "stats" && platformStats && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Users Breakdown */}
            <div className="bg-court-900 border border-slate-800 rounded-3xl p-6">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                <span>User Demographics</span>
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300">Regular Athletes & Players:</span>
                  <span className="font-black text-white">{platformStats.users.regularUsers}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300">Venue Admins:</span>
                  <span className="font-black text-emerald-400">{platformStats.users.venueAdmins}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300">Super Admins:</span>
                  <span className="font-black text-amber-400">{platformStats.users.superAdmins}</span>
                </div>
                <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs font-black">
                  <span className="text-white">Total User Base:</span>
                  <span className="text-purple-400 text-base">{platformStats.users.total}</span>
                </div>
              </div>
            </div>

            {/* Venues Breakdown */}
            <div className="bg-court-900 border border-slate-800 rounded-3xl p-6">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-turf" />
                <span>Venues & Turfs</span>
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300">Active Listed Grounds:</span>
                  <span className="font-black text-emerald-400">{platformStats.venues.active}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300">Deactivated Grounds:</span>
                  <span className="font-black text-red-400">{platformStats.venues.inactive}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300">Total Bookings Completed:</span>
                  <span className="font-black text-white">{platformStats.bookings.total}</span>
                </div>
                <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs font-black">
                  <span className="text-white">Total Ground Catalog:</span>
                  <span className="text-turf text-base">{platformStats.venues.total}</span>
                </div>
              </div>
            </div>

            {/* Match & Tournament Ecosystem */}
            <div className="bg-court-900 border border-slate-800 rounded-3xl p-6">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Sports Ecosystem</span>
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300">Tournament Cups:</span>
                  <span className="font-black text-amber-400">{platformStats.tournaments.total}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300">Certified Sports Clubs:</span>
                  <span className="font-black text-white">{platformStats.ecosystem.clubs}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300">State & District Bodies:</span>
                  <span className="font-black text-action">{platformStats.ecosystem.officialBodies}</span>
                </div>
                <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs font-black">
                  <span className="text-white">Total Match Fixtures:</span>
                  <span className="text-action text-base">{platformStats.matches.total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          TAB 7: SECURITY & AUDIT LOGS (SUPER ADMIN ONLY)
         ==================================================== */}
      {isSuperAdmin && activeTab === "security" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-court-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search logs by email, action, reason..."
                  value={auditFilter.search}
                  onChange={(e) => setAuditFilter({ ...auditFilter, search: e.target.value })}
                  className="w-full bg-court-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
                />
              </div>

              <select
                value={auditFilter.action}
                onChange={(e) => setAuditFilter({ ...auditFilter, action: e.target.value })}
                className="bg-court-950 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-400"
              >
                <option value="All">All Security Actions</option>
                <option value="account_locked">Account Locked (5 attempts)</option>
                <option value="role_change">Role Change</option>
                <option value="user_deleted">User Deleted</option>
                <option value="payment_confirmed">Payment Confirmed</option>
                <option value="payment_double_confirmation_rejected">Double Payment Rejected</option>
                <option value="admin_reauth_failed">Admin Re-Auth Failed</option>
                <option value="venue_deactivated">Venue Deactivated</option>
                <option value="logout_all_devices">Logout All Devices</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">
                Showing <strong>{auditLogs.length}</strong> security events
              </span>
              <button
                onClick={loadAuditLogs}
                disabled={auditLoading}
                className="px-3 py-1.5 bg-court-950 hover:bg-court-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-turf ${auditLoading ? "animate-spin" : ""}`} />
                <span>Refresh Logs</span>
              </button>
            </div>
          </div>

          <div className="bg-court-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-court-950 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Timestamp (IST)</th>
                    <th className="px-4 py-4">Action</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4">Target & Resource</th>
                    <th className="px-6 py-4">Event Details & Metadata</th>
                    <th className="px-4 py-4 text-right">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-sans">
                        <ShieldCheck className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
                        No security audit logs found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => {
                      const isAlert =
                        log.action === "account_locked" ||
                        log.action === "admin_reauth_failed" ||
                        log.status === "blocked" ||
                        log.status === "failed" ||
                        log.status === "rejected";

                      return (
                        <tr key={log._id} className={`hover:bg-court-850/50 transition-colors ${isAlert ? "bg-red-500/5" : ""}`}>
                          <td className="px-6 py-3.5 text-slate-300 whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                          </td>
                          <td className="px-4 py-3.5">
                            <span
                              className={`px-2 py-0.5 rounded-md font-bold uppercase text-[10px] ${
                                isAlert
                                  ? "bg-red-500/20 text-red-400 border border-red-500/40"
                                  : "bg-turf/15 text-turf border border-turf/30"
                              }`}
                            >
                              {log.action}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span
                              className={`font-bold uppercase text-[10px] ${
                                log.status === "success"
                                  ? "text-emerald-400"
                                  : log.status === "blocked" || log.status === "rejected"
                                  ? "text-amber-400 font-black"
                                  : "text-red-400 font-black"
                              }`}
                            >
                              {log.status || "LOGGED"}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-slate-400 font-sans">
                            <span className="text-slate-300 font-bold block">{log.targetCollection || "system"}</span>
                            <span className="text-[10px] text-slate-500 font-mono truncate max-w-[120px] block">
                              {log.targetId || "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 font-sans text-slate-300">
                            <div className="space-y-0.5">
                              {log.details &&
                                Object.entries(log.details)
                                  .slice(0, 4)
                                  .map(([k, v]) => (
                                    <div key={k} className="text-[11px] text-slate-400">
                                      <strong className="text-slate-200">{k}:</strong> {String(v)}
                                    </div>
                                  ))}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-right text-slate-400 whitespace-nowrap">
                            {log.ip || log.details?.ip || "127.0.0.1"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          VENUE MODAL (ADD / EDIT)
         ==================================================== */}
      {venueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-court-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl text-slate-100 relative my-8">
            <button
              onClick={() => setVenueModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-white mb-1">
              {editingVenue ? "Edit Venue Details" : "Create New Sports Venue"}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Fill in facility information, pricing, and operating times for athletes to book.
            </p>

            <form onSubmit={handleSaveVenue} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 uppercase mb-1">Venue / Ground Name</label>
                <input
                  type="text"
                  required
                  value={venueForm.name}
                  onChange={(e) => setVenueForm({ ...venueForm, name: e.target.value })}
                  placeholder="e.g. Marina Turf Arena"
                  className="w-full bg-court-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-turf"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">Sport Type</label>
                  <input
                    type="text"
                    required
                    value={venueForm.sportType}
                    onChange={(e) => setVenueForm({ ...venueForm, sportType: e.target.value })}
                    placeholder="e.g. Football / Cricket"
                    className="w-full bg-court-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-turf"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">City</label>
                  <select
                    value={venueForm.city}
                    onChange={(e) => {
                      const city = e.target.value;
                      const coords = CITY_COORDS[city] || { lat: 13.0827, lng: 80.2707 };
                      setVenueForm({ ...venueForm, city, lat: coords.lat, lng: coords.lng });
                    }}
                    className="w-full bg-court-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-turf"
                  >
                    {TAMIL_NADU_CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase mb-1">Full Street Address</label>
                <input
                  type="text"
                  required
                  value={venueForm.address}
                  onChange={(e) => setVenueForm({ ...venueForm, address: e.target.value })}
                  placeholder="e.g. 14, Beach Road, Santhome, Chennai"
                  className="w-full bg-court-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-turf"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={venueForm.lat}
                    onChange={(e) => setVenueForm({ ...venueForm, lat: e.target.value })}
                    className="w-full bg-court-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-turf"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={venueForm.lng}
                    onChange={(e) => setVenueForm({ ...venueForm, lng: e.target.value })}
                    className="w-full bg-court-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-turf"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">Price / Hour (₹)</label>
                  <input
                    type="number"
                    required
                    value={venueForm.pricePerHour}
                    onChange={(e) => setVenueForm({ ...venueForm, pricePerHour: e.target.value })}
                    className="w-full bg-court-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-turf"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">Opens At</label>
                  <input
                    type="text"
                    value={venueForm.openingTime}
                    onChange={(e) => setVenueForm({ ...venueForm, openingTime: e.target.value })}
                    placeholder="06:00"
                    className="w-full bg-court-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-turf"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">Closes At</label>
                  <input
                    type="text"
                    value={venueForm.closingTime}
                    onChange={(e) => setVenueForm({ ...venueForm, closingTime: e.target.value })}
                    placeholder="22:00"
                    className="w-full bg-court-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-turf"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase mb-1">Photo URLs (comma separated)</label>
                <input
                  type="text"
                  value={venueForm.photos}
                  onChange={(e) => setVenueForm({ ...venueForm, photos: e.target.value })}
                  placeholder="https://image1.jpg, https://image2.jpg"
                  className="w-full bg-court-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-turf"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase mb-1">Amenities</label>
                <input
                  type="text"
                  value={venueForm.amenities}
                  onChange={(e) => setVenueForm({ ...venueForm, amenities: e.target.value })}
                  placeholder="Floodlights, Parking, Changing Room, First Aid"
                  className="w-full bg-court-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-turf"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setVenueModalOpen(false)}
                  className="flex-1 py-2.5 bg-court-800 hover:bg-court-700 text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2.5 bg-turf hover:bg-turf-hover text-court-950 font-black rounded-xl shadow-lg shadow-turf/25 disabled:opacity-50"
                >
                  {actionLoading ? "Saving..." : editingVenue ? "Save Changes" : "Create Venue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================
          MATCH MODAL (ADD / EDIT)
         ==================================================== */}
      {matchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-court-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl text-slate-100 relative my-8">
            <button
              onClick={() => setMatchModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-white mb-1">
              {editingMatch ? "Edit Match & Scores" : "Schedule New Match Fixture"}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Configure participating teams, venue, YouTube stream link, and real-time score status.
            </p>

            <form onSubmit={handleSaveMatch} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 uppercase mb-1">Match Title</label>
                <input
                  type="text"
                  required
                  value={matchForm.title}
                  onChange={(e) => setMatchForm({ ...matchForm, title: e.target.value })}
                  placeholder="e.g. Chennai Super League - Final"
                  className="w-full bg-court-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-turf"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">Sport</label>
                  <input
                    type="text"
                    required
                    value={matchForm.sport}
                    onChange={(e) => setMatchForm({ ...matchForm, sport: e.target.value })}
                    placeholder="Cricket"
                    className="w-full bg-court-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-turf"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">Venue</label>
                  <select
                    value={matchForm.venueId}
                    onChange={(e) => setMatchForm({ ...matchForm, venueId: e.target.value })}
                    className="w-full bg-court-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-turf"
                  >
                    <option value="">-- Select Venue (Optional) --</option>
                    {venues.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.name} ({v.city})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">Team 1</label>
                  <select
                    required
                    value={matchForm.team1Id}
                    onChange={(e) => setMatchForm({ ...matchForm, team1Id: e.target.value })}
                    className="w-full bg-court-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-turf"
                  >
                    <option value="">-- Choose Team 1 --</option>
                    {teamsList.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name} ({t.sport})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">Team 2</label>
                  <select
                    required
                    value={matchForm.team2Id}
                    onChange={(e) => setMatchForm({ ...matchForm, team2Id: e.target.value })}
                    className="w-full bg-court-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-turf"
                  >
                    <option value="">-- Choose Team 2 --</option>
                    {teamsList.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name} ({t.sport})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">Team 1 Score</label>
                  <input
                    type="text"
                    value={matchForm.team1Score}
                    onChange={(e) => setMatchForm({ ...matchForm, team1Score: e.target.value })}
                    placeholder="e.g. 142/4 (18.2 ov)"
                    className="w-full bg-court-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-turf"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">Team 2 Score</label>
                  <input
                    type="text"
                    value={matchForm.team2Score}
                    onChange={(e) => setMatchForm({ ...matchForm, team2Score: e.target.value })}
                    placeholder="e.g. 138/9 (20 ov)"
                    className="w-full bg-court-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-turf"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">Status</label>
                  <select
                    value={matchForm.status}
                    onChange={(e) => setMatchForm({ ...matchForm, status: e.target.value })}
                    className="w-full bg-court-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-turf"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="live">Live</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase mb-1">YouTube Live Stream URL</label>
                <input
                  type="text"
                  value={matchForm.liveStreamUrl}
                  onChange={(e) => setMatchForm({ ...matchForm, liveStreamUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                  className="w-full bg-court-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-turf"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase mb-1">Live Status Summary</label>
                <input
                  type="text"
                  value={matchForm.liveStatus}
                  onChange={(e) => setMatchForm({ ...matchForm, liveStatus: e.target.value })}
                  placeholder="e.g. Innings break: Team 1 needs 24 runs in 18 balls"
                  className="w-full bg-court-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-turf"
                />
              </div>

              {editingMatch && (
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">Add Commentary Snippet</label>
                  <input
                    type="text"
                    value={matchForm.commentary}
                    onChange={(e) => setMatchForm({ ...matchForm, commentary: e.target.value })}
                    placeholder="e.g. Huge six over long on by batsman!"
                    className="w-full bg-court-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-turf"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setMatchModalOpen(false)}
                  className="flex-1 py-2.5 bg-court-800 hover:bg-court-700 text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2.5 bg-turf hover:bg-turf-hover text-court-950 font-black rounded-xl shadow-lg shadow-turf/25 disabled:opacity-50"
                >
                  {actionLoading ? "Saving..." : editingMatch ? "Save Match" : "Schedule Match"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ====================================================
          SUPER ADMIN RE-AUTHENTICATION MODAL
         ==================================================== */}
      {reauthModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-court-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-slate-100 relative">
            <button
              onClick={() =>
                setReauthModal({ isOpen: false, title: "", description: "", adminPassword: "", error: "", onConfirm: null })
              }
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">{reauthModal.title}</h3>
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                  Super Admin Identity Verification
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">{reauthModal.description}</p>

            {reauthModal.error && (
              <div className="mb-4 p-3 bg-red-500/15 border border-red-500/40 rounded-xl text-red-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{reauthModal.error}</span>
              </div>
            )}

            <form onSubmit={executeReauthConfirm} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Enter Super Admin Password
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    autoFocus
                    value={reauthModal.adminPassword}
                    onChange={(e) =>
                      setReauthModal((prev) => ({ ...prev, adminPassword: e.target.value, error: "" }))
                    }
                    placeholder="Enter password to confirm action"
                    className="w-full bg-court-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    setReauthModal({ isOpen: false, title: "", description: "", adminPassword: "", error: "", onConfirm: null })
                  }
                  className="flex-1 py-2.5 bg-court-800 hover:bg-court-700 text-slate-300 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2.5 bg-amber-400 hover:bg-amber-300 text-court-950 text-xs font-black rounded-xl shadow-lg shadow-amber-400/25 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading ? "Verifying..." : "Confirm & Execute"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
