import React from "react";
import { Link } from "react-router-dom";
import { Trophy, Heart, Shield, Sparkles, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-court-950 border-t border-court-700 pt-12 pb-8 text-[#9B9691] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-court-900 p-0.5 border border-gold/40 flex items-center justify-center overflow-hidden shadow-md shadow-gold/10">
                <img src="/logo.png" alt="PlaySphere Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-base font-black text-[#F5F0E6] tracking-wider">
                PLAY<span className="text-gold">SPHERE</span>
              </span>
            </div>
            <p className="text-[#9B9691] leading-relaxed text-xs">
              The unified sports community platform for athletes, court bookings, tournament leagues, live score tracking, and official sport bodies in Tamil Nadu.
            </p>
            <div className="flex items-center gap-1 text-[#9B9691] text-[11px]">
              <MapPin className="w-3.5 h-3.5 text-gold" />
              <span>Chennai • Coimbatore • Madurai • Trichy • Salem</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-[#F5F0E6] uppercase tracking-wider text-xs mb-3">Community</h4>
            <ul className="space-y-2">
              <li><Link to="/players" className="hover:text-gold transition-colors">Find Nearby Players</Link></li>
              <li><Link to="/venues" className="hover:text-gold transition-colors">Court & Turf Bookings</Link></li>
              <li><Link to="/teams" className="hover:text-gold transition-colors">Sports Teams & Clubs</Link></li>
              <li><Link to="/tournaments" className="hover:text-gold transition-colors">State & District Tournaments</Link></li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="font-bold text-[#F5F0E6] uppercase tracking-wider text-xs mb-3">Features</h4>
            <ul className="space-y-2">
              <li><Link to="/live" className="hover:text-gold transition-colors">Live Match Scores & Stream</Link></li>
              <li><Link to="/rules" className="hover:text-gold transition-colors">33+ Sports Rules Guide</Link></li>
              <li><Link to="/official-bodies" className="hover:text-gold transition-colors">Official Sports Bodies</Link></li>
              <li><Link to="/profile" className="hover:text-gold transition-colors">Digital Athlete ID Pass</Link></li>
            </ul>
          </div>

          {/* Verified Governing Bodies */}
          <div>
            <h4 className="font-bold text-[#F5F0E6] uppercase tracking-wider text-xs mb-3">Associations</h4>
            <p className="text-[#9B9691] mb-2">Connected with certified Tamil Nadu associations:</p>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2 py-1 bg-court-900 border border-court-700 rounded text-[10px] text-[#F5F0E6]">TNCA (Cricket)</span>
              <span className="px-2 py-1 bg-court-900 border border-court-700 rounded text-[10px] text-[#F5F0E6]">TNFA (Football)</span>
              <span className="px-2 py-1 bg-court-900 border border-court-700 rounded text-[10px] text-[#F5F0E6]">TNKA (Kabaddi)</span>
              <span className="px-2 py-1 bg-court-900 border border-court-700 rounded text-[10px] text-[#F5F0E6]">TNBA (Basketball)</span>
              <span className="px-2 py-1 bg-court-900 border border-court-700 rounded text-[10px] text-[#F5F0E6]">TNSA (Silambam)</span>
            </div>
          </div>
        </div>

        <div className="border-t border-court-700 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#9B9691]">
          <p>© {new Date().getFullYear()} PlaySphere Sports Platform. Built for Tamil Nadu Athletics & Championship Community.</p>
          <p className="flex items-center gap-1">
            Empowering grassroots sports with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> & AI
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
