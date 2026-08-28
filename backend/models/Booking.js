import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    venueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Venue",
      required: true,
    },
    bookingDate: {
      type: String, // Format: YYYY-MM-DD
      required: true,
    },
    startTime: {
      type: String, // Format: "HH:mm" e.g. "18:00"
      required: true,
    },
    endTime: {
      type: String, // Format: "HH:mm" e.g. "19:00"
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "pending", "refunded"],
      default: "unpaid",
    },
    paymentMethod: {
      type: String,
      enum: ["upi_qr", "cash_on_arrival", "UPI / Card"],
      default: "upi_qr",
    },
    paymentTransactionId: {
      type: String,
      default: null,
    },
    paymentUtrNumber: {
      type: String,
      default: null,
    },
    paymentScreenshot: {
      type: String,
      default: null,
    },
    paymentConfirmationAttempts: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate confirmed bookings on same venue, date and time
bookingSchema.index(
  { venueId: 1, bookingDate: 1, startTime: 1 },
  { unique: true, partialFilterExpression: { status: "confirmed" } }
);
bookingSchema.index({ venueId: 1, bookingDate: 1, startTime: 1, status: 1 });

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
