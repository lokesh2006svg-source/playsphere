import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchClubs } from "../api";
import SportSelector from "../components/SportSelector";
import DistrictSelector from "../components/DistrictSelector";
import {
  Shield,
  MapPin,
  Users,
  Search,
  CheckCircle2,
  ExternalLink,
  Building,
} from "lucide-react";

const Clubs = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sport, setSport] = useState("All");
  const [city, setCity] = useState("All");
  const [search, setSearch] = useState("");

  const loadClubs = async () => {
    try {
      setLoading(true);
      const res = await fetchClubs({
        sport: sport === "All" ? undefined : sport,
        city: city === "All" ? undefined : city,
        search,
      });
      if (res.data.success) {
        setClubs(res.data.clubs || []);
      }
    } catch (err) {
      console.error("Error loading clubs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClubs();
  }, [sport, city]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadClubs();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in text-[#F5F0E6]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-gold" />
            <h1 className="text-2xl sm:text-3xl font-black text-[#F5F0E6]">Registered Sports Clubs & Academies</h1>
          </div>
          <p className="text-xs text-[#9B9691] mt-1">
            Certified sports clubs, coaching centers, and training grounds across Tamil Nadu
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-court-900 border border-court-700 rounded-3xl p-5 sm:p-6 shadow-xl grid grid-cols-1 sm:grid-cols-3 gap-4 shadow-gold/5">
        <div>
          <label className="block text-[11px] font-bold text-[#9B9691] uppercase mb-1">
            Search Clubs
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-gold absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search club name..."
              className="w-full bg-court-950 border border-court-700 text-[#F5F0E6] rounded-xl pl-10 pr-4 py-2.5 text-xs focus:ring-2 focus:ring-gold focus:border-gold focus:outline-none placeholder:text-[#656C7D]"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[#9B9691] uppercase mb-1">
            Sport
          </label>
          <SportSelector
            value={sport}
            onChange={(e) => setSport(e.target.value)}
            includeAll={true}
            allLabel="All Sports"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[#9B9691] uppercase mb-1">
            District / Region
          </label>
          <DistrictSelector
            value={city}
            onChange={(e) => setCity(e.target.value)}
            includeAll={true}
            allLabel="All 38 Districts"
            placeholder="All Districts"
          />
        </div>
      </div>

      {/* Clubs Grid */}
      <div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 bg-court-900 border border-court-700 rounded-3xl animate-pulse"
              ></div>
            ))}
          </div>
        ) : clubs.length === 0 ? (
          <div className="bg-court-900 border border-court-700 rounded-3xl p-12 text-center max-w-md mx-auto shadow-xl">
            <Shield className="w-12 h-12 text-gold mx-auto mb-3" />
            <h3 className="text-lg font-bold text-[#F5F0E6] mb-1">No Clubs Found</h3>
            <p className="text-xs text-[#9B9691]">Try changing your search parameters or sport filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {clubs.map((club) => (
              <div
                key={club._id}
                className="bg-court-900 border border-court-700 hover:border-gold/50 rounded-3xl p-6 shadow-lg hover:shadow-2xl hover:shadow-gold/10 transition-all duration-200 flex flex-col justify-between hover:-translate-y-1 group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-court-800 border border-gold/40 flex items-center justify-center font-black text-gold text-lg shrink-0 shadow-inner">
                        {club.logo ? (
                          <img
                            src={club.logo}
                            alt={club.name}
                            className="w-full h-full object-cover rounded-2xl"
                          />
                        ) : (
                          club.name.charAt(0)
                        )}
                      </div>

                      <div>
                        <h3 className="font-bold text-[#F5F0E6] text-base group-hover:text-gold transition-colors line-clamp-1">
                          {club.name}
                        </h3>
                        <p className="text-xs text-[#9B9691] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-gold" />
                          {club.city}
                        </p>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 bg-gold/15 border border-gold/30 text-gold text-[10px] font-bold rounded-full">
                      {club.sport}
                    </span>
                  </div>

                  {club.description && (
                    <p className="text-xs text-[#9B9691] line-clamp-2 leading-relaxed mb-4">
                      {club.description}
                    </p>
                  )}

                  <div className="space-y-2 py-3 border-t border-court-700 text-xs text-[#9B9691]">
                    <div className="flex items-center justify-between">
                      <span className="text-[#9B9691]">Home Ground:</span>
                      <span className="font-semibold text-[#F5F0E6] truncate max-w-[170px]">
                        {club.homeGround || "Local Ground"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#9B9691]">Est. Year:</span>
                      <span className="font-semibold text-[#F5F0E6]">{club.foundedYear}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#9B9691]">Affiliation:</span>
                      <span className="text-gold font-bold">
                        {club.stateBodyId?.name || "Tamil Nadu Association"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-court-700 flex items-center justify-between">
                  <span className="text-xs text-[#9B9691] flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-gold" />
                    {club.memberCount || 25} Athletes
                  </span>

                  {club.contactEmail && (
                    <a
                      href={`mailto:${club.contactEmail}`}
                      className="px-3.5 py-1.5 bg-court-800 hover:bg-gold hover:text-court-950 text-[#F5F0E6] font-bold rounded-xl text-xs transition-colors border border-court-700"
                    >
                      Contact Club
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Clubs;
