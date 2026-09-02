import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { Download, ShieldCheck, Award, Star, QrCode, Sparkles, MapPin } from "lucide-react";

const PlayerIdCard = ({ cardData, playerName = "Player" }) => {
  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  if (!cardData) {
    return (
      <div className="p-8 text-center bg-court-900 border border-court-700 rounded-2xl text-[#9B9691]">
        No Digital Sports ID Card generated yet. Complete your profile to activate!
      </div>
    );
  }

  const {
    playerIdNumber = "PS-2026-00001",
    sport = "Cricket",
    secondarySports = [],
    skillLevel = "Intermediate",
    rating = 4.5,
    city = "Chennai",
    joinedDate = new Date(),
    badges = ["Verified Athlete", "Early Adopter"],
    profilePhoto,
  } = cardData;

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      setDownloading(true);
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#0F1115",
      });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `PlaySphere-ID-${playerIdNumber}.png`;
      link.click();
    } catch (err) {
      console.error("Failed to generate card image:", err);
    } finally {
      setDownloading(false);
    }
  };

  const rawJoinedDate = cardData.joinedDate || cardData.createdAt || Date.now();
  const issuedDateObj = new Date(rawJoinedDate);
  const formattedIssuedDate = !isNaN(issuedDateObj.getTime())
    ? issuedDateObj.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

  const validThruObj = new Date(issuedDateObj);
  validThruObj.setFullYear(validThruObj.getFullYear() + 1);
  const formattedValidThru = !isNaN(validThruObj.getTime())
    ? validThruObj.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Lifetime Verified";

  return (
    <div className="flex flex-col items-center">
      {/* Printable / Renderable Membership Card */}
      <div
        ref={cardRef}
        className="w-full max-w-md bg-gradient-to-br from-court-900 via-court-850 to-court-950 border-2 border-gold/45 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-[#F5F0E6] font-sans select-none shadow-gold/10"
      >
        {/* Holographic background glow */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-gold/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-gold/20 pb-4 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-xl bg-court-950 p-0.5 border border-gold/40 flex items-center justify-center shadow-lg shadow-gold/20 overflow-hidden">
              <img src="/logo.png" alt="PlaySphere Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="font-extrabold tracking-wider text-base uppercase bg-gradient-to-r from-gold-light via-gold to-amber-400 bg-clip-text text-transparent">
                PlaySphere
              </h3>
              <p className="text-[10px] text-gold tracking-widest font-bold uppercase">
                Official Athlete Pass
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-gold/10 border border-gold/30 rounded-full text-gold-glow text-xs font-semibold shadow-sm shadow-gold/10">
            <ShieldCheck className="w-3.5 h-3.5 text-gold" />
            <span>VERIFIED</span>
          </div>
        </div>

        {/* Card Body */}
        <div className="mt-5 grid grid-cols-3 gap-4 items-center relative z-10">
          {/* Avatar Section */}
          <div className="col-span-1 flex flex-col items-center">
            <div className="w-24 h-24 rounded-2xl bg-court-800 border-2 border-gold/40 overflow-hidden shadow-inner flex items-center justify-center relative">
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt={playerName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-court-800 to-court-950 flex items-center justify-center text-3xl font-black text-gold">
                  {playerName.charAt(0)}
                </div>
              )}
              <div className="absolute bottom-1 right-1 bg-gradient-to-r from-gold to-amber-500 rounded-full p-0.5 shadow">
                <Sparkles className="w-3 h-3 text-court-950" />
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="col-span-2 space-y-1.5">
            <div>
              <span className="text-[10px] font-bold text-[#9B9691] uppercase tracking-wider">
                Athlete Name
              </span>
              <h4 className="text-lg font-bold text-[#F5F0E6] tracking-wide truncate">
                {playerName}
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-[#9B9691] font-medium block">
                  Primary Sport
                </span>
                <span className="font-semibold text-gold-light flex items-center gap-1">
                  {sport}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#9B9691] font-medium block">
                  Skill Level
                </span>
                <span className="font-semibold text-amber-300 capitalize">
                  {skillLevel}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1 text-xs text-[#9B9691]">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-gold" />
                {city}
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {rating > 0 ? rating.toFixed(1) : "Unrated"}
              </span>
            </div>
          </div>
        </div>

        {/* Badges Carousel / Row */}
        {badges && badges.length > 0 && (
          <div className="mt-4 pt-3 border-t border-court-700/80 flex flex-wrap gap-1.5 relative z-10">
            {badges.slice(0, 3).map((b, i) => (
              <span
                key={i}
                className="px-2.5 py-0.5 text-[10px] font-semibold bg-court-800/90 border border-gold/30 rounded-md text-gold-light flex items-center gap-1 shadow-sm"
              >
                <Award className="w-2.5 h-2.5 text-gold" />
                {b}
              </span>
            ))}
          </div>
        )}

        {/* Card Footer with ID Number & QR Code */}
        <div className="mt-5 pt-3 border-t border-gold/20 flex items-center justify-between relative z-10">
          <div>
            <span className="text-[9px] text-[#9B9691] uppercase font-mono block">
              Player Membership ID
            </span>
            <span className="font-mono text-sm font-extrabold text-gold tracking-widest">
              {playerIdNumber}
            </span>
            <div className="flex items-center gap-2 mt-1 text-[9px] text-[#9B9691] font-mono">
              <span>Issued: <strong className="text-[#F5F0E6]">{formattedIssuedDate}</strong></span>
              <span>•</span>
              <span>Valid Thru: <strong className="text-emerald-400">{formattedValidThru}</strong></span>
            </div>
          </div>

          <div className="bg-court-950 p-1.5 rounded-xl border border-gold/30 shadow-md flex items-center justify-center">
            {/* Styled QR Block */}
            <div className="w-12 h-12 bg-court-900 border border-gold/20 flex flex-col items-center justify-center rounded text-white text-[8px] font-mono text-center p-1">
              <QrCode className="w-7 h-7 text-gold" />
              <span className="text-[7px] text-gold-light scale-90">VERIFY</span>
            </div>
          </div>
        </div>
      </div>

      {/* Download Action Button */}
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-gold via-amber-400 to-gold-hover hover:from-gold-hover hover:to-amber-500 text-court-950 font-black rounded-xl shadow-lg shadow-gold/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
      >
        <Download className="w-4 h-4" />
        {downloading ? "Generating Card Image..." : "Download Digital Sports ID (PNG)"}
      </button>
    </div>
  );
};

export default PlayerIdCard;
