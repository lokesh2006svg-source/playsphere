import React, { useState, useEffect } from "react";
import { fetchRules } from "../api";
import { useSports } from "../context/SportsContext";
import {
  BookOpen,
  Search,
  Users,
  Clock,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Sparkles,
} from "lucide-react";

const GameRules = () => {
  const { categories } = useSports();
  const [rules, setRules] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedSport, setExpandedSport] = useState(null);

  const loadRules = async () => {
    try {
      setLoading(true);
      const res = await fetchRules({
        category: selectedCategory === "All" ? undefined : selectedCategory,
        search,
      });
      if (res.data.success) {
        setRules(res.data.rules || []);
        if (res.data.rules?.length > 0 && !expandedSport) {
          setExpandedSport(res.data.rules[0].sport);
        }
      }
    } catch (err) {
      console.error("Error loading rules:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadRules();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in text-[#F5F0E6]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-gold" />
            <h1 className="text-2xl sm:text-3xl font-black text-[#F5F0E6]">33+ Sports Rules & Law Book</h1>
          </div>
          <p className="text-xs text-[#9B9691] mt-1">
            Official regulations, referee clarifications, durations, and player specifications
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gold/15 border border-gold/40 text-gold-glow rounded-full text-xs font-bold self-start sm:self-auto shadow-sm">
          <ShieldCheck className="w-4 h-4 text-gold" />
          <span>Official 2026 Federation Editions</span>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="bg-court-900 border border-court-700 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 shadow-gold/5">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-gold absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sports rules, fouls, or keywords (e.g. LBW, Offside, Silambam, Bonus)..."
            className="w-full bg-court-950 border border-court-700 text-[#F5F0E6] rounded-xl pl-10 pr-24 py-2.5 text-xs focus:ring-2 focus:ring-gold focus:border-gold focus:outline-none placeholder:text-[#656C7D]"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 px-4 py-1.5 bg-gradient-to-r from-gold to-amber-500 hover:from-gold-hover hover:to-amber-600 text-court-950 font-black rounded-lg text-xs transition-colors shadow-md shadow-gold/20"
          >
            Search
          </button>
        </form>

        {/* Category Pill Filters */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-court-700">
          <button
            onClick={() => setSelectedCategory("All")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === "All"
                ? "bg-gold text-court-950 shadow-md shadow-gold/20 font-black"
                : "bg-court-950 text-[#9B9691] border border-court-700 hover:bg-court-800 hover:text-white"
            }`}
          >
            All Categories
          </button>

          {(categories || []).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? "bg-gold text-court-950 shadow-md shadow-gold/20 font-black"
                  : "bg-court-950 text-[#9B9691] border border-court-700 hover:bg-court-800 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Rules Encyclopedia Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-64 bg-court-900 border border-court-700 rounded-3xl animate-pulse"
            ></div>
          ))}
        </div>
      ) : rules.length === 0 ? (
        <div className="bg-court-900 border border-court-700 rounded-3xl p-12 text-center max-w-md mx-auto shadow-xl">
          <BookOpen className="w-12 h-12 text-gold/40 mx-auto mb-2" />
          <h3 className="text-base font-bold text-[#F5F0E6]">No Rules Found</h3>
          <p className="text-xs text-[#9B9691] mt-1">Try another search keyword or category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rules.map((rule) => {
            const isExpanded = expandedSport === rule.sport;
            return (
              <div
                key={rule.sport}
                className="bg-court-900 border border-court-700 hover:border-gold/50 rounded-3xl p-6 shadow-xl hover:shadow-gold/10 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div>
                      <span className="px-2.5 py-0.5 bg-gold/15 border border-gold/30 text-gold-glow text-[10px] font-bold rounded-full uppercase">
                        {rule.category}
                      </span>
                      <h2 className="text-xl font-black text-[#F5F0E6] mt-1.5">{rule.sport}</h2>
                    </div>

                    <div className="text-right text-[10px] text-[#9B9691]">
                      <span>Updated 2026</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#9B9691] leading-relaxed mb-4">{rule.summary}</p>

                  <div className="grid grid-cols-2 gap-3 p-3 bg-court-950 border border-court-700 rounded-2xl text-xs text-[#9B9691] mb-4">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-gold" />
                      <span className="truncate">{rule.playerCount}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gold" />
                      <span className="truncate">{rule.duration}</span>
                    </div>
                  </div>

                  {/* Key Rules List */}
                  <div className="space-y-2 mb-4">
                    <span className="text-[11px] font-bold text-[#9B9691] uppercase tracking-wider block">
                      Core Regulations & Laws
                    </span>
                    <ul className="space-y-1.5">
                      {(rule.keyRules || []).slice(0, isExpanded ? 10 : 3).map((kr, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-[#F5F0E6] leading-relaxed">
                          <CheckCircle className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
                          <span>{kr}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-court-700 flex items-center justify-between gap-3 text-xs">
                  <div className="text-[11px] text-[#9B9691] truncate max-w-[200px]">
                    Source: <strong className="text-[#F5F0E6]">{rule.officialSourceName}</strong>
                  </div>

                  <div className="flex items-center gap-2">
                    {rule.keyRules?.length > 3 && (
                      <button
                        onClick={() => setExpandedSport(isExpanded ? null : rule.sport)}
                        className="text-xs text-gold font-bold hover:underline"
                      >
                        {isExpanded ? "Show Less" : "Read Full Rules"}
                      </button>
                    )}
                    {rule.officialSourceUrl && (
                      <a
                        href={rule.officialSourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 bg-court-800 hover:bg-court-750 border border-court-700 hover:border-gold/40 text-[#F5F0E6] rounded-lg transition-colors"
                        title="Official Federation Website"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-gold" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GameRules;
