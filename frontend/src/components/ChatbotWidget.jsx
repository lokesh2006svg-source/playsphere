import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  X,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Bot,
  User,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { askRulesChatbot } from "../api";

const SUGGESTED_QUERIES = [
  "How does the LBW rule work in cricket?",
  "What is a Do-or-Die raid in Kabaddi?",
  "Explain the Offside rule in Football",
  "What are the scoring rules in Silambam?",
  "How long is a Badminton match?",
];

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "👋 Hello! I am PlaySphere AI, your official referee & championship rules guide across 33+ sports. Ask me about any rule, foul, player count, or regulation!",
      source: "PlaySphere Rulebook 2026",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceOutputEnabled, setVoiceOutputEnabled] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Voice synthesis helper
  const speak = (text) => {
    if (!voiceOutputEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // Stop ongoing speech

    // Clean markdown hashes and asterisks for smooth speech
    const cleanText = text.replace(/[#*`_>]/g, "").slice(0, 280);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // Web Speech API: Voice Recognition (Mic)
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome or Edge.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-IN";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch (err) {
      console.warn("Speech recognition init error:", err);
      setIsListening(false);
    }
  };

  const handleSend = async (customQuery = null) => {
    const query = (customQuery || input).trim();
    if (!query || loading) return;

    // Add user message
    const userMsg = { sender: "user", text: query };
    setMessages((prev) => [...prev, userMsg]);
    if (!customQuery) setInput("");
    setLoading(true);

    try {
      const res = await askRulesChatbot(query);
      if (res.data.success) {
        const botMsg = {
          sender: "bot",
          text: res.data.answer,
          source: res.data.source,
          sourceUrl: res.data.sourceUrl,
        };
        setMessages((prev) => [...prev, botMsg]);
        speak(res.data.answer);
      } else {
        const fallbackMsg = {
          sender: "bot",
          text: "I couldn't retrieve that specific rule. Please check our Rules page for standard sport regulations.",
        };
        setMessages((prev) => [...prev, fallbackMsg]);
      }
    } catch (err) {
      console.error(err);
      const errMsg = {
        sender: "bot",
        text: "Apologies, the rules assistant is currently taking a timeout. Please try again shortly.",
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3.5 bg-gradient-to-r from-gold via-amber-400 to-gold-hover hover:from-gold-hover hover:to-amber-500 text-court-950 font-black rounded-2xl shadow-xl shadow-gold/25 transition-all transform hover:scale-105 active:scale-95 group border border-gold/40"
          aria-label="Open AI Sports Referee"
        >
          <Bot className="w-6 h-6 animate-pulse" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap text-xs font-black uppercase tracking-wider">
            AI Rules Referee
          </span>
        </button>
      )}

      {/* Chat Window Modal */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 md:w-[420px] h-[580px] max-h-[85vh] bg-court-900 border border-court-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fade-in text-[#F5F0E6] shadow-gold/10">
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-court-950 via-court-900 to-court-950 border-b border-court-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-gold to-amber-400 flex items-center justify-center text-court-950 font-black shadow-md shadow-gold/20">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#F5F0E6] flex items-center gap-1.5">
                  PlaySphere AI Referee
                  <span className="w-2 h-2 rounded-full bg-gold animate-ping"></span>
                </h3>
                <p className="text-[10px] text-gold/80">Verified 33+ Sports Rules Engine</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Voice output toggle */}
              <button
                onClick={() => setVoiceOutputEnabled(!voiceOutputEnabled)}
                className={`p-2 rounded-lg transition-colors ${
                  voiceOutputEnabled ? "text-gold bg-gold/10" : "text-[#9B9691] hover:text-[#F5F0E6]"
                }`}
                title={voiceOutputEnabled ? "Mute Voice Output" : "Enable Voice Output"}
              >
                {voiceOutputEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-[#9B9691] hover:text-[#F5F0E6] rounded-lg hover:bg-court-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-court-950/70">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.sender === "bot" && (
                  <div className="w-7 h-7 rounded-lg bg-gold/20 text-gold flex items-center justify-center shrink-0 mt-0.5 border border-gold/30">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                    m.sender === "user"
                      ? "bg-gradient-to-r from-amber-600 to-amber-700 text-[#F5F0E6] font-medium rounded-br-none shadow-md shadow-amber-600/20"
                      : "bg-court-850 border border-court-700 text-[#F5F0E6] rounded-bl-none shadow-md"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>

                  {m.source && (
                    <div className="mt-2 pt-1.5 border-t border-court-700 text-[10px] text-gold-glow flex items-center justify-between gap-1">
                      <span>Source: {m.source}</span>
                      {m.sourceUrl && (
                        <a
                          href={m.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline flex items-center gap-0.5 text-gold"
                        >
                          Official Rulebook <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {m.sender === "user" && (
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/30">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-lg bg-gold/20 text-gold flex items-center justify-center shrink-0 border border-gold/30">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-court-850 border border-court-700 rounded-2xl px-4 py-3 rounded-bl-none flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-gold animate-bounce"></div>
                  <div
                    className="w-2 h-2 rounded-full bg-gold animate-bounce"
                    style={{ animationDelay: "0.15s" }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-gold animate-bounce"
                    style={{ animationDelay: "0.3s" }}
                  ></div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggested Queries Chips */}
          <div className="px-3 py-2 bg-court-900 border-t border-court-700 overflow-x-auto flex gap-1.5 no-scrollbar">
            {SUGGESTED_QUERIES.map((sq, i) => (
              <button
                key={i}
                onClick={() => handleSend(sq)}
                className="px-2.5 py-1 text-[10px] bg-court-800 hover:bg-gold/20 hover:text-gold text-[#9B9691] border border-court-700 rounded-full whitespace-nowrap transition-colors"
              >
                {sq}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-court-950 border-t border-court-700 flex items-center gap-2">
            {/* Speech to text button */}
            <button
              onClick={toggleSpeechRecognition}
              className={`p-2.5 rounded-xl transition-all ${
                isListening
                  ? "bg-red-500/20 text-red-400 border border-red-500 animate-pulse"
                  : "bg-court-800 hover:bg-court-750 text-[#9B9691] border border-court-700"
              }`}
              title={isListening ? "Listening... Click to stop" : "Voice Input (Speech to Text)"}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={isListening ? "Listening... speak now" : "Ask any sports rule question..."}
              className="flex-1 bg-court-900 border border-court-700 text-[#F5F0E6] text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold placeholder:text-[#656C7D]"
            />

            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="p-2.5 bg-gradient-to-r from-gold to-amber-500 hover:from-gold-hover hover:to-amber-600 text-court-950 font-black rounded-xl transition-colors disabled:opacity-40 shadow-md shadow-gold/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;
