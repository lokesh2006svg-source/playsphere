import Match from "../models/Match.js";
import Tournament from "../models/Tournament.js";
import { isValidYoutubeUrl, extractVideoId } from "../utils/youtubeHelper.js";
import { triggerWebhook } from "../utils/webhookNotifier.js";

// @desc    Get all matches with optional filters
// @route   GET /api/matches
// @access  Public
export const getMatches = async (req, res) => {
  try {
    const { sport, status, tournamentId, matchLevel } = req.query;
    const query = {};

    if (sport && sport !== "All" && sport !== "All Sports") {
      query.sport = new RegExp(sport, "i");
    }
    if (status && status !== "All") {
      query.status = status;
    }
    if (tournamentId) {
      query.tournamentId = tournamentId;
    }
    if (matchLevel && matchLevel !== "All") {
      query.matchLevel = matchLevel;
    }

    const matches = await Match.find(query)
      .populate("team1Id", "name logo city")
      .populate("team2Id", "name logo city")
      .populate("winnerId", "name logo city")
      .populate("tournamentId", "name prizePool bannerUrl")
      .populate("venueId", "name address city")
      .populate("scorerId", "name email")
      .sort({ scheduledTime: -1 });

    res.json({ success: true, count: matches.length, matches });
  } catch (error) {
    console.error("Get matches error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch matches." });
  }
};

// @desc    Get single match by ID
// @route   GET /api/matches/:id
// @access  Public
export const getMatchById = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate({
        path: "team1Id",
        select: "name logo city stats members captainId bio",
        populate: [
          { path: "captainId", select: "name email city profilePhoto" },
          { path: "members.userId", select: "name email city profilePhoto" },
        ],
      })
      .populate({
        path: "team2Id",
        select: "name logo city stats members captainId bio",
        populate: [
          { path: "captainId", select: "name email city profilePhoto" },
          { path: "members.userId", select: "name email city profilePhoto" },
        ],
      })
      .populate("winnerId", "name logo city")
      .populate("tournamentId", "name prizePool bannerUrl organizerId")
      .populate("venueId")
      .populate("scorerId", "name email")
      .populate("officialBodyId", "name shortName logo website");

    if (!match) {
      return res.status(404).json({ message: "Match not found." });
    }

    res.json({ success: true, match });
  } catch (error) {
    console.error("Get match by ID error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch match details." });
  }
};

// @desc    Get currently live matches
// @route   GET /api/matches/live
// @access  Public
export const getLiveMatches = async (req, res) => {
  try {
    const matches = await Match.find({ status: "live" })
      .populate("team1Id", "name logo city")
      .populate("team2Id", "name logo city")
      .populate("tournamentId", "name prizePool")
      .populate("venueId", "name address city")
      .sort({ updatedAt: -1 });

    res.json({ success: true, count: matches.length, matches });
  } catch (error) {
    console.error("Get live matches error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch live matches." });
  }
};

// @desc    Get next upcoming match
// @route   GET /api/matches/next
// @access  Public
export const getNextMatch = async (req, res) => {
  try {
    const nextMatch = await Match.findOne({
      status: "scheduled",
      scheduledTime: { $gte: new Date() },
    })
      .populate("team1Id", "name logo city")
      .populate("team2Id", "name logo city")
      .populate("tournamentId", "name")
      .populate("venueId", "name city")
      .sort({ scheduledTime: 1 });

    res.json({ success: true, match: nextMatch || null });
  } catch (error) {
    console.error("Get next match error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch next match." });
  }
};

// @desc    Get matches scheduled for today
// @route   GET /api/matches/today
// @access  Public
export const getTodayMatches = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const matches = await Match.find({
      scheduledTime: { $gte: startOfDay, $lte: endOfDay },
    })
      .populate("team1Id", "name logo city")
      .populate("team2Id", "name logo city")
      .populate("tournamentId", "name")
      .populate("venueId", "name city")
      .sort({ scheduledTime: 1 });

    res.json({ success: true, count: matches.length, matches });
  } catch (error) {
    console.error("Get today matches error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch today's matches." });
  }
};

// @desc    Update live score (Strict Scorer/Organizer check + Socket.io broadcast)
// @route   PUT /api/matches/:id/score
// @access  Private (Scorer or Organizer only)
export const updateMatchScore = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id).populate("tournamentId");
    if (!match) {
      return res.status(404).json({ message: "Match not found." });
    }

    const userId = req.user._id.toString();
    const isAssignedScorer = match.scorerId && match.scorerId.toString() === userId;
    const isTournamentOrganizer =
      match.tournamentId &&
      match.tournamentId.organizerId &&
      match.tournamentId.organizerId.toString() === userId;
    const isAdmin = req.user.role === "admin";

    if (!isAssignedScorer && !isTournamentOrganizer && !isAdmin) {
      return res.status(403).json({
        message: "Forbidden: Only the assigned scorer or tournament organizer can update the score.",
      });
    }

    const { team1Score, team2Score, liveStatus, scoreDetail, status, winnerId, commentary } = req.body;

    const previousStatus = match.status;

    if (team1Score !== undefined) match.team1Score = String(team1Score);
    if (team2Score !== undefined) match.team2Score = String(team2Score);
    if (liveStatus !== undefined) match.liveStatus = liveStatus;
    if (winnerId !== undefined) match.winnerId = winnerId || null;
    if (status !== undefined) match.status = status;

    if (scoreDetail) {
      match.scoreDetail = { ...match.scoreDetail, ...scoreDetail };
    }

    if (commentary) {
      const timeline = match.scoreDetail?.timeline || [];
      timeline.unshift({
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        text: commentary,
      });
      match.scoreDetail = { ...match.scoreDetail, timeline };
    }

    await match.save();

    const populatedMatch = await Match.findById(match._id)
      .populate("team1Id", "name logo city")
      .populate("team2Id", "name logo city")
      .populate("winnerId", "name logo city");

    // Real-time Broadcast via Socket.io to room `match_<id>`
    const io = req.app.get("io");
    if (io) {
      io.to(`match_${match._id}`).emit("scoreUpdate", {
        matchId: match._id,
        team1Score: match.team1Score,
        team2Score: match.team2Score,
        liveStatus: match.liveStatus,
        status: match.status,
        scoreDetail: match.scoreDetail,
        winnerId: match.winnerId,
        match: populatedMatch,
      });
    }

    // Trigger webhook if match just went live
    if (previousStatus !== "live" && match.status === "live") {
      triggerWebhook("match_live", {
        matchId: match._id,
        sport: match.sport,
        team1: populatedMatch.team1Id?.name,
        team2: populatedMatch.team2Id?.name,
        liveStreamUrl: match.liveStreamUrl,
      });
    }

    res.json({
      success: true,
      message: "Score updated and broadcasted in real time.",
      match: populatedMatch,
    });
  } catch (error) {
    console.error("Update score error:", error);
    res.status(500).json({ message: error.message || "Failed to update score." });
  }
};

// @desc    Assign a scorer to a match
// @route   PUT /api/matches/:id/assign-scorer
// @access  Private (Organizer only)
export const assignScorer = async (req, res) => {
  try {
    const { scorerId } = req.body;
    const match = await Match.findById(req.params.id).populate("tournamentId");

    if (!match) {
      return res.status(404).json({ message: "Match not found." });
    }

    const userId = req.user._id.toString();
    const isOrganizer =
      match.tournamentId &&
      match.tournamentId.organizerId &&
      match.tournamentId.organizerId.toString() === userId;
    const isAdmin = req.user.role === "admin";

    if (!isOrganizer && !isAdmin) {
      return res.status(403).json({ message: "Only the tournament organizer can assign a scorer." });
    }

    match.scorerId = scorerId;
    await match.save();

    res.json({
      success: true,
      message: "Scorer assigned successfully.",
      scorerId: match.scorerId,
    });
  } catch (error) {
    console.error("Assign scorer error:", error);
    res.status(500).json({ message: error.message || "Failed to assign scorer." });
  }
};

// @desc    Set and validate YouTube stream URL
// @route   PUT /api/matches/:id/stream-link
// @access  Private (Scorer / Organizer)
export const updateStreamLink = async (req, res) => {
  try {
    const { liveStreamUrl } = req.body;

    if (liveStreamUrl && !isValidYoutubeUrl(liveStreamUrl)) {
      return res.status(400).json({
        message: "Invalid YouTube URL. Please provide a valid YouTube video or live stream link (e.g. youtube.com/watch?v=... or youtu.be/...).",
      });
    }

    const videoId = liveStreamUrl ? extractVideoId(liveStreamUrl) : "";

    const match = await Match.findByIdAndUpdate(
      req.params.id,
      {
        liveStreamUrl: liveStreamUrl || "",
        videoId: videoId || "",
      },
      { new: true }
    );

    if (!match) {
      return res.status(404).json({ message: "Match not found." });
    }

    res.json({
      success: true,
      message: "Live stream URL updated successfully.",
      liveStreamUrl: match.liveStreamUrl,
      videoId: match.videoId,
    });
  } catch (error) {
    console.error("Update stream link error:", error);
    res.status(500).json({ message: error.message || "Failed to update stream link." });
  }
};

// @desc    Admin check for broken / invalid live stream links
// @route   GET /api/matches/broken-links
// @access  Private (Admin)
export const getBrokenStreamLinks = async (req, res) => {
  try {
    const matchesWithStreams = await Match.find({
      liveStreamUrl: { $exists: true, $ne: "" },
    }).populate("team1Id team2Id");

    const broken = matchesWithStreams.filter((m) => !isValidYoutubeUrl(m.liveStreamUrl));

    res.json({
      success: true,
      count: broken.length,
      brokenMatches: broken,
    });
  } catch (error) {
    console.error("Check broken links error:", error);
    res.status(500).json({ message: error.message || "Failed to check stream links." });
  }
};
