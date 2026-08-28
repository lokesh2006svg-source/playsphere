import QRCode from "qrcode";
import Booking from "../models/Booking.js";
import Venue from "../models/Venue.js";
import Notification from "../models/Notification.js";
import { triggerWebhook } from "../utils/webhookNotifier.js";
import { recordAuditLog } from "../utils/auditLogger.js";

// @desc    Create a new court/venue booking with overlap validation
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req, res) => {
  try {
    const { venueId, bookingDate, startTime, endTime, paymentMethod = "upi_qr" } = req.body;

    if (!venueId || !bookingDate || !startTime || !endTime) {
      return res.status(400).json({
        message: "Please provide venueId, bookingDate, startTime, and endTime.",
      });
    }

    const venue = await Venue.findById(venueId);
    if (!venue) {
      return res.status(404).json({ message: "Venue not found." });
    }

    // Check for overlap with existing confirmed booking
    const overlap = await Booking.findOne({
      venueId,
      bookingDate,
      startTime,
      status: "confirmed",
    });

    if (overlap) {
      return res.status(409).json({
        message: "This slot is already booked. Please choose another time slot.",
      });
    }

    // Calculate total price based on duration
    const startHour = parseInt(startTime.split(":")[0], 10);
    const endHour = parseInt(endTime.split(":")[0], 10);
    const durationHours = Math.max(1, endHour - startHour);
    const totalPrice = durationHours * venue.pricePerHour;

    const isCash = paymentMethod === "cash_on_arrival";

    // If user has an existing pending booking for this exact slot, reuse it
    let booking = await Booking.findOne({
      userId: req.user._id,
      venueId,
      bookingDate,
      startTime,
      status: "pending",
    });

    if (!booking) {
      booking = await Booking.create({
        userId: req.user._id,
        venueId,
        bookingDate,
        startTime,
        endTime,
        status: isCash ? "confirmed" : "pending",
        totalPrice,
        paymentStatus: isCash ? "unpaid" : "unpaid",
        paymentMethod: isCash ? "cash_on_arrival" : "upi_qr",
        paymentTransactionId: isCash ? `CASH-ON-ARRIVAL-${Date.now().toString(36).toUpperCase()}` : null,
      });
    } else {
      booking.paymentMethod = isCash ? "cash_on_arrival" : "upi_qr";
      booking.totalPrice = totalPrice;
      if (isCash) {
        booking.status = "confirmed";
        booking.paymentTransactionId = `CASH-ON-ARRIVAL-${Date.now().toString(36).toUpperCase()}`;
      }
      await booking.save();
    }

    const populatedBooking = await Booking.findById(booking._id).populate("venueId");

    // If cash on arrival, create notification & trigger webhook immediately
    if (isCash) {
      await Notification.create({
        userId: req.user._id,
        type: "booking_confirmed",
        title: "Booking Reserved (Pay on Arrival) 🏟️",
        message: `Your booking for ${venue.name} on ${bookingDate} at ${startTime} - ${endTime} is reserved. Please pay ₹${totalPrice} at the venue reception counter.`,
        link: "/bookings",
        metadata: { bookingId: booking._id, venueId: venue._id },
      });

      triggerWebhook("booking_confirmed", {
        bookingId: booking._id,
        userName: req.user.name,
        userEmail: req.user.email,
        venueName: venue.name,
        sportType: venue.sportType,
        city: venue.city,
        bookingDate,
        startTime,
        endTime,
        totalPrice,
        paymentMethod: "cash_on_arrival",
        paymentStatus: "unpaid",
      });
    }

    res.status(201).json({
      success: true,
      message: isCash
        ? "Venue reserved with Cash on Arrival!"
        : "Booking initiated. Complete UPI QR payment to confirm slot.",
      booking: populatedBooking,
    });
  } catch (error) {
    console.error("Create booking error:", error);
    res.status(500).json({ message: error.message || "Failed to complete booking." });
  }
};

// @desc    Generate UPI payment QR code (base64 Data URL) for a booking
// @route   POST /api/bookings/:id/generate-payment-qr
// @access  Private
export const generatePaymentQR = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("venueId");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to access this booking." });
    }

    // =========================================================================
    // NOTE: This UPI ID receives demo/test payments only. For a real production
    // app, integrate a proper payment gateway (Razorpay, PayU, Cashfree) for
    // verified, secure transactions instead of relying on a raw UPI QR code.
    // =========================================================================
    const upiAdminId = process.env.UPI_ADMIN_ID || "lokesh2006svg@okhdfcbank";
    const upiString = `upi://pay?pa=${upiAdminId}&pn=PlaySphere&am=${booking.totalPrice}&tn=Booking-${booking._id}&cu=INR`;

    // Convert UPI string to a high-contrast base64 Data URL QR Code
    const qrCodeDataUrl = await QRCode.toDataURL(upiString, {
      width: 320,
      margin: 2,
      color: {
        dark: "#050b14", // Deep court tone
        light: "#ffffff",
      },
    });

    res.json({
      success: true,
      qrCode: qrCodeDataUrl,
      payeeName: "PlaySphere Sports Merchant",
      amount: booking.totalPrice,
      bookingId: booking._id,
      paymentStatus: booking.paymentStatus,
      paymentMethod: booking.paymentMethod || "upi_qr",
      venue: {
        _id: booking.venueId?._id,
        name: booking.venueId?.name || "Sports Ground",
        city: booking.venueId?.city || "Tamil Nadu",
        sportType: booking.venueId?.sportType || "General",
        address: booking.venueId?.address || "",
      },
      bookingDate: booking.bookingDate,
      timeSlot: `${booking.startTime} - ${booking.endTime}`,
      isDemo: true,
      warning: "⚠️ Demo Mode: This QR code is for testing only. Do not send real money. This project does not have a verified payment gateway integration.",
      note: "SIMULATION ONLY: No real banking transaction occurs.",
    });
  } catch (error) {
    console.error("Generate payment QR error:", error);
    res.status(500).json({ message: error.message || "Failed to generate payment QR." });
  }
};

// @desc    Simulate and confirm booking payment (Demo UPI QR / Cash)
// @route   POST /api/bookings/:id/confirm-payment
// @access  Private
export const confirmPayment = async (req, res) => {
  try {
    const { paymentMethod = "upi_qr", paymentScreenshot, paymentUtrNumber } = req.body;
    const booking = await Booking.findById(req.params.id).populate("venueId");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== "admin" && req.user.role !== "super_admin") {
      return res.status(403).json({ message: "Not authorized to confirm payment for this booking." });
    }

    // Prevent double-confirmation: once paid, reject any further confirmation requests
    if (booking.paymentStatus === "paid" || booking.status === "confirmed") {
      await recordAuditLog({
        req,
        action: "payment_double_confirmation_rejected",
        targetId: booking._id,
        targetCollection: "bookings",
        details: {
          reason: "Booking already marked as paid",
          existingTxnId: booking.paymentTransactionId,
          ip: req.ip,
        },
        status: "rejected",
      });
      return res.status(400).json({
        success: false,
        message: `This booking has already been paid and confirmed (Ref: ${booking.paymentTransactionId || "PAID"}). Double-confirmation is not permitted.`,
      });
    }

    // Rate-limit confirm-payment: max 3 attempts per booking
    if ((booking.paymentConfirmationAttempts || 0) >= 3 && booking.paymentStatus !== "paid") {
      await recordAuditLog({
        req,
        action: "payment_confirmation_blocked",
        targetId: booking._id,
        targetCollection: "bookings",
        details: { reason: "Max attempts exceeded (3)", ip: req.ip },
        status: "blocked",
      });
      return res.status(429).json({
        success: false,
        message: "Maximum payment confirmation attempts (3) exceeded for this booking. Please contact support.",
      });
    }

    booking.paymentConfirmationAttempts = (booking.paymentConfirmationAttempts || 0) + 1;

    // Prominent demo payment security notice
    const demoWarning =
      "This is a demo confirmation. No real payment verification occurred. For production use, integrate a certified payment gateway (Razorpay/PayU/Cashfree) with webhook-based payment verification before marking bookings as paid.";

    // =========================================================================
    // NOTE: Simulated Payment Confirmation (Demo Purposes)
    // Supports user-submitted UTR/Ref or generates a mock reference ID
    // =========================================================================
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const timestampRef = Date.now().toString(36).toUpperCase();
    const confirmedTxnId = paymentUtrNumber?.trim()
      ? paymentUtrNumber.trim().toUpperCase()
      : `DEMO-TXN-${timestampRef}-${randomSuffix}`;

    booking.paymentStatus = "paid";
    booking.paymentMethod = paymentMethod;
    booking.paymentTransactionId = confirmedTxnId;
    booking.paymentUtrNumber = paymentUtrNumber?.trim() || null;
    booking.paymentScreenshot = paymentScreenshot || null;
    booking.status = "confirmed";
    await booking.save();

    const venue = booking.venueId;

    // Record security audit log
    await recordAuditLog({
      req,
      action: "payment_confirmed",
      targetId: booking._id,
      targetCollection: "bookings",
      details: {
        totalPrice: booking.totalPrice,
        paymentMethod: booking.paymentMethod,
        transactionId: confirmedTxnId,
        hasScreenshot: Boolean(paymentScreenshot),
        paymentUtrNumber: paymentUtrNumber || null,
        venueId: venue?._id,
        isDemo: true,
      },
      status: "success",
    });

    // Create in-app Notification for user
    await Notification.create({
      userId: req.user._id,
      type: "booking_confirmed",
      title: "Booking & Payment Confirmed! 💳🎉",
      message: `Payment of ₹${booking.totalPrice} verified (Ref: ${confirmedTxnId}). Your slot for ${venue?.name || "Turf"} on ${booking.bookingDate} (${booking.startTime} - ${booking.endTime}) is confirmed.`,
      link: "/bookings",
      metadata: { bookingId: booking._id, venueId: venue?._id, transactionId: confirmedTxnId },
    });

    // Fire non-blocking n8n Webhook for external automations
    triggerWebhook("booking_confirmed", {
      bookingId: booking._id,
      transactionId: confirmedTxnId,
      userName: req.user.name,
      userEmail: req.user.email,
      venueName: venue?.name,
      sportType: venue?.sportType,
      city: venue?.city,
      bookingDate: booking.bookingDate,
      startTime: booking.startTime,
      endTime: booking.endTime,
      totalPrice: booking.totalPrice,
      paymentMethod: booking.paymentMethod,
      paymentStatus: "paid",
    });

    res.json({
      success: true,
      message: "Payment confirmed successfully! Your booking is active.",
      warning: demoWarning,
      isDemo: true,
      booking,
      transactionId: confirmedTxnId,
    });
  } catch (error) {
    console.error("Confirm payment error:", error);
    res.status(500).json({ message: error.message || "Failed to confirm payment." });
  }
};

// @desc    Get current user's bookings
// @route   GET /api/bookings/my
// @access  Private
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate("venueId")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get my bookings error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch bookings." });
  }
};

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to cancel this booking." });
    }

    booking.status = "cancelled";
    booking.paymentStatus = "refunded";
    await booking.save();

    res.json({
      success: true,
      message: "Booking cancelled and refund processed.",
      booking,
    });
  } catch (error) {
    console.error("Cancel booking error:", error);
    res.status(500).json({ message: error.message || "Failed to cancel booking." });
  }
};
