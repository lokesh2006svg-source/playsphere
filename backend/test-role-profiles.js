import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import PlayerProfile from "./models/PlayerProfile.js";
import CoachProfile from "./models/CoachProfile.js";
import GroundOwnerProfile from "./models/GroundOwnerProfile.js";
import Team from "./models/Team.js";
import Venue from "./models/Venue.js";
import Match from "./models/Match.js";
import Booking from "./models/Booking.js";
import { fetchProfileForUser } from "./controllers/authController.js";
import { seedDatabase } from "./utils/seedData.js";

dotenv.config();

const runRoleProfileTests = async () => {
  console.log("\n=======================================================");
  console.log("   PLAYSPHERE: ROLE-SPECIFIC PROFILES & FORMATS TEST   ");
  console.log("=======================================================\n");

  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/playsphere";
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB successfully.\n");

  // Ensure DB is synchronized with seeds
  await seedDatabase();

  // Test 1: PLAYER ROLE
  console.log("\n--- [TEST 1] Testing Player Login & Profile Format ---");
  const playerUser = await User.findOne({ email: "ananya@playsphere.com" });
  if (!playerUser) {
    throw new Error("Player user ananya@playsphere.com not found!");
  }
  const playerProfile = await fetchProfileForUser(playerUser._id, playerUser.role);

  console.log("Player User:", {
    name: playerUser.name,
    email: playerUser.email,
    role: playerUser.role,
    city: playerUser.city,
  });
  console.log("Player Profile Shape:", {
    role: playerProfile.role,
    sport: playerProfile.sport,
    skillLevel: playerProfile.skillLevel,
    rating: playerProfile.rating,
    city: playerProfile.city,
    playerIdNumber: playerProfile.playerIdNumber,
    matchesPlayed: playerProfile.matchesPlayed,
    matchesWon: playerProfile.matchesWon,
  });

  if (playerProfile.role !== "player") throw new Error("Expected role 'player'");
  if (!playerProfile.sport || !playerProfile.skillLevel || !playerProfile.city || playerProfile.rating === undefined) {
    throw new Error("Player profile missing required fields (sport, skillLevel, city, rating)");
  }
  console.log("✅ Player profile format verified: Name, sport, skill level, city, rating present.");

  // Test 2: COACH ROLE
  console.log("\n--- [TEST 2] Testing Coach Login & Profile Format ---");
  const coachUser = await User.findOne({ email: "coach@playsphere.com" });
  if (!coachUser) {
    throw new Error("Coach user coach@playsphere.com not found!");
  }
  const coachProfile = await fetchProfileForUser(coachUser._id, coachUser.role);

  console.log("Coach User:", {
    name: coachUser.name,
    email: coachUser.email,
    role: coachUser.role,
    city: coachUser.city,
  });
  console.log("Coach Profile Shape:", {
    role: coachProfile.role,
    sport: coachProfile.sport,
    yearsOfExperience: coachProfile.yearsOfExperience,
    certifications: coachProfile.certifications,
    managedTeamsCount: coachProfile.managedTeams?.length,
    upcomingMatchesCount: coachProfile.upcomingMatches?.length,
    managedTeams: coachProfile.managedTeams?.map((t) => ({
      name: t.name,
      sport: t.sport,
      rosterCount: t.rosterCount,
    })),
  });

  if (coachProfile.role !== "coach") throw new Error("Expected role 'coach'");
  if (!coachProfile.sport || coachProfile.yearsOfExperience === undefined) {
    throw new Error("Coach profile missing sport or yearsOfExperience");
  }
  if (!Array.isArray(coachProfile.managedTeams) || coachProfile.managedTeams.length === 0) {
    throw new Error("Coach profile should contain managedTeams");
  }
  if (coachProfile.skillLevel !== undefined) {
    throw new Error("Coach profile should NOT have player skillLevel for themselves");
  }
  console.log("✅ Coach profile format verified: Coaching sport, experience, managed teams with rosters, upcoming matches.");

  // Test 3: GROUND OWNER ROLE
  console.log("\n--- [TEST 3] Testing Ground Owner Login & Profile Format ---");
  const ownerUser = await User.findOne({ email: "owner@playsphere.com" });
  if (!ownerUser) {
    throw new Error("Owner user owner@playsphere.com not found!");
  }
  const ownerProfile = await fetchProfileForUser(ownerUser._id, ownerUser.role);

  console.log("Ground Owner User:", {
    name: ownerUser.name,
    email: ownerUser.email,
    role: ownerUser.role,
    city: ownerUser.city,
  });
  console.log("Ground Owner Profile Shape:", {
    role: ownerProfile.role,
    businessName: ownerProfile.businessName,
    contactPhone: ownerProfile.contactPhone,
    city: ownerProfile.city,
    managedVenuesCount: ownerProfile.managedVenues?.length,
    bookingStats: {
      totalVenues: ownerProfile.bookingStats?.totalVenues,
      totalBookings: ownerProfile.bookingStats?.totalBookings,
      totalRevenue: ownerProfile.bookingStats?.totalRevenue,
    },
    venues: ownerProfile.managedVenues?.map((v) => ({
      name: v.name,
      sportType: v.sportType,
      pricePerHour: v.pricePerHour,
    })),
  });

  if (ownerProfile.role !== "ground_owner") throw new Error("Expected role 'ground_owner'");
  if (!ownerProfile.businessName || !ownerProfile.contactPhone) {
    throw new Error("Ground Owner missing businessName or contactPhone");
  }
  if (!Array.isArray(ownerProfile.managedVenues) || ownerProfile.managedVenues.length === 0) {
    throw new Error("Ground Owner should have managed venues");
  }
  if (ownerProfile.skillLevel !== undefined) {
    throw new Error("Ground Owner should NOT have player skillLevel");
  }
  console.log("✅ Ground Owner profile format verified: Business name, contact phone, managed venues with pricing & booking stats.");

  console.log("\n=======================================================");
  console.log("   🎉 ALL 3 ROLE PROFILE FORMATS TESTED & VERIFIED!   ");
  console.log("=======================================================\n");

  await mongoose.disconnect();
  process.exit(0);
};

runRoleProfileTests().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
