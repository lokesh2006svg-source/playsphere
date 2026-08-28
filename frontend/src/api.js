import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Sends and receives httpOnly refresh token cookies automatically
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: Attach JWT access token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("playsphere_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Concurrency lock and retry queue for seamless token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor: Automatic token rotation & transparent request replay
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Trigger refresh only on 401 Unauthorized for protected endpoints
    if (error.response?.status === 401 && !originalRequest._retry) {
      const isAuthUrl =
        originalRequest.url?.includes("/auth/login") ||
        originalRequest.url?.includes("/auth/register") ||
        originalRequest.url?.includes("/auth/refresh-token") ||
        originalRequest.url?.includes("/auth/verify-email");

      if (isAuthUrl) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshRes = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        if (refreshRes.data.success && refreshRes.data.token) {
          const newToken = refreshRes.data.token;
          localStorage.setItem("playsphere_token", newToken);
          api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem("playsphere_token");
        localStorage.removeItem("playsphere_user");
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// ==========================================
// 1. AUTH & SESSION
// ==========================================
export const registerUser = (data) => api.post("/auth/register", data);
export const loginUser = (data) => api.post("/auth/login", data);
export const verifyEmail = (data) => api.post("/auth/verify-email", data);
export const resendVerificationCode = (data) => api.post("/auth/resend-verification", data);
export const fetchCurrentUser = () => api.get("/auth/me");
export const refreshToken = () => api.post("/auth/refresh-token");
export const logoutUser = () => api.post("/auth/logout");
export const logoutAllDevices = () => api.post("/auth/logout-all");

// ==========================================
// 2. PROFILE & PLAYER CARDS
// ==========================================
export const saveProfile = (data) => api.post("/profile", data);
export const fetchProfileByUserId = (userId) => api.get(`/profile/${userId}`);
export const fetchPublicProfile = (userId) => api.get(`/profile/public/${userId}`);
export const fetchPlayerCard = (userId) => api.get(`/profile/${userId}/card`);
export const updatePlayerLocation = (data) => api.put("/profile/location", data);
export const updatePlayerBadges = (data) => api.put("/profile/badges", data);
export const uploadProfilePhoto = (formData) =>
  api.post("/profile/upload-photo", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const deleteProfilePhoto = () => api.delete("/profile/photo");

// ==========================================
// 3. SPORTS
// ==========================================
export const fetchSports = () => api.get("/sports");
export const fetchSportsList = () => api.get("/sports");
export const fetchSportsStats = () => api.get("/sports/stats");

// ==========================================
// 4. PLAYERS & LEADERBOARDS
// ==========================================
export const fetchPlayers = (params) => api.get("/players", { params });
export const fetchNearbyPlayers = (params) => api.get("/players", { params });
export const fetchLeaderboard = (params) => api.get("/players/leaderboard", { params });

// ==========================================
// 5. VENUES & TURF BOOKINGS
// ==========================================
export const fetchVenues = (params) => api.get("/venues", { params });
export const fetchVenueById = (id) => api.get(`/venues/${id}`);
export const fetchVenueAvailability = (id, date) => api.get(`/venues/${id}/availability?date=${date}`);
export const bookVenue = (data) => api.post("/bookings", data);
export const generatePaymentQR = (bookingId) => api.post(`/bookings/${bookingId}/generate-payment-qr`);
export const generateBookingPaymentQR = (bookingId) => api.post(`/bookings/${bookingId}/generate-payment-qr`);
export const confirmBookingPayment = (bookingId, data) => api.post(`/bookings/${bookingId}/confirm-payment`, data);
export const fetchMyBookings = () => api.get("/bookings/my");
export const cancelMyBooking = (id) => api.delete(`/bookings/${id}`);

// ==========================================
// 6. TEAMS & INVITES
// ==========================================
export const fetchTeams = (params) => api.get("/teams", { params });
export const fetchTeamById = (id) => api.get(`/teams/${id}`);
export const createNewTeam = (data) => api.post("/teams", data);
export const joinTeamWithCode = (inviteCode) => api.post("/teams/join", { inviteCode });
export const inviteMemberToTeam = (teamId, data) => api.post(`/teams/${teamId}/invite`, data);
export const removeMemberFromTeam = (teamId, memberId) => api.delete(`/teams/${teamId}/members/${memberId}`);
export const fetchMyTeamInvites = () => api.get("/invites/my");
export const respondTeamInvite = (inviteId, data) =>
  api.post(
    `/invites/${inviteId}/respond`,
    typeof data === "string" ? { action: data, status: data } : data
  );

// ==========================================
// 7. TOURNAMENTS
// ==========================================
export const fetchTournaments = (params) => api.get("/tournaments", { params });
export const fetchTournamentById = (id) => api.get(`/tournaments/${id}`);
export const createNewTournament = (data) => api.post("/tournaments", data);
export const registerTeamForTournament = (id, data) => api.post(`/tournaments/${id}/register`, data);
export const registerTournamentTeam = (id, data) => api.post(`/tournaments/${id}/register`, data);
export const generateTournamentBracket = (id) => api.post(`/tournaments/${id}/generate-bracket`);

// ==========================================
// 8. MATCHES & LIVE SCORES
// ==========================================
export const fetchMatches = (params) => api.get("/matches", { params });
export const fetchLiveMatches = () => api.get("/matches/live");
export const fetchTodayMatches = () => api.get("/matches?filter=today");
export const fetchNextMatch = () => api.get("/matches?filter=upcoming&limit=1");
export const fetchMatchById = (id) => api.get(`/matches/${id}`);
export const updateMatchScore = (id, data) => api.put(`/matches/${id}/score`, data);
export const updateMatchStreamLink = (id, data) => api.put(`/matches/${id}/stream-link`, data);

// ==========================================
// 9. GAME RULES & AI CHATBOT
// ==========================================
export const fetchGameRules = (params) => api.get("/rules", { params });
export const fetchRules = (params) => api.get("/rules", { params });
export const fetchGameRuleBySport = (sport) => api.get(`/rules/${sport}`);
export const askSportsChatbot = (query) => api.post("/chatbot/ask", { query });
export const askRulesChatbot = (query) => api.post("/chatbot/ask", { query });

// ==========================================
// 10. OFFICIAL BODIES & CLUBS
// ==========================================
export const fetchOfficialBodies = (params) => api.get("/official-bodies", { params });
export const fetchOfficialBodyById = (id) => api.get(`/official-bodies/${id}`);
export const fetchClubs = (params) => api.get("/clubs", { params });
export const fetchClubById = (id) => api.get(`/clubs/${id}`);
export const createNewClub = (data) => api.post("/clubs", data);

// ==========================================
// 11. NOTIFICATIONS & INVITE CODES
// ==========================================
export const fetchNotifications = () => api.get("/notifications");
export const markNotificationRead = (id) => api.put(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.put("/notifications/mark-all-read");
export const generateInviteCode = (data) => api.post("/invites/generate", data);
export const fetchInviteDetails = (code) => api.get(`/invites/${code}`);
export const redeemInvite = (code) => api.post(`/invites/${code}/redeem`);

// ==========================================
// 12. ADMIN MANAGEMENT & SECURITY
// ==========================================
export const fetchAdminOverview = () => api.get("/admin/overview");
export const fetchAdminVenues = (params) => api.get("/admin/venues", { params });
export const createAdminVenue = (data) => api.post("/admin/venues", data);
export const updateAdminVenue = (id, data) => api.put(`/admin/venues/${id}`, data);
export const deleteAdminVenue = (id, adminPassword) =>
  api.delete(`/admin/venues/${id}`, { data: { adminPassword } });

export const fetchAdminMatches = (params) => api.get("/admin/matches", { params });
export const createAdminMatch = (data) => api.post("/admin/matches", data);
export const updateAdminMatch = (id, data) => api.put(`/admin/matches/${id}`, data);
export const deleteAdminMatch = (id) => api.delete(`/admin/matches/${id}`);
export const fetchBrokenStreamLinks = () => api.get("/admin/broken-links");

// Super Admin Only Operations
export const fetchPlatformStats = () => api.get("/admin/stats");
export const fetchAdminUsers = (params) => api.get("/admin/users", { params });
export const updateUserRole = (id, role, adminPassword) =>
  api.put(`/admin/users/${id}/role`, { role, adminPassword });
export const deleteAdminUser = (id, adminPassword) =>
  api.delete(`/admin/users/${id}`, { data: { adminPassword } });

export const fetchSyncStatus = () => api.get("/admin/sync-status");
export const triggerSyncNow = () => api.post("/admin/trigger-sync");
export const fetchAuditLogs = (params) => api.get("/admin/audit-logs", { params });

export default api;
