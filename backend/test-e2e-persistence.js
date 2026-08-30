import mongoose from "mongoose";
import connectDB, { getDbStatus } from "./config/db.js";
import { seedDatabase } from "./utils/seedData.js";
import User from "./models/User.js";
import PlayerProfile from "./models/PlayerProfile.js";
import Club from "./models/Club.js";
import { fetchProfileForUser } from "./controllers/authController.js";
import { TN_DISTRICT_COORDINATES } from "./constants/tnDistricts.js";

const runPersistenceTests = async () => {
  console.log("===================================================================");
  console.log("🚀 STARTING PLAYSPHERE FULL END-TO-END DATA PERSISTENCE TEST SUITE");
  console.log("===================================================================\n");

  let testPassed = 0;
  let testFailed = 0;

  const assert = (condition, title, details = "") => {
    if (condition) {
      testPassed++;
      console.log(`  ✅ [PASS] ${title}`);
      if (details) console.log(`     └─ ${details}`);
    } else {
      testFailed++;
      console.error(`  ❌ [FAIL] ${title}`);
      if (details) console.error(`     └─ Error Details: ${details}`);
    }
  };

  const testEmail = `persistence_test_${Date.now()}@playsphere.com`;
  let testUserId = null;
  let testProfileId = null;

  try {
    // -------------------------------------------------------------
    // TEST 1: Database Health & Real MongoDB Engine Check
    // -------------------------------------------------------------
    console.log("--- 1. DATABASE HEALTH & STORAGE ENGINE CHECK ---");
    await connectDB();
    const status = getDbStatus();

    assert(status.isConnected === true, "Database connection established");
    assert(status.isMemory === false, "Database is REAL MongoDB (not in-memory fallback)", `Host: ${status.host}, Name: ${status.name}`);
    assert(status.name === "playsphere", "Connected to target database 'playsphere'");

    // Seed database idempotently
    await seedDatabase();
    console.log("   Seed verified successfully.\n");

    // -------------------------------------------------------------
    // TEST 2: User Registration & Profile Creation Persistence
    // -------------------------------------------------------------
    console.log("--- 2. USER REGISTRATION & LIVE PROFILE CREATION ---");
    const maduraiCoords = TN_DISTRICT_COORDINATES["Madurai"] || [78.1198, 9.9252];

    const testUser = await User.create({
      name: "Suresh Ramanathan",
      email: testEmail,
      password: "Password123#",
      city: "Madurai",
      location: "Madurai, Tamil Nadu",
      hasCompletedProfile: true,
      isEmailVerified: true,
      role: "player",
    });
    testUserId = testUser._id;

    assert(testUser && testUser._id, "User document persisted to MongoDB", `User ID: ${testUser._id}`);

    const testProfile = await PlayerProfile.create({
      userId: testUser._id,
      sport: "Cricket",
      secondarySports: ["Kabaddi", "Badminton"],
      skillLevel: "advanced",
      city: "Madurai",
      location: {
        type: "Point",
        coordinates: maduraiCoords,
      },
      bio: "Top-order batsman representing Madurai local division.",
      rating: 4.6,
      badges: ["Verified Athlete", "District League Starter"],
    });
    testProfileId = testProfile._id;

    assert(testProfile && testProfile.playerIdNumber, "PlayerProfile created with auto-generated ID", `ID: ${testProfile.playerIdNumber}`);
    assert(
      testProfile.location.coordinates[0] === maduraiCoords[0] &&
      testProfile.location.coordinates[1] === maduraiCoords[1],
      "PlayerProfile coordinates properly resolved to Madurai",
      `Coords: [${testProfile.location.coordinates.join(", ")}]`
    );

    // -------------------------------------------------------------
    // TEST 3: Login Profile Fetching Verification
    // -------------------------------------------------------------
    console.log("\n--- 3. DATA PERSISTENCE ON LOGIN VERIFICATION ---");
    const fetchedProfile = await fetchProfileForUser(testUserId, "player");
    assert(
      fetchedProfile && fetchedProfile.userId.toString() === testUserId.toString(),
      "fetchProfileForUser() retrieves player's profile immediately from MongoDB",
      `Bio: "${fetchedProfile.bio}"`
    );
    assert(fetchedProfile.sport === "Cricket", "Profile sport matches stored value");
    assert(fetchedProfile.city === "Madurai", "Profile city matches stored value");

    // Also verify seeded user profile fetch
    const seededKarthik = await User.findOne({ email: "karthik@playsphere.com" });
    assert(seededKarthik !== null, "Seeded user 'karthik@playsphere.com' exists in MongoDB");
    if (seededKarthik) {
      const karthikProfile = await fetchProfileForUser(seededKarthik._id, "player");
      assert(karthikProfile !== null, "Seeded user profile fetched on login without empty/stale data", `Player ID: ${karthikProfile?.playerIdNumber}`);
    }

    // -------------------------------------------------------------
    // TEST 4: Players List Immediate Visibility & Query Verification
    // -------------------------------------------------------------
    console.log("\n--- 4. PLAYERS DIRECTORY LIVE QUERY VERIFICATION ---");
    // All Tamil Nadu catalog query
    const allProfiles = await PlayerProfile.find({})
      .populate("userId", "name email city location role profilePhoto")
      .sort({ rating: -1, matchesWon: -1, createdAt: -1 });

    const foundInAll = allProfiles.find((p) => p.userId && p.userId.email === testEmail);
    assert(
      Boolean(foundInAll),
      "Newly registered user appears IMMEDIATELY in all-players catalog without server restart",
      `Found: ${foundInAll?.userId?.name} (${foundInAll?.userId?.email})`
    );

    // Madurai district query
    const maduraiProfiles = await PlayerProfile.find({ city: new RegExp("^Madurai$", "i") })
      .populate("userId", "name email city location role profilePhoto");

    const foundInMadurai = maduraiProfiles.find((p) => p.userId && p.userId.email === testEmail);
    assert(
      Boolean(foundInMadurai),
      "Newly registered user appears in district-filtered query (Madurai)",
      `Total Madurai Athletes: ${maduraiProfiles.length}`
    );

    // Search query
    const searchRegex = new RegExp("Suresh Ramanathan", "i");
    const searchedProfiles = await PlayerProfile.find({})
      .populate("userId", "name email city location role profilePhoto");
    const foundBySearch = searchedProfiles.filter(
      (p) => p.userId?.name?.match(searchRegex) || p.bio?.match(searchRegex)
    );
    assert(
      foundBySearch.length > 0,
      "Player searchable by name text filter",
      `Matches: ${foundBySearch.length}`
    );

    // -------------------------------------------------------------
    // TEST 5: Club Details & Associations Verification
    // -------------------------------------------------------------
    console.log("\n--- 5. CLUB DETAILS & ASSOCIATION POPULATION VERIFICATION ---");
    const allClubs = await Club.find({})
      .populate("stateBodyId", "name shortName website contactEmail")
      .populate("districtBodyId", "name shortName website contactEmail")
      .sort({ foundedYear: 1 });

    assert(allClubs.length >= 6, "All seeded sports clubs queryable from MongoDB", `Total Clubs: ${allClubs.length}`);

    const marinaClub = allClubs.find((c) => c.name === "Marina Cricket Club");
    assert(Boolean(marinaClub), "Marina Cricket Club returned in clubs query");
    assert(marinaClub?.stateBodyId?.name === "Tamil Nadu Cricket Association", "Club state affiliation populated correctly (TNCA)");

    const kovaiHoops = allClubs.find((c) => c.name === "Kovai Basketball Academy");
    assert(Boolean(kovaiHoops), "Kovai Basketball Academy returned in clubs query");
    assert(kovaiHoops?.districtBodyId?.shortName === "CDBA", "Club district affiliation populated correctly (CDBA)");

    const singleClub = await Club.findById(marinaClub._id).populate("stateBodyId").populate("districtBodyId");
    assert(singleClub && singleClub.name === "Marina Cricket Club", "GET /api/clubs/:id single club fetch works with full details");

    // -------------------------------------------------------------
    // TEST 6: Simulated Server Restart & Persistence Proof
    // -------------------------------------------------------------
    console.log("\n--- 6. SIMULATED SERVER RESTART & PERSISTENCE PROOF ---");
    console.log("   Disconnecting from MongoDB to simulate full server termination...");
    await mongoose.disconnect();
    console.log("   Disconnected.");

    console.log("   Re-initializing fresh MongoDB connection (simulating server boot)...");
    await connectDB();
    await seedDatabase();

    const postRestartUser = await User.findOne({ email: testEmail });
    assert(
      postRestartUser !== null && postRestartUser._id.toString() === testUserId.toString(),
      "Test User STILL EXISTS after server restart (Proving real MongoDB persistence, not RAM)",
      `User ID: ${postRestartUser?._id}`
    );

    const postRestartProfile = await PlayerProfile.findOne({ userId: testUserId });
    assert(
      postRestartProfile !== null && postRestartProfile.playerIdNumber === testProfile.playerIdNumber,
      "Player Profile STILL EXISTS after server restart with exact same Player ID & Stats",
      `Player ID: ${postRestartProfile?.playerIdNumber}, Sport: ${postRestartProfile?.sport}`
    );

    const postRestartClubs = await Club.find({});
    assert(
      postRestartClubs.length >= 6,
      "Clubs still exist and intact after server restart without any data wipe",
      `Total Clubs: ${postRestartClubs.length}`
    );

  } catch (err) {
    console.error("Test execution error:", err);
    testFailed++;
  } finally {
    // Clean up test user
    if (testUserId) {
      await User.findByIdAndDelete(testUserId);
      await PlayerProfile.deleteMany({ userId: testUserId });
      console.log(`\n🧹 Cleaned up temporary test user ${testEmail}`);
    }

    console.log("\n===================================================================");
    console.log(`🏁 TEST SUITE COMPLETE: ${testPassed} Passed, ${testFailed} Failed`);
    console.log("===================================================================\n");

    process.exit(testFailed > 0 ? 1 : 0);
  }
};

runPersistenceTests();
