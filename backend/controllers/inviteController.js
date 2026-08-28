import InviteLink from "../models/InviteLink.js";
import crypto from "crypto";

// @desc    Generate a shareable invite code
// @route   POST /api/invites/generate
// @access  Private
export const generateInvite = async (req, res) => {
  try {
    const { sport, city } = req.body;

    const randomSuffix = crypto.randomBytes(3).toString("hex").toUpperCase();
    const inviteCode = `PS-${(sport || "PLAY").slice(0, 3).toUpperCase()}-${randomSuffix}`;

    const invite = await InviteLink.create({
      createdBy: req.user._id,
      inviteCode,
      sport: sport || "All Sports",
      city: city || req.user.city || "Chennai",
    });

    res.status(201).json({
      success: true,
      inviteCode: invite.inviteCode,
      shareUrl: `/join/${invite.inviteCode}`,
      invite,
    });
  } catch (error) {
    console.error("Generate invite error:", error);
    res.status(500).json({ message: error.message || "Failed to generate invite." });
  }
};

// @desc    Get invite details by code (Public for join page)
// @route   GET /api/invites/:inviteCode
// @access  Public
export const getInviteByCode = async (req, res) => {
  try {
    const invite = await InviteLink.findOne({
      inviteCode: req.params.inviteCode.toUpperCase(),
    }).populate("createdBy", "name city");

    if (!invite) {
      return res.status(404).json({ message: "Invalid or expired invite link." });
    }

    if (new Date() > invite.expiresAt) {
      return res.status(410).json({ message: "This invite link has expired." });
    }

    res.json({
      success: true,
      invite: {
        inviteCode: invite.inviteCode,
        sport: invite.sport,
        city: invite.city,
        inviterName: invite.createdBy?.name || "A Sports Community Member",
        usageCount: invite.usageCount,
      },
    });
  } catch (error) {
    console.error("Get invite error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch invite." });
  }
};

// @desc    Redeem / track invite usage
// @route   POST /api/invites/:inviteCode/redeem
// @access  Public
export const redeemInvite = async (req, res) => {
  try {
    const invite = await InviteLink.findOneAndUpdate(
      { inviteCode: req.params.inviteCode.toUpperCase() },
      { $inc: { usageCount: 1 } },
      { new: true }
    );

    if (!invite) {
      return res.status(404).json({ message: "Invite link not found." });
    }

    res.json({ success: true, message: "Invite registered." });
  } catch (error) {
    console.error("Redeem invite error:", error);
    res.status(500).json({ message: "Failed to redeem invite." });
  }
};
