import React, { useState, useEffect } from "react";
import { fetchOfficialBodies } from "../api";
import {
  Building2,
  ShieldCheck,
  Globe,
  Mail,
  Phone,
  ExternalLink,
  MapPin,
  Sparkles,
  ChevronRight,
} from "lucide-react";

const OfficialBodies = () => {
  const [bodies, setBodies] = useState([]);
  const [hierarchy, setHierarchy] = useState([]);
  const [selectedSport, setSelectedSport] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBodies = async () => {
      try {
        setLoading(true);
        const res = await fetchOfficialBodies({
          sport: selectedSport === "All" ? undefined : selectedSport,
        });
        if (res.data.success) {
          setBodies(res.data.bodies || []);
          setHierarchy(res.data.hierarchy || []);
        }
      } catch (err) {
        console.error("Error loading official bodies:", err);
      } finally {
        setLoading(false);
      }
    };
    loadBodies();
  }, [selectedSport]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in text-[#F5F0E6]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-gold" />
            <h1 className="text-2xl sm:text-3xl font-black text-[#F5F0E6]">Official Sports Bodies Directory</h1>
          </div>
          <p className="text-xs text-[#9B9691] mt-1">
            Verified Tamil Nadu State & District Governing Associations (SDAT / National Federations)
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gold/15 border border-gold/40 text-gold-glow rounded-full text-xs font-bold self-start sm:self-auto shadow-sm">
          <ShieldCheck className="w-4 h-4 text-gold" />
          <span>SDAT & National Federation Affiliated</span>
        </div>
      </div>

      {/* Hierarchy Tree & Cards */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 bg-court-900 border border-court-700 rounded-3xl animate-pulse"
            ></div>
          ))}
        </div>
      ) : hierarchy.length === 0 ? (
        <div className="bg-court-900 border border-court-700 rounded-3xl p-12 text-center max-w-md mx-auto shadow-xl">
          <Building2 className="w-12 h-12 text-gold/40 mx-auto mb-2" />
          <h3 className="text-base font-bold text-[#F5F0E6]">No Bodies Found</h3>
        </div>
      ) : (
        <div className="space-y-8">
          {hierarchy.map((stateBody) => (
            <div
              key={stateBody._id}
              className="bg-court-900 border border-court-700 hover:border-gold/40 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 shadow-gold/5"
            >
              {/* State Level Header Card */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-court-700">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-gold to-amber-400 text-court-950 font-black text-xl flex items-center justify-center shadow-lg shadow-gold/20 shrink-0">
                    {stateBody.shortName || stateBody.name.slice(0, 4)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-gold/15 text-gold border border-gold/30 text-[10px] font-bold rounded-full uppercase">
                        State Governing Body
                      </span>
                      <span className="text-xs text-amber-300 font-semibold">
                        Founded {stateBody.foundedYear}
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-[#F5F0E6] mt-1">
                      {stateBody.name} ({stateBody.shortName})
                    </h2>
                    <p className="text-xs text-[#9B9691] mt-0.5">
                      Sport: <strong className="text-[#F5F0E6]">{stateBody.sport}</strong> • Affiliation:{" "}
                      <strong className="text-gold">{stateBody.affiliation}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {stateBody.website && (
                    <a
                      href={stateBody.website}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 bg-court-800 hover:bg-court-750 border border-court-700 hover:border-gold/40 text-[#F5F0E6] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Globe className="w-3.5 h-3.5 text-gold" />
                      <span>Official Site</span>
                      <ExternalLink className="w-3 h-3 text-[#9B9691]" />
                    </a>
                  )}
                  {stateBody.contactEmail && (
                    <a
                      href={`mailto:${stateBody.contactEmail}`}
                      className="px-3.5 py-2 bg-court-800 hover:bg-court-750 border border-court-700 hover:border-gold/40 text-[#F5F0E6] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5 text-amber-400" />
                      <span>Contact Body</span>
                    </a>
                  )}
                </div>
              </div>

              {stateBody.description && (
                <p className="text-xs text-[#9B9691] leading-relaxed">{stateBody.description}</p>
              )}

              {/* District Associations Under State Body */}
              <div>
                <h3 className="text-xs font-bold text-[#9B9691] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <ChevronRight className="w-4 h-4 text-gold" />
                  <span>Affiliated District Associations</span>
                </h3>

                {stateBody.districts && stateBody.districts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stateBody.districts.map((dist) => (
                      <div
                        key={dist._id}
                        className="p-4 bg-court-950 border border-court-700 rounded-2xl space-y-2 hover:border-gold/40 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 bg-court-900 border border-court-700 text-[#F5F0E6] rounded text-[10px] font-bold">
                            District Level
                          </span>
                          <span className="text-[10px] text-gold font-bold">{dist.city}</span>
                        </div>

                        <h4 className="font-bold text-[#F5F0E6] text-xs leading-snug">{dist.name}</h4>

                        {dist.contactEmail && (
                          <a
                            href={`mailto:${dist.contactEmail}`}
                            className="text-[11px] text-[#9B9691] hover:text-gold flex items-center gap-1 mt-1 truncate"
                          >
                            <Mail className="w-3 h-3 text-[#656C7D]" />
                            <span className="truncate">{dist.contactEmail}</span>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#656C7D] italic bg-court-950 p-3 rounded-xl border border-court-700">
                    District chapters across Tamil Nadu are currently undergoing verification updates.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OfficialBodies;
