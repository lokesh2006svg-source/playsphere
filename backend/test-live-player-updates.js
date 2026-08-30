import mongoose from "mongoose";
import connectDB, { getDbStatus } from "./config/db.js";
import User from "./models/User.js";
import PlayerProfile from "./models/PlayerProfile.js";
import { fetchProfileForUser } from "./controllers/authController.js";
import { createOrUpdateProfile, getPlayerCard } from "./controllers/profileController.js";
import { getNearbyPlayers } from "./controllers/playerController.js";
import { TN_DISTRICT_COORDINATES } from "./constants/tnDistricts.js";

const runLiveUpdateTests = async () => {
  console.log("===================================================================");
  console.log("🚀 TESTING LIVE PLAYER DETAILS & AUTOMATIC MULTI-PAGE UPDATES");
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

  const testEmail = `live_update_test_${Date.now()}@playsphere.com`;
  let testUserId = null;

  try {
    await connectDB();

    // 1. Create a new athlete
    console.log("--- 1. INITIAL USER CREATION & LOGIN PROFILE CHECK ---");
    const user = await User.create({
      name: "Dhivya Narayanan",
      email: testEmail,
      password: "Password123#",
      city: "Madurai",
      location: "Madurai, Tamil Nadu",
      hasCompletedProfile: true,
      isEmailVerified: true,
      role: "player",
    });
    testUserId = user._id;

    const profile = await PlayerProfile.create({
      userId: user._id,
      sport: "Cricket",
      skillLevel: "advanced",
      city: "Madurai",
      location: {
        type: "Point",
        coordinates: TN_DISTRICT_COORDINATES["Madurai"] || [78.1198, 9.9252],
      },
      bio: "All-rounder in Madurai local cup.",
    });

    // Check GET /api/auth/me simulation
    const profileOnMe = await fetchProfileForUser(user._id, "player");
    assert(profileOnMe !== null, "GET /api/auth/me returns populated PlayerProfile");
    assert(profileOnMe.sport === "Cricket", "Initial profile sport is 'Cricket'");
    assert(profileOnMe.city === "Madurai", "Initial profile city is 'Madurai'");

    // Check GET /api/players before edit
    console.log("\n--- 2. INITIAL PLAYERS DIRECTORY QUERY ---");
    let reqMock = { query: { city: "All" }, user: { _id: user._id } };
    let resMockData = {};
    let resMock = {
      json: (data) => { resMockData = data; return resMock; },
      status: (code) => { resMock.statusCode = code; return resMock; },
    };

    await getNearbyPlayers(reqMock, resMock);
    let foundPlayer = resMockData.players?.find((p) => p.email === testEmail);

    assert(Boolean(foundPlayer), "Player visible in directory initially");
    assert(foundPlayer?.name === "Dhivya Narayanan", "Player name is 'Dhivya Narayanan'");
    assert(foundPlayer?.sport === "Cricket", "Player sport is 'Cricket'");
    assert(foundPlayer?.city === "Madurai", "Player city is 'Madurai'");

    // 3. Update profile: Change sport to 'Badminton', city to 'Coimbatore', name to 'Dhivya N.'
    console.log("\n--- 3. LIVE PROFILE EDIT & AUTO-SYNC TEST ---");
    let updateReqMock = {
      user: { _id: user._id },
      body: {
        name: "Dhivya N.",
        sport: "Badminton",
        secondarySports: ["Table Tennis"],
        city: "Coimbatore",
        skillLevel: "pro",
        bio: "State-level badminton champion and singles finalist.",
      },
    };
    let updateResData = {};
    let updateResMock = {
      json: (data) => { updateResData = data; return updateResMock; },
      status: (code) => { updateResMock.statusCode = code; return updateResMock; },
    };

    await createOrUpdateProfile(updateReqMock, updateResMock);

    assert(updateResData.success === true, "createOrUpdateProfile returned success: true");
    assert(updateResData.user?.name === "Dhivya N.", "Updated user object contains new name 'Dhivya N.'");
    assert(updateResData.profile?.sport === "Badminton", "Updated profile contains new sport 'Badminton'");
    assert(updateResData.profile?.city === "Coimbatore", "Updated profile contains new city 'Coimbatore'");

    // 4. Verify Digital Sports ID Card reflects changes immediately
    console.log("\n--- 4. DIGITAL SPORTS ID CARD REFLECTION CHECK ---");
    let cardReqMock = { params: { userId: user._id.toString() } };
    let cardResData = {};
    let cardResMock = {
      json: (data) => { cardResData = data; return cardResMock; },
      status: (code) => { cardResMock.statusCode = code; return cardResMock; },
    };

    await getPlayerCard(cardReqMock, cardResMock);
    assert(cardResData.success === true, "getPlayerCard returned success: true");
    assert(cardResData.card?.name === "Dhivya N.", "Card reflects updated name 'Dhivya N.' immediately");
    assert(cardResData.card?.sport === "Badminton", "Card reflects updated sport 'Badminton' immediately");
    assert(cardResData.card?.city === "Coimbatore", "Card reflects updated city 'Coimbatore' immediately");

    // 5. Verify Players Directory reflects changes immediately without server restart
    console.log("\n--- 5. PLAYERS DIRECTORY INSTANT SYNC CHECK ---");
    let refreshReqMock = { query: { city: "All" }, user: { _id: user._id } };
    let refreshResData = {};
    let refreshResMock = {
      json: (data) => { refreshResData = data; return refreshResMock; },
      status: (code) => { refreshResMock.statusCode = code; return refreshResMock; },
    };

    await getNearbyPlayers(refreshReqMock, refreshResMock);
    let updatedDirectoryPlayer = refreshResData.players?.find((p) => p.email === testEmail);

    assert(Boolean(updatedDirectoryPlayer), "Player still in directory after edit");
    assert(updatedDirectoryPlayer?.name === "Dhivya N.", "Directory shows updated name 'Dhivya N.' immediately");
    assert(updatedDirectoryPlayer?.sport === "Badminton", "Directory shows updated sport 'Badminton' immediately");
    assert(updatedDirectoryPlayer?.city === "Coimbatore", "Directory shows updated city 'Coimbatore' immediately");

    // Query Coimbatore filter specifically
    let cbeReqMock = { query: { city: "Coimbatore" }, user: { _id: user._id } };
    let cbeResData = {};
    let cbeResMock = {
      json: (data) => { cbeResData = data; return cbeResMock; },
      status: (code) => { cbeResMock.statusCode = code; return cbeResMock; },
    };
    await getNearbyPlayers(cbeReqMock, cbeResMock);
    let cbeFound = cbeResData.players?.find((p) => p.email === testEmail);
    assert(Boolean(cbeFound), "Player appears immediately in Coimbatore district filter after moving city");

  } catch (err) {
    console.error("Test error:", err);
    testFailed++;
  } finally {
    if (testUserId) {
      await User.findByIdAndDelete(testUserId);
      await PlayerProfile.deleteMany({ userId: testUserId });
      console.log(`\n🧹 Cleaned up temporary test user ${testEmail}`);
    }

    console.log("\n===================================================================");
    console.log(`🏁 LIVE UPDATE TEST COMPLETE: ${testPassed} Passed, ${testFailed} Failed`);
    console.log("===================================================================\n");

    process.exit(testFailed > 0 ? 1 : 0);
  }
};

runLiveUpdateTests();
