import GameRule from "../models/GameRule.js";
import SPORTS_LIST from "../constants/sports.js";
import axios from "axios";
import { triggerWebhook } from "../utils/webhookNotifier.js";

/**
 * Placeholder LLM connector function.
 * If user sets LLM_API_KEY in .env, it can call OpenAI/Gemini/Claude compatible endpoints.
 * Otherwise, it uses PlaySphere's built-in intelligent rule synthesizer.
 */
const callLLM = async (prompt, contextRule, userQuery) => {
  const apiKey = process.env.LLM_API_KEY;

  if (apiKey) {
    try {
      // Example call to OpenAI / Gemini compatible API endpoint
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `You are PlaySphere AI, the official sports referee and rules expert. Context: ${JSON.stringify(
                contextRule
              )}. Answer accurately based on verified sports rules. Keep responses crisp, clear, and cite official rules when applicable.`,
            },
            { role: "user", content: userQuery },
          ],
          temperature: 0.3,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 5000,
        }
      );

      const reply = response.data?.choices?.[0]?.message?.content;
      if (reply) return reply;
    } catch (err) {
      console.warn("LLM API Call failed, falling back to built-in rule synthesizer:", err.message);
    }
  }

  // Built-in intelligent RAG synthesizer fallback
  if (contextRule) {
    const rulesSummary = contextRule.keyRules
      .slice(0, 4)
      .map((r, i) => `${i + 1}. ${r}`)
      .join("\n");

    const queryLower = userQuery.toLowerCase();

    let focusedRule = contextRule.keyRules.find((r) => {
      const words = queryLower.split(" ").filter((w) => w.length > 3);
      return words.some((w) => r.toLowerCase().includes(w));
    });

    let answerText = `### 📖 ${contextRule.sport} Rules Summary\n\n`;
    answerText += `${contextRule.summary}\n\n`;

    if (focusedRule) {
      answerText += `**Specific Rule Insight:**\n> "${focusedRule}"\n\n`;
    }

    answerText += `**Key Rules & Specifications:**\n${rulesSummary}\n\n`;
    answerText += `⏱ **Duration:** ${contextRule.duration}\n`;
    answerText += `👥 **Player Count:** ${contextRule.playerCount}\n`;
    answerText += `🏛 **Official Source:** *${contextRule.officialSourceName}*`;

    return answerText;
  }

  return `I am PlaySphere AI, your official rules referee! You can ask me any question about the rules, player counts, match durations, or scoring across 33+ sports including Cricket, Football, Kabaddi, Badminton, Silambam, Chess, and Tennis.`;
};

// @desc    Ask AI Sports Rules Chatbot (RAG based)
// @route   POST /api/chatbot/ask
// @access  Public
export const askChatbot = async (req, res) => {
  try {
    const query = req.body.query || req.body.message;

    if (!query || typeof query !== "string") {
      return res.status(400).json({ message: "Please provide a query string." });
    }

    const cleanQuery = query.trim().toLowerCase();

    // 1. Detect sport from user query
    let detectedSport = null;

    // Search direct sport names
    for (const s of SPORTS_LIST) {
      if (cleanQuery.includes(s.name.toLowerCase())) {
        detectedSport = s.name;
        break;
      }
    }

    // Keyword mapping for specific sports terms
    if (!detectedSport) {
      const keywordMap = {
        lbw: "Cricket",
        wicket: "Cricket",
        bowler: "Cricket",
        googly: "Cricket",
        offside: "Football",
        penalty: "Football",
        corner: "Football",
        var: "Football",
        raid: "Kabaddi",
        cant: "Kabaddi",
        bonus: "Kabaddi",
        shuttlecock: "Badminton",
        deuce: "Tennis",
        checkmate: "Chess",
        castling: "Chess",
        enpassant: "Chess",
        kalaripayattu: "Silambam",
        stick: "Silambam",
        knockout: "Boxing",
        dunk: "Basketball",
      };

      for (const [kw, sp] of Object.entries(keywordMap)) {
        if (cleanQuery.includes(kw)) {
          detectedSport = sp;
          break;
        }
      }
    }

    // 2. Retrieve matched GameRule from DB
    let matchedRule = null;
    if (detectedSport) {
      matchedRule = await GameRule.findOne({
        sport: new RegExp(`^${detectedSport}$`, "i"),
      });
    }

    // If still null, try finding any rule whose keyRules or summary contain query words
    if (!matchedRule) {
      matchedRule = await GameRule.findOne({
        $text: { $search: cleanQuery },
      }).catch(() => null);
    }

    // 3. Synthesize answer
    const answer = await callLLM(cleanQuery, matchedRule, query);

    // If user query mentions escalation, dispute, or contact organizer
    if (
      cleanQuery.includes("dispute") ||
      cleanQuery.includes("escalat") ||
      cleanQuery.includes("organizer") ||
      cleanQuery.includes("cheat")
    ) {
      triggerWebhook("chatbot_escalation", {
        userQuery: query,
        detectedSport: detectedSport || "General",
        timestamp: new Date().toISOString(),
      });
    }

    res.json({
      success: true,
      query,
      detectedSport: detectedSport || "General",
      source: matchedRule ? matchedRule.officialSourceName : "PlaySphere Knowledge Base",
      officialSourceUrl: matchedRule?.officialSourceUrl || "",
      answer,
    });
  } catch (error) {
    console.error("Chatbot query error:", error);
    res.status(500).json({
      message: "An error occurred while answering your sports rules query.",
      answer: "I'm having trouble processing that query right now. Please check the Game Rules section directly!",
    });
  }
};
