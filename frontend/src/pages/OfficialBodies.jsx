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
  Search,
  Award,
  BookOpen,
  FileText,
  DollarSign,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  HelpCircle,
  Landmark,
  Layers,
} from "lucide-react";
import SportSelector from "../components/SportSelector";

const GOVT_SCHEMES = [
  {
    title: "Chief Minister's Trophy (CM Trophy)",
    authority: "Sports Development Authority of Tamil Nadu (SDAT)",
    category: "State-Wide Open Tournament",
    cashReward: "Up to ₹1,00,000 / athlete",
    badge: "ANNUAL STATE EVENT",
    description:
      "A flagship multi-tier sports competition organized annually across all 38 districts of Tamil Nadu for School, College, Public, and Differently-Abled athletes across 15+ sporting disciplines.",
    eligibility: "Tamil Nadu residents enrolled in schools, colleges, or open public division.",
    benefits: [
      "District level cash awards: 1st ₹12,000 | 2nd ₹8,000 | 3rd ₹4,000",
      "State level cash awards: 1st ₹1,00,000 | 2nd ₹75,000 | 3rd ₹50,000",
      "Official government participation & winner certificates valid for 3% Sports Quota",
    ],
    portalUrl: "https://sdat.tn.gov.in",
  },
  {
    title: "Champions Development Scheme (CDS)",
    authority: "Youth Welfare and Sports Development Department, Govt of Tamil Nadu",
    category: "Elite Athlete High-Performance Grant",
    cashReward: "Up to ₹25,00,000 / year",
    badge: "ELITE FINANCIAL AID",
    description:
      "Comprehensive financial assistance provided to medal-winning athletes with national and international podium potential for advanced sports coaching, foreign training, nutrition, and equipment.",
    eligibility: "Medalists in National Championships, National Games, or Asian/World events.",
    benefits: [
      "Financial assistance up to ₹25 Lakhs per year per athlete",
      "International training exposure with world-class coaches",
      "Full sports science support, physiotherapy, and biometric analysis",
    ],
    portalUrl: "https://sdat.tn.gov.in",
  },
  {
    title: "3% Sports Quota in Government Jobs & Higher Education",
    authority: "Government of Tamil Nadu (TNPSC / DOTE / TNEA)",
    category: "Reservation & Recruitment Policy",
    cashReward: "Direct Job Placement & Seat Reservation",
    badge: "GOVERNMENT RESERVATION",
    description:
      "Statutory 3% reservation for meritorious sports persons in Tamil Nadu Public Service Commission (TNPSC) recruitments, Tamil Nadu Police, TNEB, and undergraduate/postgraduate college admissions.",
    eligibility: "Holders of valid Form-I (International), Form-II (National), or Form-III (Inter-University) certificates.",
    benefits: [
      "3% horizontal reservation in Group-B, C, and D government vacancies",
      "Preferred sports quota counseling for Engineering (TNEA) and Medical colleges",
      "Exemption from certain standardized testing requirements based on sports merit",
    ],
    portalUrl: "https://tnpsc.gov.in",
  },
  {
    title: "Special Sports Scholarship for School & College Students",
    authority: "SDAT & School Education Department",
    category: "Monthly Academic & Sports Stipend",
    cashReward: "₹12,000 to ₹36,000 / annum",
    badge: "STUDENT SCHOLARSHIP",
    description:
      "Annual scholarship program rewarding outstanding school students (Class 6 to 12) and college undergrads who have won Gold, Silver, or Bronze medals in recognized State/National championships.",
    eligibility: "Students under 25 years studying in recognized Tamil Nadu educational institutions.",
    benefits: [
      "School students: ₹1,000/month (₹12,000/yr)",
      "College & University students: ₹1,500 to ₹3,000/month",
      "Dietary supplements and standard sports kit allowance",
    ],
    portalUrl: "https://sdat.tn.gov.in",
  },
  {
    title: "Mission International Medal Scheme (MIMS)",
    authority: "SDAT High-Performance Sports Center",
    category: "Olympic & Asian Games Pathway",
    cashReward: "100% Funded Training Programs",
    badge: "OLYMPIC PATHWAY",
    description:
      "Targeted athlete preparation scheme for Olympic, Commonwealth, and Asian Games hopefuls, providing sports biomechanics, mental conditioning, and global competitive tours.",
    eligibility: "Selected based on national trials and international world ranking thresholds.",
    benefits: [
      "Custom training camps at National Centers of Excellence (NCOE)",
      "Dedicated sports psychologists and Olympic certified strength coaches",
      "Complete medical insurance coverage and performance tracking",
    ],
    portalUrl: "https://sdat.tn.gov.in",
  },
];

const DISTRICT_OFFICES = [
  {
    district: "Chennai",
    stadium: "Jawaharlal Nehru Stadium & SDAT Aquatic Complex",
    address: "Raja Muthiah Rd, Periamet, Chennai - 600003",
    officer: "District Sports and Youth Welfare Officer, Chennai",
    phone: "+91 44 2538 4353",
    email: "dsochennai@tn.gov.in",
    facilities: "Synthetic Track, Football Turf, Olympic Pool, Badminton Indoor Hall",
  },
  {
    district: "Coimbatore",
    stadium: "Nehru Stadium & Multi-Purpose Indoor Arena",
    address: "V O C Park Grounds, Coimbatore - 641018",
    officer: "District Sports and Youth Welfare Officer, Coimbatore",
    phone: "+91 422 238 0010",
    email: "dsocbe@tn.gov.in",
    facilities: "400m Synthetic Track, Basketball Wooden Courts, Boxing Ring",
  },
  {
    district: "Madurai",
    stadium: "Dr. M.G.R. Race Course Stadium & Sports Complex",
    address: "Race Course Road, K.K. Nagar, Madurai - 625002",
    officer: "District Sports and Youth Welfare Officer, Madurai",
    phone: "+91 452 253 1080",
    email: "dsomadurai@tn.gov.in",
    facilities: "Synthetic Athletic Track, Hockey AstroTurf, Silambam Arena",
  },
  {
    district: "Tiruchirappalli (Trichy)",
    stadium: "Anna Stadium Sports Complex",
    address: "Race Course Road, Khajamalai, Trichy - 620020",
    officer: "District Sports and Youth Welfare Officer, Trichy",
    phone: "+91 431 242 0685",
    email: "dsotrichy@tn.gov.in",
    facilities: "Multi-Discipline Sports Ground, Tennis Clay Courts, Swimming Pool",
  },
  {
    district: "Salem",
    stadium: "Mahatma Gandhi Stadium",
    address: "Cherry Road, Hasthampatti, Salem - 636007",
    officer: "District Sports and Youth Welfare Officer, Salem",
    phone: "+91 427 241 5262",
    email: "dsosalem@tn.gov.in",
    facilities: "Grass Football Arena, Volleyball Floodlight Courts, Gym Center",
  },
  {
    district: "Tirunelveli",
    stadium: "V.O. Chidambaranar Stadium",
    address: "Palayamkottai, Tirunelveli - 627002",
    officer: "District Sports and Youth Welfare Officer, Tirunelveli",
    phone: "+91 462 257 2345",
    email: "dsotirunelveli@tn.gov.in",
    facilities: "Synthetic Athletic Track, Weightlifting Hall, Basketball Courts",
  },
  {
    district: "Erode",
    stadium: "VOC Park Stadium",
    address: "Park Road, Erode - 638001",
    officer: "District Sports and Youth Welfare Officer, Erode",
    phone: "+91 424 225 8011",
    email: "dsoerode@tn.gov.in",
    facilities: "Badminton Indoor Stadium, Cricket Practice Turf Nets",
  },
  {
    district: "Thanjavur",
    stadium: "Annai Sathya Stadium",
    address: "Medical College Road, Thanjavur - 613004",
    officer: "District Sports and Youth Welfare Officer, Thanjavur",
    phone: "+91 4362 278 120",
    email: "dsothanjavur@tn.gov.in",
    facilities: "Athletics Track, Kabaddi Mat Arenas, Table Tennis Hall",
  },
];

const FORM_GUIDELINES = [
  {
    form: "Form - I",
    title: "International Competition Representation",
    authority: "National Sports Federation & Ministry of Youth Affairs & Sports (MYAS)",
    purpose: "Priority 1 for 3% Government Job Quota (Group-A/B/C) & University Seats",
    description: "Awarded to athletes representing India in Olympic Games, World Championships, Asian Games, Commonwealth Games, or recognized International Championships.",
  },
  {
    form: "Form - II",
    title: "National Championship Representation",
    authority: "Recognized State Sports Association / Sports Development Authority of Tamil Nadu",
    purpose: "Priority 2 for Government Jobs & Engineering/Medical Admissions",
    description: "Awarded to athletes representing Tamil Nadu state in National Games, Senior/Junior National Championships organized by AFI, BAI, AIFF, BFI, etc.",
  },
  {
    form: "Form - III",
    title: "Inter-University Tournament Representation",
    authority: "Association of Indian Universities (AIU) & University Sports Board",
    purpose: "Priority 3 for College Admissions & Public Sector Undertakings (PSU) Quota",
    description: "Awarded to students representing their University in All India Inter-University or South Zone Inter-University Tournaments.",
  },
  {
    form: "Form - IV",
    title: "National School Games Representation",
    authority: "School Games Federation of India (SGFI) & Directorate of School Education",
    purpose: "Priority 4 for Higher Secondary & Undergraduate Sports Quota",
    description: "Awarded to school students representing Tamil Nadu in National School Games competitions across recognized disciplines.",
  },
];

const OfficialBodies = () => {
  const [activeTab, setActiveTab] = useState("bodies");
  const [bodies, setBodies] = useState([]);
  const [hierarchy, setHierarchy] = useState([]);
  const [selectedSport, setSelectedSport] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [districtSearch, setDistrictSearch] = useState("");
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

  const filteredHierarchy = hierarchy.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.sport.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.shortName && b.shortName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const filteredDistrictOffices = DISTRICT_OFFICES.filter((d) =>
    d.district.toLowerCase().includes(districtSearch.toLowerCase()) ||
    d.stadium.toLowerCase().includes(districtSearch.toLowerCase()) ||
    d.facilities.toLowerCase().includes(districtSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in text-[#F5F0E6]">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-court-950 via-court-900 to-court-950 border border-gold/40 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden shadow-gold/10">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-gold/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/15 border border-gold/40 text-gold-glow rounded-full text-xs font-bold">
              <Landmark className="w-3.5 h-3.5 text-gold" />
              <span>Official Tamil Nadu Sports Directory & Government Portal</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-[#F5F0E6] tracking-tight">
              Government Schemes, Sports Bodies & Quota Portal
            </h1>

            <p className="text-sm text-[#9B9691] leading-relaxed">
              Official centralized registry for Sports Development Authority of Tamil Nadu (SDAT), recognized State/District Associations, CM Trophy competitions, 3% Sports Quota job rules, and DSO stadium facilities across 38 districts.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <a
              href="https://sdat.tn.gov.in"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-gold via-amber-400 to-gold-hover hover:from-gold-hover hover:to-amber-500 text-court-950 font-black rounded-xl text-xs shadow-lg shadow-gold/20 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <span>SDAT Official Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <a
              href="https://sportsauthorityofindia.nic.in"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-5 py-2.5 bg-court-800 hover:bg-court-750 border border-court-700 hover:border-gold/40 text-[#F5F0E6] font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <span>SAI Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-court-700 pb-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab("bodies")}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
            activeTab === "bodies"
              ? "bg-gold text-court-950 shadow-md shadow-gold/20 font-black"
              : "bg-court-900 text-[#9B9691] hover:bg-court-800 hover:text-white border border-court-700"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>🏛️ Governing Bodies & Associations</span>
        </button>

        <button
          onClick={() => setActiveTab("schemes")}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
            activeTab === "schemes"
              ? "bg-gold text-court-950 shadow-md shadow-gold/20 font-black"
              : "bg-court-900 text-[#9B9691] hover:bg-court-800 hover:text-white border border-court-700"
          }`}
        >
          <Award className="w-4 h-4" />
          <span>🇮🇳 Government Schemes & CM Trophy</span>
        </button>

        <button
          onClick={() => setActiveTab("dso")}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
            activeTab === "dso"
              ? "bg-gold text-court-950 shadow-md shadow-gold/20 font-black"
              : "bg-court-900 text-[#9B9691] hover:bg-court-800 hover:text-white border border-court-700"
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>📍 District Sports Offices (DSO)</span>
        </button>

        <button
          onClick={() => setActiveTab("forms")}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
            activeTab === "forms"
              ? "bg-gold text-court-950 shadow-md shadow-gold/20 font-black"
              : "bg-court-900 text-[#9B9691] hover:bg-court-800 hover:text-white border border-court-700"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>📜 Sports Quota Forms (I, II, III, IV)</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: GOVERNING BODIES & ASSOCIATIONS                                    */}
      {/* ========================================================================= */}
      {activeTab === "bodies" && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-court-900 border border-court-700 rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9B9691]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search state association or sport..."
                className="w-full bg-court-950 border border-court-750 rounded-xl pl-10 pr-4 py-2 text-xs text-[#F5F0E6] focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-[#9B9691] shrink-0 font-medium">Filter Sport:</span>
              <select
                value={selectedSport}
                onChange={(e) => setSelectedSport(e.target.value)}
                className="bg-court-950 border border-court-750 text-[#F5F0E6] rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-gold cursor-pointer"
              >
                <option value="All">All Sports</option>
                <option value="Cricket">Cricket</option>
                <option value="Football">Football</option>
                <option value="Badminton">Badminton</option>
                <option value="Kabaddi">Kabaddi</option>
                <option value="Basketball">Basketball</option>
                <option value="Silambam">Silambam</option>
                <option value="Athletics">Athletics</option>
                <option value="Chess">Chess</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-court-900 border border-court-700 rounded-3xl animate-pulse"></div>
              ))}
            </div>
          ) : filteredHierarchy.length === 0 ? (
            <div className="bg-court-900 border border-court-700 rounded-3xl p-12 text-center max-w-md mx-auto shadow-xl">
              <Building2 className="w-12 h-12 text-gold/40 mx-auto mb-2" />
              <h3 className="text-base font-bold text-[#F5F0E6]">No Governing Bodies Found</h3>
              <p className="text-xs text-[#9B9691] mt-1">Try selecting another sport or clearing search filters.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {filteredHierarchy.map((stateBody) => (
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
                            Founded {stateBody.foundedYear || 1950}
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
      )}

      {/* ========================================================================= */}
      {/* TAB 2: GOVERNMENT SCHEMES & CM TROPHY                                     */}
      {/* ========================================================================= */}
      {activeTab === "schemes" && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {GOVT_SCHEMES.map((scheme, idx) => (
              <div
                key={idx}
                className="bg-court-900 border border-court-700 hover:border-gold/50 rounded-3xl p-6 sm:p-7 shadow-xl flex flex-col justify-between space-y-5 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="px-3 py-1 bg-gold/15 border border-gold/40 text-gold text-[10px] font-extrabold rounded-full">
                      {scheme.badge}
                    </span>
                    <span className="text-xs font-black text-amber-400">{scheme.cashReward}</span>
                  </div>

                  <h3 className="text-lg font-black text-[#F5F0E6] leading-snug">{scheme.title}</h3>
                  <p className="text-xs text-gold font-semibold mt-0.5">{scheme.authority}</p>

                  <p className="text-xs text-[#9B9691] mt-3 leading-relaxed">{scheme.description}</p>

                  <div className="mt-4 pt-3 border-t border-court-800 space-y-2">
                    <span className="text-[10px] font-bold text-[#9B9691] uppercase tracking-wider block">
                      Key Scheme Benefits:
                    </span>
                    {scheme.benefits.map((b, bIdx) => (
                      <div key={bIdx} className="text-xs text-[#F5F0E6] flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-court-800 flex items-center justify-between">
                  <span className="text-[11px] text-[#9B9691]">Eligibility: {scheme.eligibility}</span>
                  <a
                    href={scheme.portalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-court-800 hover:bg-court-750 text-gold hover:text-white font-bold text-xs rounded-xl border border-court-700 flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    <span>Apply / Details</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: DISTRICT SPORTS OFFICES (DSO) & STADIUMS                           */}
      {/* ========================================================================= */}
      {activeTab === "dso" && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-court-900 border border-court-700 rounded-3xl p-4 sm:p-6 shadow-xl flex items-center justify-between gap-4">
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9B9691]" />
              <input
                type="text"
                value={districtSearch}
                onChange={(e) => setDistrictSearch(e.target.value)}
                placeholder="Search district office or stadium (e.g. Chennai, Coimbatore, Madurai)..."
                className="w-full bg-court-950 border border-court-750 rounded-xl pl-10 pr-4 py-2 text-xs text-[#F5F0E6] focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <span className="text-xs text-gold font-bold hidden sm:inline">
              38 District Sports Authorities
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredDistrictOffices.map((dso, idx) => (
              <div
                key={idx}
                className="bg-court-900 border border-court-700 hover:border-gold/40 rounded-3xl p-6 shadow-xl space-y-4 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="px-2.5 py-0.5 bg-gold/15 text-gold border border-gold/30 text-[10px] font-bold rounded-md">
                      {dso.district} District
                    </span>
                    <h3 className="text-base font-bold text-white mt-1">{dso.stadium}</h3>
                    <p className="text-xs text-[#9B9691] flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-gold shrink-0" />
                      <span>{dso.address}</span>
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-court-950 rounded-2xl border border-court-800 space-y-1 text-xs">
                  <div className="text-[#9B9691]">
                    Authority: <strong className="text-[#F5F0E6]">{dso.officer}</strong>
                  </div>
                  <div className="flex items-center gap-4 pt-1">
                    <a href={`tel:${dso.phone}`} className="text-gold font-bold flex items-center gap-1 hover:underline">
                      <Phone className="w-3 h-3" />
                      <span>{dso.phone}</span>
                    </a>
                    <a href={`mailto:${dso.email}`} className="text-[#9B9691] hover:text-white flex items-center gap-1 hover:underline">
                      <Mail className="w-3 h-3" />
                      <span>{dso.email}</span>
                    </a>
                  </div>
                </div>

                <div className="text-xs text-[#9B9691]">
                  Infrastructure: <strong className="text-amber-300 font-medium">{dso.facilities}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SPORTS QUOTA CERTIFICATES GUIDE                                    */}
      {/* ========================================================================= */}
      {activeTab === "forms" && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-court-900 border border-court-700 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-gold" />
              <span>Standard Government Sports Certificates (Form I - IV)</span>
            </h2>
            <p className="text-xs text-[#9B9691] leading-relaxed">
              In accordance with Ministry of Youth Affairs and Sports (MYAS) & Government of Tamil Nadu G.O. regulations, athletes must hold verified Form certificates corresponding to their highest level of sports achievement to claim 3% quota reservations in public recruitment and higher education.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {FORM_GUIDELINES.map((form, idx) => (
              <div
                key={idx}
                className="bg-court-900 border border-court-700 rounded-3xl p-6 shadow-xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-gold/20 text-gold border border-gold/40 text-xs font-black rounded-xl">
                    {form.form}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                    Official Format
                  </span>
                </div>

                <h3 className="text-base font-bold text-white">{form.title}</h3>
                <p className="text-xs text-amber-300 font-semibold">{form.purpose}</p>

                <p className="text-xs text-[#9B9691] leading-relaxed">{form.description}</p>

                <div className="pt-3 border-t border-court-800 text-xs text-[#9B9691]">
                  Issuing Authority: <strong className="text-[#F5F0E6]">{form.authority}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficialBodies;
