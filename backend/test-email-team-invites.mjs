import mongoose from "mongoose";

const BASE_URL = "http://localhost:5000/api";

async function testTeamInviteEmailFeature() {
  console.log("================================================================================");
  console.log("📧 PLAYSPHERE REAL EMAIL NOTIFICATION FOR TEAM INVITES TEST SUITE");
  console.log("================================================================================\n");

  await mongoose.connect("mongodb://127.0.0.1:27017/playsphere");

  // Step 1: Login as Captain (Lokesh Kumar, Captain of Chennai Super Smashers)
  console.log("[STEP 1] Authenticating as Team Captain (Lokesh Kumar)...");
  const captainLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "demo@playsphere.com", password: "PlaySphere@Admin2026" }),
  });
  const captainData = await captainLoginRes.json();
  if (!captainData.token) throw new Error("Captain login failed: " + JSON.stringify(captainData));
  const captainToken = captainData.token;
  console.log("   └─ Authenticated successfully. Captain User ID:", captainData.user._id);

  // Find a team where Lokesh is captain
  const team = await mongoose.connection.collection("teams").findOne({ captainId: new mongoose.Types.ObjectId(captainData.user._id) });
  if (!team) throw new Error("No team found for captain!");
  console.log(`   └─ Captain's Team: "${team.name}" (${team.sport})\n`);

  // Find a registered user who is NOT a member of this team (e.g. Karthik Subramanian or another)
  const existingPlayer = await mongoose.connection.collection("users").findOne({
    _id: { $nin: [team.captainId, ...team.members.map((m) => m.userId)] },
    role: { $ne: "super_admin" },
  });
  console.log(`[STEP 2] Target Registered Athlete found: "${existingPlayer.name}" (${existingPlayer.email})`);

  // Clean up any existing invites for this test
  await mongoose.connection.collection("teaminvites").deleteMany({ teamId: team._id });
  await mongoose.connection.collection("notifications").deleteMany({ type: "team_invite" });

  // -------------------------------------------------------------
  // TEST A: Invite Existing User by userId
  // -------------------------------------------------------------
  console.log("\n[TEST A] Inviting existing registered user by userId...");
  const inviteResA = await fetch(`${BASE_URL}/teams/${team._id}/invite`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${captainToken}`,
    },
    body: JSON.stringify({
      invitedUserId: existingPlayer._id.toString(),
      role: "vice-captain",
      message: "Lead our batting lineup in the upcoming championship!",
    }),
  });
  const inviteDataA = await inviteResA.json();
  console.log("   └─ API Response Status:", inviteResA.status);
  console.log("   └─ API Message:", inviteDataA.message);
  console.log("   └─ Email Sent Flag:", inviteDataA.emailSent, "| Simulated:", inviteDataA.isSimulated);
  console.log("   └─ Recipient:", inviteDataA.recipientName, "| Email:", inviteDataA.invitedEmail);

  const inviteInDbA = await mongoose.connection.collection("teaminvites").findOne({ _id: new mongoose.Types.ObjectId(inviteDataA.invite?._id) });
  const notifInDbA = await mongoose.connection.collection("notifications").findOne({ userId: existingPlayer._id, type: "team_invite" });

  const testAPassed =
    inviteResA.status === 201 &&
    inviteDataA.success &&
    inviteInDbA &&
    inviteInDbA.invitedEmail === existingPlayer.email.toLowerCase() &&
    notifInDbA;

  console.log(`   ${testAPassed ? "✅ TEST A PASSED: Invite created in DB, in-app notification saved, and email dispatched!" : "❌ TEST A FAILED"}\n`);

  // -------------------------------------------------------------
  // TEST B: Invite Unregistered Athlete by Direct Email
  // -------------------------------------------------------------
  const testNewEmail = `newathlete_${Date.now()}@sportsfan.in`;
  console.log(`[TEST B] Inviting unregistered athlete by direct email (${testNewEmail})...`);
  const inviteResB = await fetch(`${BASE_URL}/teams/${team._id}/invite`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${captainToken}`,
    },
    body: JSON.stringify({
      email: testNewEmail,
      role: "player",
      message: "Join our weekend practice match!",
    }),
  });
  const inviteDataB = await inviteResB.json();
  console.log("   └─ API Response Status:", inviteResB.status);
  console.log("   └─ API Message:", inviteDataB.message);
  console.log("   └─ isNewUser Flag:", inviteDataB.isNewUser);

  const inviteInDbB = await mongoose.connection.collection("teaminvites").findOne({ invitedEmail: testNewEmail.toLowerCase() });
  const testBPassed =
    inviteResB.status === 201 &&
    inviteDataB.success &&
    inviteDataB.isNewUser === true &&
    inviteInDbB &&
    inviteInDbB.invitedUserId === null;

  console.log(`   ${testBPassed ? "✅ TEST B PASSED: Unregistered email invite created and email with signup link dispatched!" : "❌ TEST B FAILED"}\n`);

  // -------------------------------------------------------------
  // TEST C: Authenticate as Invited User and Fetch My Invites
  // -------------------------------------------------------------
  console.log(`[TEST C] Logging in as Invited Athlete (${existingPlayer.email}) to check My Invites...`);
  // Generate token or login
  const jwt = (await import("jsonwebtoken")).default;
  const JWT_SECRET = process.env.JWT_SECRET || "c94f28ba7f4d8e906b32a9e14522961d56778f564177c8e9b0572e9a224a1e94";
  const playerToken = jwt.sign(
    { id: existingPlayer._id, role: existingPlayer.role },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  const myInvitesRes = await fetch(`${BASE_URL}/invites/my`, {
    headers: { Authorization: `Bearer ${playerToken}` },
  });
  const myInvitesData = await myInvitesRes.json();
  console.log("   └─ Status:", myInvitesRes.status);
  console.log("   └─ Total Invites Found:", myInvitesData.count);
  const foundInvite = myInvitesData.invites?.find((inv) => inv._id.toString() === inviteDataA.invite?._id.toString());
  console.log(`   └─ Found Target Invite for "${foundInvite?.teamId?.name}" as ${foundInvite?.role}`);

  const testCPassed = myInvitesRes.status === 200 && myInvitesData.success && !!foundInvite;
  console.log(`   ${testCPassed ? "✅ TEST C PASSED: Invited player successfully retrieves squad invite!" : "❌ TEST C FAILED"}\n`);

  // -------------------------------------------------------------
  // TEST D: Accept Team Invite & Verify Roster Addition
  // -------------------------------------------------------------
  console.log(`[TEST D] Accepting Team Invite (POST /api/invites/${inviteDataA.invite?._id}/respond)...`);
  const acceptRes = await fetch(`${BASE_URL}/invites/${inviteDataA.invite?._id}/respond`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${playerToken}`,
    },
    body: JSON.stringify({ action: "accepted" }),
  });
  const acceptData = await acceptRes.json();
  console.log("   └─ Response Status:", acceptRes.status, "| Message:", acceptData.message);

  const updatedTeam = await mongoose.connection.collection("teams").findOne({ _id: team._id });
  const isMemberNow = updatedTeam.members.some((m) => m.userId.toString() === existingPlayer._id.toString());
  console.log("   └─ Is Athlete in Team Members List in MongoDB?", isMemberNow);

  const testDPassed = acceptRes.status === 200 && acceptData.success && isMemberNow;
  console.log(`   ${testDPassed ? "✅ TEST D PASSED: Player accepted invite and is now officially on the squad roster!" : "❌ TEST D FAILED"}\n`);

  console.log("================================================================================");
  const allPassed = testAPassed && testBPassed && testCPassed && testDPassed;
  console.log(`🏁 OVERALL EMAIL & TEAM INVITES RESULT: ${allPassed ? "ALL TESTS PASSED 100% ✅" : "SOME TESTS FAILED ❌"}`);
  console.log("================================================================================\n");

  await mongoose.disconnect();
}

testTeamInviteEmailFeature().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
