import Tournament from "../models/Tournament.js";
import TournamentRegistration from "../models/TournamentRegistration.js";
import Match from "../models/Match.js";
import Team from "../models/Team.js";
import Notification from "../models/Notification.js";
import { triggerWebhook } from "../utils/webhookNotifier.js";

// @desc    Create a new tournament
// @route   POST /api/tournaments
// @access  Private
export const createTournament = async (req, res) => {
  try {
    const {
      name,
      sport,
      description,
      format = "knockout",
      startDate,
      endDate,
      registrationDeadline,
      venueId,
      city,
      maxTeams = 8,
      prizePool,
      entryFee,
      rules,
      bannerUrl,
      officialBodyId,
    } = req.body;

    if (!name || !sport || !startDate || !endDate) {
      return res.status(400).json({
        message: "Please provide tournament name, sport, startDate, and endDate.",
      });
    }

    const targetCity = city || "Chennai";
    const existingTournament = await Tournament.findOne({
      name: new RegExp(`^${name.trim()}$`, "i"),
      city: new RegExp(`^${targetCity.trim()}$`, "i"),
      sport: new RegExp(`^${sport.trim()}$`, "i"),
    });

    if (existingTournament) {
      return res.status(409).json({
        success: false,
        message: `A tournament named "${name.trim()}" for ${sport} already exists in ${targetCity}.`,
      });
    }

    const tournament = await Tournament.create({
      name: name.trim(),
      sport: sport.trim(),
      description: description || "",
      format,
      startDate,
      endDate,
      registrationDeadline: registrationDeadline || startDate,
      venueId: venueId || null,
      city: city || req.user.city || "Chennai",
      maxTeams: Number(maxTeams) || 8,
      prizePool: prizePool || "₹25,000 + Trophy",
      entryFee: entryFee || 0,
      rules: rules || [],
      bannerUrl: bannerUrl || "",
      organizerId: req.user._id,
      officialBodyId: officialBodyId || null,
      status: "registration_open",
    });

    res.status(201).json({
      success: true,
      message: "Tournament created successfully!",
      tournament,
    });
  } catch (error) {
    console.error("Create tournament error:", error);
    res.status(500).json({ message: error.message || "Failed to create tournament." });
  }
};

// @desc    Get all tournaments with filtering
// @route   GET /api/tournaments
// @access  Public
export const getTournaments = async (req, res) => {
  try {
    const { sport, city, status, format, search } = req.query;
    const query = {};

    if (sport && sport !== "All" && sport !== "All Sports") {
      query.sport = new RegExp(sport, "i");
    }
    if (city && city !== "All") {
      query.city = new RegExp(city, "i");
    }
    if (status && status !== "All") {
      query.status = status;
    }
    if (format && format !== "All") {
      query.format = format;
    }
    if (search) {
      query.name = new RegExp(search, "i");
    }

    const tournaments = await Tournament.find(query)
      .populate("organizerId", "name email")
      .populate("venueId", "name address city")
      .populate("officialBodyId", "name shortName logo")
      .sort({ startDate: 1 });

    // Fetch registered team counts for each tournament
    const tournamentIds = tournaments.map((t) => t._id);
    const registrations = await TournamentRegistration.find({
      tournamentId: { $in: tournamentIds },
      status: "approved",
    });

    const regCounts = {};
    registrations.forEach((r) => {
      regCounts[r.tournamentId] = (regCounts[r.tournamentId] || 0) + 1;
    });

    const enhancedTournaments = tournaments.map((t) => {
      const plain = t.toObject();
      plain.registeredTeamsCount = regCounts[t._id] || 0;
      return plain;
    });

    res.json({
      success: true,
      count: enhancedTournaments.length,
      tournaments: enhancedTournaments,
    });
  } catch (error) {
    console.error("Get tournaments error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch tournaments." });
  }
};

// @desc    Get single tournament details
// @route   GET /api/tournaments/:id
// @access  Public
export const getTournamentById = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate("organizerId", "name email city")
      .populate("venueId")
      .populate("officialBodyId");

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found." });
    }

    const registrations = await TournamentRegistration.find({
      tournamentId: tournament._id,
      status: "approved",
    }).populate({
      path: "teamId",
      populate: [
        { path: "captainId", select: "name email city profilePhoto" },
        { path: "members.userId", select: "name email city profilePhoto" },
      ],
    });

    const matches = await Match.find({ tournamentId: tournament._id })
      .populate("team1Id", "name logo city")
      .populate("team2Id", "name logo city")
      .populate("winnerId", "name logo")
      .sort({ round: 1, matchOrder: 1 });

    res.json({
      success: true,
      tournament,
      registeredTeams: registrations.map((r) => r.teamId).filter(Boolean),
      matches,
    });
  } catch (error) {
    console.error("Get tournament by ID error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch tournament." });
  }
};

// @desc    Register a team for a tournament
// @route   POST /api/tournaments/:id/register
// @access  Private
export const registerForTournament = async (req, res) => {
  try {
    const { teamId } = req.body;
    const tournamentId = req.params.id;

    if (!teamId) {
      return res.status(400).json({ message: "teamId is required." });
    }

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found." });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found." });
    }

    // Verify current user is captain or member
    const isMember = team.members.some(
      (m) => m.userId.toString() === req.user._id.toString()
    );
    if (!isMember && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only team members can register the team." });
    }

    // Check existing registration
    const existing = await TournamentRegistration.findOne({ tournamentId, teamId });
    if (existing) {
      return res.status(400).json({ message: "This team is already registered for this tournament." });
    }

    // Check capacity
    const currentCount = await TournamentRegistration.countDocuments({
      tournamentId,
      status: "approved",
    });
    if (currentCount >= tournament.maxTeams) {
      return res.status(400).json({ message: "Tournament has reached maximum team capacity." });
    }

    const registration = await TournamentRegistration.create({
      tournamentId,
      teamId,
      registeredBy: req.user._id,
      status: "approved",
      seedNumber: currentCount + 1,
    });

    // Create Notification
    await Notification.create({
      userId: req.user._id,
      type: "tournament_registered",
      title: "Tournament Registration Confirmed! 🏆",
      message: `Team '${team.name}' is successfully registered for '${tournament.name}'.`,
      link: `/tournaments/${tournament._id}`,
    });

    res.status(201).json({
      success: true,
      message: "Team registered successfully!",
      registration,
    });
  } catch (error) {
    console.error("Register tournament error:", error);
    res.status(500).json({ message: error.message || "Failed to register for tournament." });
  }
};

// @desc    Generate automated knockout tournament bracket
// @route   POST /api/tournaments/:id/generate-bracket
// @access  Private (Organizer only)
export const generateBracket = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found." });
    }

    if (
      tournament.organizerId.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Only tournament organizer can generate bracket." });
    }

    const registrations = await TournamentRegistration.find({
      tournamentId: tournament._id,
      status: "approved",
    }).populate("teamId");

    const teams = registrations.map((r) => r.teamId).filter(Boolean);

    if (teams.length < 2) {
      return res.status(400).json({
        message: "At least 2 registered teams are required to generate a bracket.",
      });
    }

    // Remove any previously generated matches for this tournament
    await Match.deleteMany({ tournamentId: tournament._id });

    // Shuffle teams for randomized pairing
    const shuffledTeams = [...teams].sort(() => 0.5 - Math.random());

    const createdMatches = [];
    const numMatchesRound1 = Math.floor(shuffledTeams.length / 2);

    for (let i = 0; i < numMatchesRound1; i++) {
      const team1 = shuffledTeams[i * 2];
      const team2 = shuffledTeams[i * 2 + 1];

      if (team1 && team2) {
        const match = await Match.create({
          tournamentId: tournament._id,
          sport: tournament.sport,
          team1Id: team1._id,
          team2Id: team2._id,
          round: 1, // Round 1 / Quarterfinals
          matchOrder: i + 1,
          team1Score: "0",
          team2Score: "0",
          status: "scheduled",
          scheduledTime: new Date(tournament.startDate.getTime() + i * 2 * 60 * 60 * 1000),
          liveStatus: "Scheduled",
          scorerId: tournament.organizerId,
          venueId: tournament.venueId || null,
          title: `Match ${i + 1} - Round 1`,
        });
        createdMatches.push(match);
      }
    }

    tournament.status = "ongoing";
    await tournament.save();

    const populatedMatches = await Match.find({ tournamentId: tournament._id })
      .populate("team1Id", "name logo city")
      .populate("team2Id", "name logo city");

    res.json({
      success: true,
      message: `Generated ${createdMatches.length} bracket matches.`,
      matches: populatedMatches,
    });
  } catch (error) {
    console.error("Generate bracket error:", error);
    res.status(500).json({ message: error.message || "Failed to generate bracket." });
  }
};

// @desc    Get visual bracket tree for a tournament
// @route   GET /api/tournaments/:id/bracket
// @access  Public
export const getBracket = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found." });
    }

    const matches = await Match.find({ tournamentId: tournament._id })
      .populate("team1Id", "name logo city")
      .populate("team2Id", "name logo city")
      .populate("winnerId", "name logo city")
      .sort({ round: 1, matchOrder: 1 });

    // Group matches by round (1: Quarterfinals, 2: Semifinals, 3: Finals)
    const rounds = {};
    matches.forEach((m) => {
      if (!rounds[m.round]) {
        rounds[m.round] = [];
      }
      rounds[m.round].push(m);
    });

    res.json({
      success: true,
      tournamentId: tournament._id,
      tournamentName: tournament.name,
      rounds,
      totalMatches: matches.length,
    });
  } catch (error) {
    console.error("Get bracket error:", error);
    res.status(500).json({ message: error.message || "Failed to get bracket." });
  }
};
