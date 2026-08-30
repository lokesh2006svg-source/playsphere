import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const refreshTokenSchema = new mongoose.Schema(
  {
    tokenHash: {
      type: String,
      required: true,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    userAgent: {
      type: String,
      default: "",
    },
    ip: {
      type: String,
      default: "",
    },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    location: {
      type: String,
      default: "Tamil Nadu, India",
    },
    city: {
      type: String,
      default: "Chennai",
    },
    hasCompletedProfile: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["player", "ground_owner", "coach", "venue_admin", "admin", "super_admin", "organizer", "user"],
      default: "player",
    },
    isEmailVerified: {
      type: Boolean,
      default: true,
    },
    // Cryptographically hashed 6-digit verification code (Bcrypt)
    emailVerificationCodeHash: {
      type: String,
      default: null,
    },
    emailVerificationExpiry: {
      type: Date,
      default: null,
    },
    verificationAttempts: {
      type: Number,
      default: 0,
    },
    lastVerificationResendAt: {
      type: Date,
      default: null,
    },
    // Account lockout protection
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
    // Last login timestamp
    lastLoginAt: {
      type: Date,
      default: Date.now,
    },
    // Refresh Token Rotation (Hashed tokens stored in DB)
    refreshTokens: [refreshTokenSchema],
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.password;
        delete ret.emailVerificationCodeHash;
        delete ret.emailVerificationExpiry;
        delete ret.lastVerificationResendAt;
        delete ret.verificationAttempts;
        delete ret.failedLoginAttempts;
        delete ret.lockUntil;
        delete ret.refreshTokens;
        return ret;
      },
    },
    toObject: {
      transform: (doc, ret) => {
        delete ret.password;
        delete ret.emailVerificationCodeHash;
        delete ret.emailVerificationExpiry;
        delete ret.lastVerificationResendAt;
        delete ret.verificationAttempts;
        delete ret.failedLoginAttempts;
        delete ret.lockUntil;
        delete ret.refreshTokens;
        return ret;
      },
    },
  }
);

// Hash password before save
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Check if account is currently locked
userSchema.methods.isLocked = function () {
  return Boolean(this.lockUntil && this.lockUntil > Date.now());
};

const User = mongoose.model("User", userSchema);
export default User;
