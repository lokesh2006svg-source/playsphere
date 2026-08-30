import mongoose from "mongoose";
import connectDB, { getDbStatus } from "./config/db.js";
import User from "./models/User.js";
import PlayerProfile from "./models/PlayerProfile.js";
import { register, login, getMe, fetchProfileForUser } from "./controllers/authController.js";
import { getNearbyPlayers } from "./controllers/playerController.js";
import { createOrUpdateProfile } from "./controllers/profileController.js";

const runFreshSignupRealtimeTest = async () => {
  console.log("===================================================================");
  console.log("🔥 TESTING FRESH SIGNUP → PERMANENT MONGODB → REAL-TIME VISIBILITY");
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

  const testEmail = `fresh_signup_user_${Date.now()}@playsphere.com`;
  let testUserId = null;

  try {
    await connectDB();

    // 1. CONFIRM DATABASE IS PERMANENT (NOT IN-MEMORY)
    console.log("--- 1. DATABASE HEALTH & STORAGE ENGINE CHECK ---");
    const dbStatus = getDbStatus();
    assert(dbStatus.isConnected === true, "Database is actively CONNECTED");
    assert(dbStatus.isMemory === false, "Database is REAL MongoDB (isMemory: false - Not temporary RAM fallback)", `Host: ${dbStatus.host}, DB Name: ${dbStatus.name}`);
    console.log(`     └─ Target Database Connection: ${dbStatus.host}/${dbStatus.name}`);

    // 2. SIMULATE FRESH SIGNUP (POST /api/auth/register)
    console.log("\n--- 2. SIGNUP → MONGO PERSISTENCE FLOW ---");
    const testPayload = {
      name: "Mithun Rangarajan",
      email: testEmail,
      password: "Password123#",
      city: "Trichy",
      sport: "Basketball",
      role: "player",
      accountType: "player",
    };

    let resData = {};
    let resStatus = 200;
    const reqMock = {
      body: testPayload,
      headers: { "user-agent": "AutomatedTestRunner/1.0" },
      ip: "127.0.0.1",
      app: { get: () => null },
    };
    const resMock = {
      status: (code) => { resStatus = code; return resMock; },
      json: (data) => { resData = data; return resMock; },
      cookie: () => resMock,
    };

    await register(reqMock, resMock);

    assert(resStatus === 201 && resData.success === true, "POST /api/auth/register returned HTTP 201 Created & success: true");
    testUserId = resData.user?._id;

    // Direct MongoDB Query: Users collection
    console.log("\n--- 3. DIRECT MONGODB QUERY INSPECTION (Users Collection) ---");
    const userInDb = await User.findById(testUserId).lean();
    assert(userInDb !== null, "User document persisted directly to MongoDB 'users' collection");
    console.log("     └─ User Document in MongoDB:", {
      _id: userInDb?._id?.toString(),
      name: userInDb?.name,
      email: userInDb?.email,
      city: userInDb?.city,
      role: userInDb?.role,
      hasCompletedProfile: userInDb?.hasCompletedProfile,
    });

    // Direct MongoDB Query: PlayerProfiles collection
    console.log("\n--- 4. DIRECT MONGODB QUERY INSPECTION (PlayerProfiles Collection) ---");
    const profileInDb = await PlayerProfile.findOne({ userId: testUserId }).lean();
    assert(profileInDb !== null, "PlayerProfile document persisted directly to MongoDB 'playerprofiles' collection");
    assert(profileInDb?.sport === "Basketball", "Linked PlayerProfile primary sport is 'Basketball'");
    assert(profileInDb?.city === "Trichy", "Linked PlayerProfile district is 'Trichy'");
    assert(Array.isArray(profileInDb?.location?.coordinates), "Geographic Point coordinates resolved for Trichy");
    console.log("     └─ PlayerProfile Document in MongoDB:", {
      _id: profileInDb?._id?.toString(),
      playerIdNumber: profileInDb?.playerIdNumber,
      userId: profileInDb?.userId?.toString(),
      sport: profileInDb?.sport,
      city: profileInDb?.city,
      coordinates: profileInDb?.location?.coordinates,
      rating: profileInDb?.rating,
      skillLevel: profileInDb?.skillLevel,
    });

    // 5. VERIFY REAL-TIME VISIBILITY IN FIND PLAYERS DIRECTORY
    console.log("\n--- 5. REAL-TIME VISIBILITY IN PLAYERS DIRECTORY (Without Restart) ---");
    let dirData = {};
    let dirReq = {
      query: { city: "Trichy" },
      user: { _id: testUserId },
    };
    let dirRes = {
      status: (code) => dirRes,
      json: (data) => { dirData = data; return dirRes; },
    };

    await getNearbyPlayers(dirReq, dirRes);
    const playerInDirectory = dirData.players?.find((p) => p.email === testEmail);

    assert(dirData.success === true, "GET /api/players/nearby query returned success: true");
    assert(Boolean(playerInDirectory), "New athlete appears immediately in Trichy district filter");
    assert(playerInDirectory?.name === "Mithun Rangarajan", "Directory athlete name matches 'Mithun Rangarajan'");
    assert(playerInDirectory?.sport === "Basketball", "Directory athlete sport matches 'Basketball'");
    assert(playerInDirectory?.city === "Trichy", "Directory athlete city matches 'Trichy'");
    console.log("     └─ Found in Directory:", {
      name: playerInDirectory?.name,
      sport: playerInDirectory?.sport,
      city: playerInDirectory?.city,
      playerIdNumber: playerInDirectory?.playerIdNumber,
    });

    // Statewide All query check
    let allData = {};
    let allReq = { query: { city: "All" }, user: { _id: testUserId } };
    let allRes = { status: (code) => allRes, json: (data) => { allData = data; return allRes; } };
    await getNearbyPlayers(allReq, allRes);
    const playerInAll = allData.players?.find((p) => p.email === testEmail);
    assert(Boolean(playerInAll), "New athlete appears immediately in All-Tamil Nadu catalog");

  } catch (err) {
    console.error("Test execution error:", err);
    testFailed++;
  } finally {
    if (testUserId) {
      console.log(`\n🧹 Cleaning up test user ${testEmail}...`);
      await User.findByIdAndDelete(testUserId);
      await PlayerProfile.deleteMany({ userId: testUserId });
      console.log("   Cleanup completed.");
    }

    console.log("\n===================================================================");
    console.log(`🏁 REAL-TIME SIGNUP PERSISTENCE TEST: ${testPassed} Passed, ${testFailed} Failed`);
    console.log("===================================================================\n");

    process.exit(testFailed > 0 ? 1 : 0);
  }
};

runFreshSignupRealtimeTest();
