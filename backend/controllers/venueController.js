import Venue from "../models/Venue.js";
import Booking from "../models/Booking.js";
import { recordAuditLog } from "../utils/auditLogger.js";

/**
 * Sanitizes venue object, stripping owner personal contact info for regular players.
 * Only the assigned venue_admin or platform super_admin can see ownerContact details.
 */
const sanitizeVenueForCaller = (venueDoc, user) => {
  if (!venueDoc) return null;
  const v = venueDoc.toObject ? venueDoc.toObject() : { ...venueDoc };
  const isAdmin = user && (user.role === "venue_admin" || user.role === "super_admin" || user.role === "admin");
  const isAssignedOwner = user && v.ownerId && user._id && user._id.toString() === v.ownerId.toString();

  if (!isAdmin && !isAssignedOwner) {
    delete v.ownerContact;
  }
  return v;
};

// @desc    Get all active venues with filtering (sanitized for regular users)
// @route   GET /api/venues
// @access  Public (Optional Auth for Admin Views)
export const getVenues = async (req, res) => {
  try {
    const { sportType, city, venueType, maxPrice, search } = req.query;

    const query = { isActive: true };

    if (sportType && sportType !== "All" && sportType !== "All Sports") {
      query.sportType = new RegExp(sportType, "i");
    }
    if (city && city !== "All") {
      query.city = new RegExp(city, "i");
    }
    if (venueType && venueType !== "All") {
      query.venueType = venueType;
    }
    if (maxPrice) {
      query.pricePerHour = { $lte: Number(maxPrice) };
    }
    if (search) {
      query.$or = [
        { name: new RegExp(search, "i") },
        { address: new RegExp(search, "i") },
        { sportType: new RegExp(search, "i") },
      ];
    }

    const venues = await Venue.find(query).sort({ rating: -1, createdAt: -1 });

    const sanitizedVenues = venues.map((v) => sanitizeVenueForCaller(v, req.user));

    res.json({
      success: true,
      count: sanitizedVenues.length,
      venues: sanitizedVenues,
    });
  } catch (error) {
    console.error("Get venues error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch venues." });
  }
};

// @desc    Search venues by city
// @route   GET /api/venues/search
// @access  Public
export const searchVenuesByCity = async (req, res) => {
  try {
    const { city } = req.query;
    if (!city) {
      return res.status(400).json({ message: "City query parameter is required." });
    }

    const venues = await Venue.find({
      city: new RegExp(city, "i"),
      isActive: true,
    });

    const sanitizedVenues = venues.map((v) => sanitizeVenueForCaller(v, req.user));

    res.json({ success: true, count: sanitizedVenues.length, venues: sanitizedVenues });
  } catch (error) {
    console.error("Search venues error:", error);
    res.status(500).json({ message: error.message || "Failed to search venues." });
  }
};

// @desc    Get single venue details (sanitizes ownerContact for non-admins)
// @route   GET /api/venues/:id
// @access  Public
export const getVenueById = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) {
      return res.status(404).json({ message: "Venue not found." });
    }

    const sanitizedVenue = sanitizeVenueForCaller(venue, req.user);

    res.json({ success: true, venue: sanitizedVenue });
  } catch (error) {
    console.error("Get venue by ID error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch venue details." });
  }
};

// @desc    Get available 1-hour time slots for a venue on a given date
// @route   GET /api/venues/:id/availability
// @access  Public
export const getVenueAvailability = async (req, res) => {
  try {
    const { date } = req.query; // YYYY-MM-DD
    if (!date) {
      return res.status(400).json({ message: "Date is required (format: YYYY-MM-DD)." });
    }

    const venue = await Venue.findById(req.params.id);
    if (!venue) {
      return res.status(404).json({ message: "Venue not found." });
    }

    // Parse opening and closing times e.g. "06:00" to "22:00"
    const openHour = parseInt(venue.openingTime.split(":")[0], 10) || 6;
    const closeHour = parseInt(venue.closingTime.split(":")[0], 10) || 22;

    // Find all confirmed bookings for this venue on this date
    const existingBookings = await Booking.find({
      venueId: venue._id,
      bookingDate: date,
      status: "confirmed",
    });

    const bookedSlotStarts = new Set(existingBookings.map((b) => b.startTime));

    // Generate list of 1-hour slots
    const slots = [];
    for (let h = openHour; h < closeHour; h++) {
      const startStr = `${String(h).padStart(2, "0")}:00`;
      const endStr = `${String(h + 1).padStart(2, "0")}:00`;
      const isBooked = bookedSlotStarts.has(startStr);

      slots.push({
        startTime: startStr,
        endTime: endStr,
        price: venue.pricePerHour,
        isAvailable: !isBooked,
      });
    }

    res.json({
      success: true,
      venueId: venue._id,
      venueName: venue.name,
      date,
      slots,
    });
  } catch (error) {
    console.error("Get availability error:", error);
    res.status(500).json({ message: error.message || "Failed to check availability." });
  }
};

// @desc    Admin update venue
// @route   PUT /api/venues/:id
// @access  Private (Admin / Organizer)
export const updateVenue = async (req, res) => {
  try {
    const venue = await Venue.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!venue) {
      return res.status(404).json({ message: "Venue not found." });
    }

    await recordAuditLog({
      req,
      action: "venue_updated",
      targetId: venue._id,
      targetCollection: "venues",
      details: { venueName: venue.name },
    });

    res.json({ success: true, message: "Venue updated successfully.", venue });
  } catch (error) {
    console.error("Update venue error:", error);
    res.status(500).json({ message: error.message || "Failed to update venue." });
  }
};

export default {
  getVenues,
  searchVenuesByCity,
  getVenueById,
  getVenueAvailability,
  updateVenue,
};
