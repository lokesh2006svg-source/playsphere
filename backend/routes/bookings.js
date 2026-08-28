import express from "express";
import {
  createBooking,
  generatePaymentQR,
  confirmPayment,
  getMyBookings,
  cancelBooking,
} from "../controllers/bookingController.js";
import { protect } from "../middleware/auth.js";
import { paymentConfirmLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/", protect, createBooking);
router.post("/:id/generate-payment-qr", protect, generatePaymentQR);
router.post("/:id/confirm-payment", protect, paymentConfirmLimiter, confirmPayment);
router.get("/my", protect, getMyBookings);
router.put("/:id/cancel", protect, cancelBooking);

export default router;
