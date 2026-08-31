import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchVenueById, fetchVenueAvailability, bookVenue } from "../api";
import { useAuth } from "../context/AuthContext";
import PaymentQR from "../components/PaymentQR";
import {
  MapPin,
  Clock,
  Star,
  ShieldCheck,
  Calendar,
  Check,
  ArrowLeft,
  ExternalLink,
  Phone,
  Sparkles,
  Info,
  QrCode,
  CheckCircle2,
  ChevronRight,
  Share2,
  Send,
  Copy,
} from "lucide-react";
import confetti from "canvas-confetti";

const VenueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [pendingBooking, setPendingBooking] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [error, setError] = useState("");
  const [shareCopied, setShareCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2500);
  };

  const getWhatsAppVenueUrl = () => {
    const text = `🏟️ Book turf slots at ${venue?.name || "this venue"} on PlaySphere! Real-time slot availability & pricing:`;
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(`${text}\n\n🔗 ${window.location.href}`)}`;
  };

  // Load Venue Details
  useEffect(() => {
    const loadVenue = async () => {
      try {
        setLoading(true);
        const res = await fetchVenueById(id);
        if (res.data.success) {
          setVenue(res.data.venue);
        }
      } catch (err) {
        setError("Failed to load venue details.");
      } finally {
        setLoading(false);
      }
    };
    loadVenue();
  }, [id]);

  // Load Available Slots for selected date
  const loadSlots = async () => {
    if (!id || !selectedDate) return;
    try {
      setLoadingSlots(true);
      const res = await fetchVenueAvailability(id, selectedDate);
      if (res.data.success) {
        setSlots(res.data.slots || []);
        setSelectedSlot(null);
      }
    } catch (err) {
      console.warn("Error fetching slots:", err);
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    loadSlots();
  }, [id, selectedDate]);

  const handleBooking = async () => {
    if (!user) {
      navigate("/login", { state: { from: { pathname: `/venues/${id}` } } });
      return;
    }

    if (!selectedSlot) {
      setError("Please select an available time slot.");
      return;
    }

    try {
      setBookingLoading(true);
      setError("");

      const res = await bookVenue({
        venueId: id,
        bookingDate: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        paymentMethod: "upi_qr",
      });

      if (res.data.success) {
        setPendingBooking(res.data.booking);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create booking. Slot may have been taken.");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs text-[#9B9691]">
        <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <span>Loading sports facility details...</span>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-court-900 border border-court-700 rounded-3xl text-center shadow-xl text-[#F5F0E6]">
        <h2 className="text-xl font-bold mb-2">Venue Not Found</h2>
        <p className="text-xs text-[#9B9691] mb-6">
          The turf or court you requested is not available.
        </p>
        <Link
          to="/venues"
          className="px-6 py-2.5 bg-gradient-to-r from-gold to-amber-500 text-court-950 font-black rounded-xl text-xs inline-block shadow-md shadow-gold/20"
        >
          Browse All Venues
        </Link>
      </div>
    );
  }

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${venue.name}, ${venue.address}, ${venue.city}`
  )}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in text-[#F5F0E6]">
      {/* Top Header & Share Actions */}
      <div className="flex items-center justify-between">
        <Link
          to="/venues"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9B9691] hover:text-[#F5F0E6] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-gold" />
          <span>Back to Venues</span>
        </Link>

        <div className="flex items-center gap-2">
          <a
            href={getWhatsAppVenueUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share Turf on</span> WhatsApp
          </a>

          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3 py-1.5 bg-court-850 hover:bg-court-800 border border-court-700 text-[#F5F0E6] text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            {shareCopied ? <CheckCircle2 className="w-3.5 h-3.5 text-gold" /> : <Share2 className="w-3.5 h-3.5 text-gold" />}
            <span>{shareCopied ? "Link Copied!" : "Share Turf"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Details, Gallery, Amenities, Location */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Card */}
          <div className="bg-court-900 border border-court-700 rounded-3xl overflow-hidden shadow-xl shadow-gold/5">
            <div className="relative h-72 sm:h-96 bg-court-800">
              <img
                src={
                  venue.photos?.[0] ||
                  "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=1200&q=80"
                }
                alt={venue.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 px-3.5 py-1.5 bg-court-950/90 backdrop-blur-md border border-gold/40 rounded-full text-sm font-black text-gold shadow-lg">
                ₹{venue.pricePerHour} / hour
              </div>
              <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 rounded text-[9px] text-[#9B9691]">
                Photos via Google Maps / Partner Venue
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="px-3 py-1 bg-gold/15 text-gold border border-gold/30 rounded-full text-xs font-bold capitalize">
                    {venue.sportType} • {venue.venueType.replace("_", " ")}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-[#F5F0E6] mt-2">
                    {venue.name}
                  </h1>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-court-950 border border-court-700 rounded-2xl text-amber-400 text-xs font-bold">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{venue.rating || 4.8}</span>
                  <span className="text-[#9B9691] font-normal">({venue.reviewCount || 24} reviews)</span>
                </div>
              </div>

              <p className="text-xs text-[#9B9691] flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                <span>
                  {venue.address}, {venue.city}, Tamil Nadu
                </span>
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-[#9B9691] pt-2 border-t border-court-700">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-gold" />
                  Hours: {venue.openingTime} - {venue.closingTime}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-gold" />
                  {venue.contactPhone}
                </span>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-court-900 border border-court-700 rounded-3xl p-6 shadow-xl shadow-gold/5">
            <h3 className="text-sm font-bold text-[#F5F0E6] uppercase tracking-wider mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold" />
              Facility Amenities
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(venue.amenities || ["LED Floodlights", "Dressing Rooms", "Parking", "Drinking Water"]).map(
                (amenity, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-court-950 border border-court-700 rounded-2xl flex items-center gap-2 text-xs font-semibold text-[#F5F0E6]"
                  >
                    <Check className="w-4 h-4 text-gold shrink-0" />
                    <span>{amenity}</span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Map Location Link */}
          <div className="bg-court-900 border border-court-700 rounded-3xl p-6 shadow-xl flex items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-[#F5F0E6]">Location on Google Maps</h4>
              <p className="text-xs text-[#9B9691] mt-0.5">
                Exact coordinates: {venue.location?.coordinates?.[1]}, {venue.location?.coordinates?.[0]}
              </p>
            </div>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-court-800 hover:bg-court-750 border border-court-700 hover:border-gold/40 text-[#F5F0E6] text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shrink-0"
            >
              <span>View on Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5 text-gold" />
            </a>
          </div>
        </div>

        {/* Right Col: Slot Booking Picker & Checkout Card */}
        <div className="space-y-6">
          <div className="bg-court-900 border border-court-700 rounded-3xl p-6 shadow-2xl sticky top-20 shadow-gold/10">
            <h3 className="text-lg font-extrabold text-[#F5F0E6] mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gold" />
              Select Date & Time Slot
            </h3>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold">
                {error}
              </div>
            )}

            {/* Date Input */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-[#9B9691] uppercase mb-1.5">
                Booking Date
              </label>
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-court-950 border border-court-700 text-[#F5F0E6] rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-gold focus:border-gold focus:outline-none cursor-pointer"
              />
            </div>

            {/* Slot Grid */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-[#9B9691] uppercase">
                  Available Slots
                </label>
                <span className="text-[10px] text-[#656C7D]">1-Hour Matches</span>
              </div>

              {loadingSlots ? (
                <div className="py-8 text-center text-xs text-[#9B9691]">Checking court availability...</div>
              ) : slots.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#9B9691]">
                  No slots scheduled for this date.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                  {slots.map((slot) => (
                    <button
                      key={slot.startTime}
                      type="button"
                      disabled={!slot.isAvailable}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center transition-all ${
                        !slot.isAvailable
                          ? "bg-court-950/40 border-court-700 text-[#656C7D] cursor-not-allowed line-through"
                          : selectedSlot?.startTime === slot.startTime
                          ? "bg-gold text-court-950 border-gold shadow-md shadow-gold/20 font-black"
                          : "bg-court-950 border-court-700 text-[#F5F0E6] hover:border-gold/50"
                      }`}
                    >
                      <span>
                        {slot.startTime} - {slot.endTime}
                      </span>
                      <span className="text-[10px] opacity-80">
                        {slot.isAvailable ? `₹${slot.price}` : "Booked"}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Price Summary */}
            <div className="p-4 bg-court-950 border border-court-700 rounded-2xl mb-5 space-y-1.5 text-xs">
              <div className="flex justify-between text-[#9B9691]">
                <span>Selected Slot:</span>
                <span className="font-semibold text-[#F5F0E6]">
                  {selectedSlot ? `${selectedSlot.startTime} - ${selectedSlot.endTime}` : "None"}
                </span>
              </div>
              <div className="flex justify-between text-[#9B9691]">
                <span>Duration:</span>
                <span className="font-semibold text-[#F5F0E6]">1 Hour</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#F5F0E6] pt-2 border-t border-court-700">
                <span>Total Amount:</span>
                <span className="text-gold text-base font-black">₹{venue.pricePerHour}</span>
              </div>
            </div>

            {/* Proceed to Pay CTA */}
            <button
              onClick={handleBooking}
              disabled={!selectedSlot || bookingLoading}
              className="w-full py-3.5 bg-gradient-to-r from-gold via-amber-400 to-gold-hover hover:from-gold-hover hover:to-amber-500 text-court-950 font-black rounded-xl shadow-xl shadow-gold/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <QrCode className="w-5 h-5" />
              <span>{bookingLoading ? "Generating Payment..." : `Proceed to Pay (₹${venue.pricePerHour})`}</span>
            </button>

            <div className="mt-4 pt-3 border-t border-court-700 flex items-center justify-center gap-2 text-[10px] text-[#9B9691]">
              <ShieldCheck className="w-3.5 h-3.5 text-gold" />
              <span>Instant QR Payment • Free cancellation up to 4 hrs before</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment QR & Screenshot Upload Modal */}
      {pendingBooking && (
        <PaymentQR
          booking={pendingBooking}
          venue={venue}
          onSuccess={(confirmed) => {
            setPendingBooking(confirmed);
            loadSlots();
          }}
          onCancel={() => {
            setPendingBooking(null);
            loadSlots();
          }}
        />
      )}
    </div>
  );
};

export default VenueDetail;
