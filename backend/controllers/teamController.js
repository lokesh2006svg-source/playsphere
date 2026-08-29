import Team from "../models/Team.js";
import TeamInvite from "../models/TeamInvite.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import PlayerProfile from "../models/PlayerProfile.js";
import CoachProfile from "../models/CoachProfile.js";
import { triggerWebhook } from "../utils/webhookNotifier.js";
import { sendTeamInviteEmail } from "../utils/emailService.js";

// @desc    Create a new sports team
// @route   POST /api/teams
// @access  Private (Coach / Admin only)
export const createTeam = async (req, res) => {
  try {
    const { name, sport, city, logo, bio, clubId } = req.body;

    // Role check: Only coaches (and administrators) have permission to register official teams
    const allowedRoles = ["coach", "admin", "super_admin"];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Only certified Coaches can create and register official teams. Players can join teams via invite codes.",
      });
    }

    if (!name || !sport) {
      return res.status(400).json({ message: "Team name and sport are required." });
    }

    const targetCity = city || req.user.city || "Chennai";
    const existingTeam = await Team.findOne({
      name: new RegExp(`^${name.trim()}$`, "i"),
      city: new RegExp(`^${targetCity.trim()}$`, "i"),
      sport: new RegExp(`^${sport.trim()}$`, "i"),
    });

    if (existingTeam) {
      return res.status(409).json({
        success: false,
        message: `A team named "${name.trim()}" for ${sport} already exists in ${targetCity}.`,
      });
    }

    const team = await Team.create({
      name: name.trim(),
      sport: sport.trim(),
      city: targetCity.trim(),
      logo: logo || "",
      bio: bio || "",
      clubId: clubId || null,
      coachId: req.user._id,
      captainId: req.user._id,
      members: [
        {
          userId: req.user._id,
          role: "captain",
          joinedAt: new Date(),
        },
      ],
    });

    // Link team to CoachProfile if user is a coach
    await CoachProfile.findOneAndUpdate(
      { userId: req.user._id },
      { $addToSet: { managedTeamIds: team._id } }
    );

    const populatedTeam = await Team.findById(team._id)
      .populate("coachId", "name email city profilePhoto")
      .populate("captainId", "name email city")
      .populate("members.userId", "name email city profilePhoto");

    res.status(201).json({
      success: true,
      message: "Team created successfully!",
      team: populatedTeam,
    });
  } catch (error) {
    console.error("Create team error:", error);
    res.status(500).json({ message: error.message || "Failed to create team." });
  }
};

// @desc    Get all teams with filters
// @route   GET /api/teams
// @access  Public / Private
export const getTeams = async (req, res) => {
  try {
    const { sport, city, myTeams, search } = req.query;
    const query = {};

    if (sport && sport !== "All" && sport !== "All Sports") {
      query.sport = new RegExp(sport, "i");
    }
    if (city && city !== "All") {
      query.city = new RegExp(city, "i");
    }
    if (search) {
      query.name = new RegExp(search, "i");
    }
    if (myTeams === "true" && req.user) {
      query.$or = [
        { captainId: req.user._id },
        { "members.userId": req.user._id },
      ];
    }

    const teams = await Team.find(query)
      .populate("captainId", "name email city")
      .populate("members.userId", "name email city")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: teams.length,
      teams,
    });
  } catch (error) {
    console.error("Get teams error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch teams." });
  }
};

// @desc    Get single team by ID (enriched with PlayerProfiles)
// @route   GET /api/teams/:id
// @access  Public
export const getTeamById = async (req, res) => {
  try {
    const teamDoc = await Team.findById(req.params.id)
      .populate("captainId", "name email city location role profilePhoto")
      .populate("members.userId", "name email city location role profilePhoto")
      .populate("clubId", "name city logo")
      .lean();

    if (!teamDoc) {
      return res.status(404).json({ message: "Team not found." });
    }

    // Collect all member user IDs to join PlayerProfiles
    const userIds = [
      teamDoc.captainId?._id || teamDoc.captainId,
      ...(teamDoc.members || []).map((m) => m.userId?._id || m.userId),
    ].filter(Boolean);

    const profiles = await PlayerProfile.find({ userId: { $in: userIds } }).lean();
    const profileMap = new Map(profiles.map((p) => [p.userId.toString(), p]));

    // Enrich captain
    if (teamDoc.captainId && typeof teamDoc.captainId === "object") {
      const capProfile = profileMap.get(teamDoc.captainId._id.toString());
      teamDoc.captainId.sport = capProfile?.sport || teamDoc.sport;
      teamDoc.captainId.skillLevel = capProfile?.skillLevel || "intermediate";
      teamDoc.captainId.rating = capProfile?.rating || 4.5;
      teamDoc.captainId.profilePhoto = capProfile?.profilePhoto || teamDoc.captainId.profilePhoto || "";
      teamDoc.captainId.playerIdNumber = capProfile?.playerIdNumber || "";
      teamDoc.captainId.badges = capProfile?.badges || [];
    }

    // Enrich roster members
    teamDoc.members = (teamDoc.members || []).map((m) => {
      const uId = m.userId?._id || m.userId;
      const uProfile = uId ? profileMap.get(uId.toString()) : null;
      const userObj = typeof m.userId === "object" ? { ...m.userId } : { _id: m.userId };

      return {
        ...m,
        userId: {
          ...userObj,
          sport: uProfile?.sport || teamDoc.sport,
          secondarySports: uProfile?.secondarySports || [],
          skillLevel: uProfile?.skillLevel || "intermediate",
          rating: uProfile?.rating || 4.2,
          profilePhoto: uProfile?.profilePhoto || userObj.profilePhoto || "",
          playerIdNumber: uProfile?.playerIdNumber || "",
          badges: uProfile?.badges || [],
          matchesPlayed: uProfile?.matchesPlayed || 0,
          matchesWon: uProfile?.matchesWon || 0,
        },
      };
    });

    res.json({ success: true, team: teamDoc });
  } catch (error) {
    console.error("Get team by ID error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch team details." });
  }
};

// @desc    Invite a player to join a team
// @route   POST /api/teams/:id/invite
// @access  Private (Captain only)
// @desc    Invite a player to join a team (with real email notification & in-app alerts)
// @route   POST /api/teams/:id/invite
// @access  Private (Captain only)
export const invitePlayerToTeam = async (req, res) => {
  try {
    const { invitedUserId, email, invitedEmail, role = "player", message } = req.body;
    const teamId = req.params.id;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ success: false, message: "Team not found." });
    }

    if (team.captainId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Only the team captain can invite members." });
    }

    let targetUser = null;
    let targetEmail = (email || invitedEmail || "").toLowerCase().trim();
    let isNewUser = false;

    if (invitedUserId) {
      targetUser = await User.findById(invitedUserId);
      if (!targetUser) {
        return res.status(404).json({ success: false, message: "Selected athlete account not found." });
      }
      targetEmail = targetUser.email.toLowerCase().trim();
    } else if (targetEmail) {
      targetUser = await User.findOne({ email: targetEmail });
      if (!targetUser) {
        isNewUser = true;
      }
    } else {
      return res.status(400).json({ success: false, message: "Please select an athlete or provide a valid email address." });
    }

    // Check membership and existing pending invites
    if (targetUser) {
      if (targetUser._id.toString() === req.user._id.toString()) {
        return res.status(400).json({ success: false, message: "You are already the captain of this squad." });
      }

      const isAlreadyMember = team.members.some(
        (m) => m.userId?.toString() === targetUser._id.toString()
      );
      if (isAlreadyMember) {
        return res.status(400).json({ success: false, message: "This athlete is already an active member of the team." });
      }

      const existingInvite = await TeamInvite.findOne({
        teamId,
        $or: [{ invitedUserId: targetUser._id }, { invitedEmail: targetEmail }],
        status: "pending",
      });
      if (existingInvite) {
        return res.status(400).json({ success: false, message: "An active invitation has already been sent to this athlete." });
      }
    } else {
      const existingInvite = await TeamInvite.findOne({
        teamId,
        invitedEmail: targetEmail,
        status: "pending",
      });
      if (existingInvite) {
        return res.status(400).json({ success: false, message: "An active invitation has already been sent to this email address." });
      }
    }

    // 1. Create TeamInvite document
    const invite = await TeamInvite.create({
      teamId,
      invitedUserId: targetUser ? targetUser._id : null,
      invitedEmail: targetEmail,
      invitedBy: req.user._id,
      role: ["player", "vice-captain", "substitute"].includes(role) ? role : "player",
      message: message || `Join our ${team.sport} squad '${team.name}' on PlaySphere!`,
      status: "pending",
    });

    // 2. Create In-App Notification (Always fires for registered users)
    if (targetUser) {
      try {
        await Notification.create({
          userId: targetUser._id,
          type: "team_invite",
          title: `⚔️ Squad Invite: ${team.name}`,
          message: `${req.user.name} invited you to join '${team.name}' (${team.sport}) as a ${role}.`,
          link: "/invites",
          metadata: { inviteId: invite._id, teamId: team._id },
        });
      } catch (notifErr) {
        console.warn("[Notification] Could not create in-app notification:", notifErr.message);
      }
    }

    // 3. Send Real Email Notification via emailService
    let emailSent = false;
    let isSimulated = true;
    try {
      const emailResult = await sendTeamInviteEmail(
        targetEmail,
        req.user.name,
        team.name,
        team.sport,
        isNewUser
      );
      emailSent = !!emailResult?.success;
      isSimulated = !!emailResult?.isSimulated;
    } catch (mailErr) {
      console.warn("[Email] Failed to dispatch team invite email:", mailErr.message);
    }

    // 4. Fire Webhook
    try {
      triggerWebhook("team_invite", {
        inviteId: invite._id,
        teamName: team.name,
        sport: team.sport,
        captainName: req.user.name,
        invitedUserId: targetUser ? targetUser._id : null,
        invitedEmail: targetEmail,
      });
    } catch (hookErr) {
      console.warn("[Webhook] Notice:", hookErr.message);
    }

    res.status(201).json({
      success: true,
      message: targetUser
        ? `Invite sent! ${targetUser.name} will receive an email notification.`
        : `Invitation sent to ${targetEmail}! An invite email with signup instructions has been dispatched.`,
      invite,
      emailSent,
      isSimulated,
      invitedEmail: targetEmail,
      recipientName: targetUser ? targetUser.name : targetEmail,
      isNewUser,
    });
  } catch (error) {
    console.error("Invite player error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to send invitation." });
  }
};

// @desc    Get current user's team invites (matches userId or registered email)
// @route   GET /api/teams/invites/my AND GET /api/invites/my
// @access  Private
export const getMyInvites = async (req, res) => {
  try {
    const userEmail = req.user.email?.toLowerCase();
    const invites = await TeamInvite.find({
      $or: [
        { invitedUserId: req.user._id },
        { invitedEmail: userEmail },
      ],
    })
      .populate("teamId", "name sport city logo stats members")
      .populate("invitedBy", "name email city profilePhoto")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: invites.length, invites });
  } catch (error) {
    console.error("Get my invites error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to fetch invites." });
  }
};

// @desc    Accept or reject team invitation
// @route   POST /api/teams/invites/:id/respond, PUT /api/teams/invites/:id/respond, POST /api/invites/:id/respond, PUT /api/invites/:id/respond
// @access  Private
export const respondToInvite = async (req, res) => {
  try {
    const rawAction =
      req.body?.action ||
      req.body?.status ||
      (typeof req.body === "string" ? req.body : "");

    const action = String(rawAction).toLowerCase().trim();

    if (!action || !["accepted", "rejected"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Action must be 'accepted' or 'rejected'.",
      });
    }

    const invite = await TeamInvite.findById(req.params.id).populate("teamId");
    if (!invite) {
      return res.status(404).json({ success: false, message: "Invitation not found." });
    }

    const userEmail = req.user.email?.toLowerCase();
    const isAuthorized =
      (invite.invitedUserId && invite.invitedUserId.toString() === req.user._id.toString()) ||
      (invite.invitedEmail && invite.invitedEmail.toLowerCase() === userEmail);

    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: "Not authorized to respond to this invite." });
    }

    invite.status = action;
    if (!invite.invitedUserId) {
      invite.invitedUserId = req.user._id;
    }
    await invite.save();

    if (action === "accepted" && invite.teamId) {
      const team = await Team.findById(invite.teamId._id || invite.teamId);
      if (team) {
        const alreadyMember = team.members.some(
          (m) => m.userId?.toString() === req.user._id.toString()
        );
        if (!alreadyMember) {
          team.members.push({
            userId: req.user._id,
            role: invite.role || "player",
            joinedAt: new Date(),
          });
          await team.save();
        }
      }
    }

    return res.status(200).json({
      success: true,
      status: action,
      action: action,
      message: `Invitation ${action} successfully.`,
      invite,
    });
  } catch (error) {
    console.error("Respond invite error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to process response." });
  }
};

// @desc    Remove a member from team or leave team
// @route   DELETE /api/teams/:id/members/:userId
// @access  Private
export const removeTeamMember = async (req, res) => {
  try {
    const { id: teamId, userId: targetUserId } = req.params;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found." });
    }

    const isCaptain = team.captainId.toString() === req.user._id.toString();
    const isSelf = targetUserId.toString() === req.user._id.toString();

    if (!isCaptain && !isSelf) {
      return res.status(403).json({ message: "Not authorized to remove this member." });
    }

    if (isSelf && isCaptain && team.members.length > 1) {
      return res.status(400).json({
        message: "As captain, transfer captaincy before leaving the team.",
      });
    }

    team.members = team.members.filter(
      (m) => m.userId.toString() !== targetUserId.toString()
    );
    await team.save();

    res.json({
      success: true,
      message: isSelf ? "You have left the team." : "Member removed from team.",
      team,
    });
  } catch (error) {
    console.error("Remove member error:", error);
    res.status(500).json({ message: error.message || "Failed to remove member." });
  }
};

// @desc    Helper: Sync any pending invites sent to this user's email address & create in-app notifications
export const syncPendingUserInvites = async (user) => {
  if (!user || !user.email) return;
  try {
    const userEmail = user.email.toLowerCase().trim();
    const pendingInvites = await TeamInvite.find({
      invitedEmail: userEmail,
      status: "pending",
    }).populate("teamId", "name sport");

    for (const invite of pendingInvites) {
      if (!invite.invitedUserId || invite.invitedUserId.toString() !== user._id.toString()) {
        invite.invitedUserId = user._id;
        await invite.save();
      }

      // Check if notification already exists
      const existingNotif = await Notification.findOne({
        userId: user._id,
        "metadata.inviteId": invite._id,
      });

      if (!existingNotif && invite.teamId) {
        await Notification.create({
          userId: user._id,
          type: "team_invite",
          title: `⚔️ Squad Invite: ${invite.teamId.name || "Team"}`,
          message: `You have a pending invite to join '${invite.teamId.name || "Team"}' (${invite.teamId.sport || "Sports"}) as a ${invite.role || "player"}.`,
          link: "/invites",
          metadata: { inviteId: invite._id, teamId: invite.teamId._id || invite.teamId },
        });
      }
    }
  } catch (err) {
    console.warn("[InviteSync] Failed to sync pending email invites:", err.message);
  }
};

