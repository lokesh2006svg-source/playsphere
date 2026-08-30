import mongoose from "mongoose";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import PlayerProfile from "./models/PlayerProfile.js";
import CoachProfile from "./models/CoachProfile.js";
import GroundOwnerProfile from "./models/GroundOwnerProfile.js";
import { register, login, getMe, fetchProfileForUser } from "./controllers/authController.js";
import { createOrUpdateProfile, getPlayerCard } from "./controllers/profileController.js";
import { getNearbyPlayers } from "./controllers/playerController.js";

const runMultiRoleJoinTests = async () => {
  console.log("===================================================================");
  console.log("👥 TESTING MULTIPLE PLAYERS, COACHES & GROUND OWNERS JOINING");
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

  const createdUserIds = [];

  try {
    await connectDB();

    // Helper mock function
    const mockRequest = (body, user = null, query = {}, params = {}) => {
      let resData = {};
      let statusCode = 200;
      const res = {
        status: (code) => { statusCode = code; return res; },
        json: (data) => { resData = data; return res; },
        cookie: () => res,
      };
      return { req: { body, user, query, params }, res, getResponse: () => ({ status: statusCode, data: resData }) };
    };

    // 1. JOIN MULTIPLE PLAYERS
    console.log("--- 1. JOINING MULTIPLE PLAYERS (Tamil Nadu Districts) ---");
    const playersToJoin = [
      { name: "Anand Kumar", email: `player_anand_${Date.now()}@playsphere.com`, sport: "Cricket", city: "Madurai" },
      { name: "Pooja Sundaram", email: `player_pooja_${Date.now()}@playsphere.com`, sport: "Badminton", city: "Coimbatore" },
      { name: "Kiran Raj", email: `player_kiran_${Date.now()}@playsphere.com`, sport: "Football", city: "Chennai" },
      { name: "Muthu Vel", email: `player_muthu_${Date.now()}@playsphere.com`, sport: "Kabaddi", city: "Salem" },
    ];

    for (const p of playersToJoin) {
      const { req, res, getResponse } = mockRequest({
        name: p.name,
        email: p.email,
        password: "Password123#",
        city: p.city,
        sport: p.sport,
        role: "player",
        accountType: "player",
      });

      await register(req, res);
      const output = getResponse();
      assert(output.status === 201 && output.data.success, `Player '${p.name}' joined successfully`);
      if (output.data.user?._id) createdUserIds.push(output.data.user._id);

      // Verify Profile immediately linked
      const profile = await fetchProfileForUser(output.data.user._id, "player");
      assert(profile?.sport === p.sport, `Player '${p.name}' has sport '${p.sport}' in MongoDB`);
      assert(profile?.city === p.city, `Player '${p.name}' has district '${p.city}'`);
    }

    // 2. JOIN MULTIPLE COACHES
    console.log("\n--- 2. JOINING MULTIPLE COACHES ---");
    const coachesToJoin = [
      { name: "Coach Ramanathan", email: `coach_ram_${Date.now()}@playsphere.com`, sport: "Cricket", city: "Chennai", experience: 10 },
      { name: "Coach Selvam", email: `coach_selvam_${Date.now()}@playsphere.com`, sport: "Football", city: "Madurai", experience: 8 },
      { name: "Coach Anitha", email: `coach_anitha_${Date.now()}@playsphere.com`, sport: "Badminton", city: "Coimbatore", experience: 6 },
    ];

    for (const c of coachesToJoin) {
      const { req, res, getResponse } = mockRequest({
        name: c.name,
        email: c.email,
        password: "Password123#",
        city: c.city,
        sport: c.sport,
        role: "coach",
        accountType: "coach",
        yearsOfExperience: c.experience,
      });

      await register(req, res);
      const output = getResponse();
      assert(output.status === 201 && output.data.success, `Coach '${c.name}' joined successfully with role 'coach'`);
      if (output.data.user?._id) createdUserIds.push(output.data.user._id);

      // Verify CoachProfile
      const coachProf = await fetchProfileForUser(output.data.user._id, "coach");
      assert(coachProf !== null, `CoachProfile found in MongoDB for '${c.name}'`);
      assert(coachProf?.sport === c.sport, `Coach sport is '${c.sport}'`);
      assert(coachProf?.yearsOfExperience === c.experience, `Coach experience is ${c.experience} years`);

      // Verify Digital Pass
      const { req: cardReq, res: cardRes, getResponse: getCardResp } = mockRequest({}, null, {}, { userId: output.data.user._id.toString() });
      await getPlayerCard(cardReq, cardRes);
      const cardOut = getCardResp();
      assert(cardOut.data.success === true, `Digital Pass generated for Coach '${c.name}' without errors`);
      assert(cardOut.data.card?.name === c.name, `Card displays Coach name '${c.name}'`);
    }

    // 3. JOIN MULTIPLE GROUND OWNERS
    console.log("\n--- 3. JOINING MULTIPLE GROUND / TURF OWNERS ---");
    const ownersToJoin = [
      { name: "Vignesh Kumar", email: `owner_vignesh_${Date.now()}@playsphere.com`, businessName: "Marina Sports Arena", phone: "+91 98401 11222", city: "Chennai" },
      { name: "Saravanan P.", email: `owner_saro_${Date.now()}@playsphere.com`, businessName: "Kovai Premier Turf Ground", phone: "+91 94432 33444", city: "Coimbatore" },
      { name: "Bala Murugan", email: `owner_bala_${Date.now()}@playsphere.com`, businessName: "Madurai Central Indoor Stadium", phone: "+91 97890 55666", city: "Madurai" },
    ];

    for (const o of ownersToJoin) {
      const { req, res, getResponse } = mockRequest({
        name: o.name,
        email: o.email,
        password: "Password123#",
        city: o.city,
        businessName: o.businessName,
        contactPhone: o.phone,
        role: "ground_owner",
        accountType: "ground_owner",
      });

      await register(req, res);
      const output = getResponse();
      assert(output.status === 201 && output.data.success, `Ground Owner '${o.name}' joined successfully`);
      if (output.data.user?._id) createdUserIds.push(output.data.user._id);

      // Verify GroundOwnerProfile
      const ownerProf = await fetchProfileForUser(output.data.user._id, "ground_owner");
      assert(ownerProf !== null, `GroundOwnerProfile found in MongoDB for '${o.businessName}'`);
      assert(ownerProf?.businessName === o.businessName, `Business name is '${o.businessName}'`);
      assert(ownerProf?.contactPhone === o.phone, `Contact phone is '${o.phone}'`);

      // Verify Digital Pass
      const { req: cardReq, res: cardRes, getResponse: getCardResp } = mockRequest({}, null, {}, { userId: output.data.user._id.toString() });
      await getPlayerCard(cardReq, cardRes);
      const cardOut = getCardResp();
      assert(cardOut.data.success === true, `Digital Pass generated for Ground Owner '${o.businessName}' without errors`);
    }

    // 4. VERIFY ALL PLAYERS APPEAR IN DIRECTORY
    console.log("\n--- 4. VERIFY PLAYERS DIRECTORY ---");
    const { req: dirReq, res: dirRes, getResponse: getDirResp } = mockRequest({}, { _id: createdUserIds[0] }, { city: "All" });
    await getNearbyPlayers(dirReq, dirRes);
    const dirOut = getDirResp();

    assert(dirOut.data.success === true, "Players directory query returned success");
    for (const p of playersToJoin) {
      const found = dirOut.data.players?.some((player) => player.email === p.email);
      assert(found, `Player '${p.name}' (${p.sport}, ${p.city}) is listed live in directory`);
    }

  } catch (err) {
    console.error("Test execution error:", err);
    testFailed++;
  } finally {
    if (createdUserIds.length > 0) {
      console.log(`\n🧹 Cleaning up ${createdUserIds.length} test accounts...`);
      await User.deleteMany({ _id: { $in: createdUserIds } });
      await PlayerProfile.deleteMany({ userId: { $in: createdUserIds } });
      await CoachProfile.deleteMany({ userId: { $in: createdUserIds } });
      await GroundOwnerProfile.deleteMany({ userId: { $in: createdUserIds } });
      console.log("   Cleanup completed successfully.");
    }

    console.log("\n===================================================================");
    console.log(`🏁 MULTI-ROLE JOIN TEST COMPLETE: ${testPassed} Passed, ${testFailed} Failed`);
    console.log("===================================================================\n");

    process.exit(testFailed > 0 ? 1 : 0);
  }
};

runMultiRoleJoinTests();
