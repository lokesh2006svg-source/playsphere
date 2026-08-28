import express from "express";
import { askChatbot } from "../controllers/chatbotController.js";
import { chatbotLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/ask", chatbotLimiter, askChatbot);

export default router;
