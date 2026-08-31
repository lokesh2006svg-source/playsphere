import mongoose from "mongoose";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import PlayerProfile from "./models/PlayerProfile.js";
import CoachProfile from "./models/CoachProfile.js";
import GroundOwnerProfile from "./models/GroundOwnerProfile.js";
import Team from "./models/Team.js";
import Venue from "./models/Venue.js";
import { getPublicProfile } from "./controllers/profileController.js";

const runPublicShareTests = async () => {
  console.log("===================================================================");
  console.log("🌐 TESTING PUBLIC PROFILES & SHARING (PLAYER, COACH, GROUND OWNER)");
  console.log("===================================================================\n");

  let passed = 0;
  let failed = 0;

  const assert = (condition, title, details = "") => {
    if (condition) {
      passed++;
      console.log(`  ✅ [PASS] ${title}`);
      if (details) console.log(`     └─ ${details}`);
    } else {
      failed++;
      console.error(`  ❌ [FAIL] ${title}`);
      if (details) console.error(`     └─ Error Details: ${details}`);
    }
  };

  try {
    await connectDB();

    const mockRequest = (params = {}) => {
      let resData = {};
      let statusCode = 200;
      const res = {
        status: (code) => { statusCode = code; return res; },
        json: (data) => { resData = data; return res; },
      };
      return { req: { params }, res, getResponse: () => ({ status: statusCode, data: resData }) };
    };

    // 1. Test Seeded Player (Ananya or Karthik)
    const seededPlayer = await User.findOne({ email: "ananya@playsphere.com" });
    if (seededPlayer) {
      const { req, res, getResponse } = mockRequest({ userId: seededPlayer._id.toString() });
      await getPublicProfile(req, res);
      const output = getResponse();

      assert(output.status === 200 && output.data.success, "Public Profile fetched for Player (Ananya)");
      assert(output.data.role === "player", "Role is identified as 'player'");
      assert(output.data.profile.playerIdNumber?.startsWith("PS-"), "Player ID Number present", output.data.profile.playerIdNumber);
      assert(output.data.profile.sport === "Badminton", "Player sport is Badminton", output.data.profile.sport);
      assert(!output.data.profile.password && !output.data.profile.email, "Sensitive info (password, email) excluded");
    }

    // 2. Test Seeded Coach (Coach Ramanathan)
    const seededCoach = await User.findOne({ email: "coach@playsphere.com" });
    if (seededCoach) {
      const { req, res, getResponse } = mockRequest({ userId: seededCoach._id.toString() });
      await getPublicProfile(req, res);
      const output = getResponse();

      assert(output.status === 200 && output.data.success, "Public Profile fetched for Coach (Ramanathan)");
      assert(output.data.role === "coach", "Role is identified as 'coach'");
      assert(output.data.profile.skillLevel.includes("Certified Coach"), "Coach skillLevel displays certification");
      assert(Array.isArray(output.data.profile.managedTeams), "Managed squads array populated for Coach");
      assert(!output.data.profile.password && !output.data.profile.email, "Coach email/password excluded from public endpoint");
    }

    // 3. Test Seeded Ground Owner (S. Vignesh)
    const seededOwner = await User.findOne({ email: "owner@playsphere.com" });
    if (seededOwner) {
      const { req, res, getResponse } = mockRequest({ userId: seededOwner._id.toString() });
      await getPublicProfile(req, res);
      const output = getResponse();

      assert(output.status === 200 && output.data.success, "Public Profile fetched for Ground Owner (S. Vignesh)");
      assert(output.data.role === "ground_owner", "Role is identified as 'ground_owner'");
      assert(output.data.profile.name.includes("Marina") || output.data.profile.name.includes("Sports"), "Business/Turf name displayed", output.data.profile.name);
      assert(Array.isArray(output.data.profile.managedVenues), "Managed venues array populated for Ground Owner");
      assert(!output.data.profile.password && !output.data.profile.email, "Owner sensitive data excluded");
    }

    console.log(`\n===================================================================`);
    console.log(`🏁 PUBLIC SHARE TEST COMPLETE: ${passed} Passed, ${failed} Failed`);
    console.log(`===================================================================\n`);
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error("Test execution error:", err);
    process.exit(1);
  }
};

runPublicShareTests();
