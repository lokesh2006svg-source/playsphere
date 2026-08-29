import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchVenues, createVenue } from "../api";
import { useAuth } from "../context/AuthContext";
import SportSelector from "../components/SportSelector";
import {
  Calendar,
  MapPin,
  Star,
  Clock,
  CheckCircle2,
  DollarSign,
  Search,
  SlidersHorizontal,
  ExternalLink,
  Plus,
  Building2,
  X,
  Phone,
  Sparkles,
} from "lucide-react";

const VENUE_TYPES = [
  { value: "All", label: "All Grounds & Turfs" },
  { value: "private_turf", label: "Private Turf" },
  { value: "public_stadium", label: "Public Stadium" },
  { value: "school_ground", label: "School Ground" },
  { value: "college_ground", label: "College Ground" },
  { value: "community_ground", label: "Community Ground" },
];

const Venues = () => {
  const { user } = useAuth();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [sportType, setSportType] = useState("All");
  const [city, setCity] = useState("All");
  const [venueType, setVenueType] = useState("All");
  const [search, setSearch] = useState("");

  // Create Ground Modal State (Ground Owners)
  const [modalOpen, setModalOpen] = useState(false);
  const [createData, setCreateData] = useState({
    name: "",
    sportType: "Cricket",
    city: user?.city || "Chennai",
    address: "",
    venueType: "private_turf",
    pricePerHour: 800,
    openingTime: "06:00",
    closingTime: "22:00",
    contactPhone: "",
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");

  const isGroundOwner =
    user?.role === "ground_owner" ||
    user?.role === "venue_admin" ||
    user?.role === "admin" ||
    user?.role === "super_admin";

  const loadVenues = async () => {
    try {
      setLoading(true);
      const res = await fetchVenues({
        sportType,
        city,
        venueType,
        search,
      });
      if (res.data.success) {
        setVenues(res.data.venues || []);
      }
    } catch (err) {
      console.error("Error loading venues:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVenues();
  }, [sportType, city, venueType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadVenues();
  };

  const handleCreateVenue = async (e) => {
    e.preventDefault();
    if (!createData.name.trim() || !createData.address.trim()) {
      setCreateError("Venue name and street address are required.");
      return;
    }

    try {
      setCreateLoading(true);
      setCreateError("");
      const res = await createVenue(createData);
      if (res.data.success) {
        setModalOpen(false);
        setCreateData({
          name: "",
          sportType: "Cricket",
          city: user?.city || "Chennai",
          address: "",
          venueType: "private_turf",
          pricePerHour: 800,
          openingTime: "06:00",
          closingTime: "22:00",
          contactPhone: "",
        });
        loadVenues();
      }
    } catch (err) {
      setCreateError(err.response?.data?.message || "Failed to create venue.");
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in text-[#F5F0E6]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-gold" />
            <h1 className="text-2xl sm:text-3xl font-black text-[#F5F0E6]">Court & Turf Bookings</h1>
          </div>
          <p className="text-xs text-[#9B9691] mt-1">
            Reserve verified synthetic turfs, badminton arenas, and stadiums across Tamil Nadu
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/bookings"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-court-850 hover:bg-court-800 border border-court-700 hover:border-gold/40 text-[#F5F0E6] font-bold rounded-xl text-xs transition-colors self-start sm:self-auto"
          >
            <span>My Reservations</span>
          </Link>

          {isGroundOwner && (
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 hover:from-emerald-600 hover:to-teal-500 text-court-950 font-black rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>List New Ground</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-court-900 border border-court-700 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 shadow-gold/5">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-[#9B9691] uppercase mb-1">
              Search Grounds
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-gold absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, address..."
                className="w-full bg-court-950 border border-court-700 text-[#F5F0E6] rounded-xl pl-10 pr-4 py-2.5 text-xs focus:ring-2 focus:ring-gold focus:border-gold focus:outline-none placeholder:text-[#656C7D]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#9B9691] uppercase mb-1">
              Sport Type
            </label>
            <SportSelector
              value={sportType}
              onChange={(e) => setSportType(e.target.value)}
              includeAll={true}
              allLabel="All Sports"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#9B9691] uppercase mb-1">
              City / Region
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-court-950 border border-court-700 text-[#F5F0E6] rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-gold focus:border-gold focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-court-900">All Cities</option>
              <option value="Chennai" className="bg-court-900">Chennai</option>
              <option value="Coimbatore" className="bg-court-900">Coimbatore</option>
              <option value="Madurai" className="bg-court-900">Madurai</option>
              <option value="Trichy" className="bg-court-900">Trichy</option>
              <option value="Salem" className="bg-court-900">Salem</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#9B9691] uppercase mb-1">
              Venue Category
            </label>
            <select
              value={venueType}
              onChange={(e) => setVenueType(e.target.value)}
              className="w-full bg-court-950 border border-court-700 text-[#F5F0E6] rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-gold focus:border-gold focus:outline-none cursor-pointer"
            >
              {VENUE_TYPES.map((v) => (
                <option key={v.value} value={v.value} className="bg-court-900">
                  {v.label}
                </option>
              ))}
            </select>
          </div>
        </form>
      </div>

      {/* Venues Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-[#F5F0E6]">Available Venues ({venues.length})</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-80 bg-court-900 border border-court-700 rounded-3xl animate-pulse"
              ></div>
            ))}
          </div>
        ) : venues.length === 0 ? (
          <div className="bg-court-900 border border-court-700 rounded-3xl p-12 text-center max-w-md mx-auto shadow-xl">
            <Calendar className="w-12 h-12 text-gold mx-auto mb-3" />
            <h3 className="text-lg font-bold text-[#F5F0E6] mb-1">No Venues Found</h3>
            <p className="text-xs text-[#9B9691]">
              Try adjusting your sport or city filters to view available grounds.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {venues.map((venue) => (
              <div
                key={venue._id}
                className="bg-court-900 border border-court-700 hover:border-gold/50 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-gold/10 transition-all duration-200 flex flex-col justify-between hover:-translate-y-1 group"
              >
                {/* Photo Gallery Thumbnail */}
                <div className="relative h-48 bg-court-800 overflow-hidden">
                  <img
                    src={
                      venue.photos?.[0] ||
                      "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=800&q=80"
                    }
                    alt={venue.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 px-2.5 py-1 bg-court-950/90 backdrop-blur-md border border-gold/40 rounded-full text-[10px] font-black text-gold shadow-md">
                    ₹{venue.pricePerHour}/hr
                  </div>
                  <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-court-950/90 backdrop-blur-md border border-court-700 rounded-full text-[10px] font-bold text-[#F5F0E6] flex items-center gap-1">
                    <span className="capitalize">{venue.venueType.replace("_", " ")}</span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <h3 className="font-bold text-[#F5F0E6] text-base group-hover:text-gold transition-colors line-clamp-1">
                        {venue.name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-amber-400 shrink-0">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span className="font-bold">{venue.rating || 4.8}</span>
                      </div>
                    </div>

                    <p className="text-xs text-[#9B9691] flex items-start gap-1 mb-3 line-clamp-1">
                      <MapPin className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
                      <span>{venue.address}</span>
                    </p>

                    <div className="flex items-center gap-3 text-xs text-[#9B9691] mb-4">
                      <span className="flex items-center gap-1 font-semibold text-gold">
                        ⚡ {venue.sportType}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-[#9B9691]">
                        <Clock className="w-3.5 h-3.5" />
                        {venue.openingTime} - {venue.closingTime}
                      </span>
                    </div>

                    {/* Amenities tags */}
                    {venue.amenities && venue.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {venue.amenities.slice(0, 3).map((amenity, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-court-950 border border-court-700 rounded text-[10px] text-[#F5F0E6]"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-court-700 flex items-center justify-between">
                    <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Instant Confirmation
                    </span>
                    <Link
                      to={`/venues/${venue._id}`}
                      className="px-4 py-2 bg-gradient-to-r from-gold via-amber-400 to-gold-hover hover:from-gold-hover hover:to-amber-500 text-court-950 font-black rounded-xl text-xs transition-all shadow-md shadow-gold/20"
                    >
                      Book Slot
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ground Owner: Create Venue Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-court-900 border border-court-700 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-[#9B9691] hover:text-[#F5F0E6] p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#F5F0E6]">List Your Sports Ground / Turf</h3>
                <p className="text-xs text-[#9B9691]">Set your court details, hourly rate, and opening hours</p>
              </div>
            </div>

            {createError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateVenue} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#9B9691] uppercase mb-1">
                  Ground / Arena Name
                </label>
                <input
                  type="text"
                  required
                  value={createData.name}
                  onChange={(e) => setCreateData({ ...createData, name: e.target.value })}
                  placeholder="e.g. Marina Arena Futsal Turf"
                  className="w-full bg-court-950 border border-court-700 text-[#F5F0E6] rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#9B9691] uppercase mb-1">
                    Sport
                  </label>
                  <select
                    value={createData.sportType}
                    onChange={(e) => setCreateData({ ...createData, sportType: e.target.value })}
                    className="w-full bg-court-950 border border-court-700 text-[#F5F0E6] rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none cursor-pointer"
                  >
                    <option value="Cricket" className="bg-court-900">Cricket</option>
                    <option value="Football" className="bg-court-900">Football</option>
                    <option value="Badminton" className="bg-court-900">Badminton</option>
                    <option value="Basketball" className="bg-court-900">Basketball</option>
                    <option value="Tennis" className="bg-court-900">Tennis</option>
                    <option value="Volleyball" className="bg-court-900">Volleyball</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#9B9691] uppercase mb-1">
                    City
                  </label>
                  <select
                    value={createData.city}
                    onChange={(e) => setCreateData({ ...createData, city: e.target.value })}
                    className="w-full bg-court-950 border border-court-700 text-[#F5F0E6] rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none cursor-pointer"
                  >
                    <option value="Chennai" className="bg-court-900">Chennai</option>
                    <option value="Coimbatore" className="bg-court-900">Coimbatore</option>
                    <option value="Madurai" className="bg-court-900">Madurai</option>
                    <option value="Trichy" className="bg-court-900">Trichy</option>
                    <option value="Salem" className="bg-court-900">Salem</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9B9691] uppercase mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  required
                  value={createData.address}
                  onChange={(e) => setCreateData({ ...createData, address: e.target.value })}
                  placeholder="e.g. 14, Beach Road, Santhome, Chennai"
                  className="w-full bg-court-950 border border-court-700 text-[#F5F0E6] rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#9B9691] uppercase mb-1">
                    Price/Hour (₹)
                  </label>
                  <input
                    type="number"
                    min="100"
                    step="50"
                    required
                    value={createData.pricePerHour}
                    onChange={(e) => setCreateData({ ...createData, pricePerHour: e.target.value })}
                    className="w-full bg-court-950 border border-court-700 text-[#F5F0E6] rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#9B9691] uppercase mb-1">
                    Opens At
                  </label>
                  <input
                    type="time"
                    value={createData.openingTime}
                    onChange={(e) => setCreateData({ ...createData, openingTime: e.target.value })}
                    className="w-full bg-court-950 border border-court-700 text-[#F5F0E6] rounded-xl px-2 py-2.5 text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#9B9691] uppercase mb-1">
                    Closes At
                  </label>
                  <input
                    type="time"
                    value={createData.closingTime}
                    onChange={(e) => setCreateData({ ...createData, closingTime: e.target.value })}
                    className="w-full bg-court-950 border border-court-700 text-[#F5F0E6] rounded-xl px-2 py-2.5 text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9B9691] uppercase mb-1">
                  Contact Phone for Inquiries
                </label>
                <input
                  type="text"
                  value={createData.contactPhone}
                  onChange={(e) => setCreateData({ ...createData, contactPhone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full bg-court-950 border border-court-700 text-[#F5F0E6] rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 bg-court-800 hover:bg-court-750 text-[#F5F0E6] rounded-xl text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-court-950 font-black rounded-xl text-xs transition-all disabled:opacity-50"
                >
                  {createLoading ? "Listing Ground..." : "List Ground Now"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Venues;
