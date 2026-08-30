import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import PlayerProfile from "../models/PlayerProfile.js";
import Venue from "../models/Venue.js";
import Booking from "../models/Booking.js";
import Team from "../models/Team.js";
import TeamInvite from "../models/TeamInvite.js";
import Tournament from "../models/Tournament.js";
import TournamentRegistration from "../models/TournamentRegistration.js";
import Match from "../models/Match.js";
import GameRule from "../models/GameRule.js";
import OfficialSportBody from "../models/OfficialSportBody.js";
import Club from "../models/Club.js";
import Notification from "../models/Notification.js";
import InviteLink from "../models/InviteLink.js";
import SyncLog from "../models/SyncLog.js";
import SPORTS_LIST from "../constants/sports.js";

/**
 * Helper to safely upsert a document without duplicating records
 */
const safeUpsert = async (Model, query, docData) => {
  const existing = await Model.findOne(query);
  if (existing) return existing;
  return await Model.create(docData);
};

export const seedDatabase = async () => {
  try {
    console.log("[Seed] Verifying database seed data idempotency...");

    // 1. Seed Official Sports Bodies (Tamil Nadu)
    const tnca = await safeUpsert(OfficialSportBody, { name: "Tamil Nadu Cricket Association", sport: "Cricket" }, {
      sport: "Cricket",
      level: "state",
      name: "Tamil Nadu Cricket Association",
      shortName: "TNCA",
      city: "Chennai",
      website: "https://tnca.cricket",
      contactEmail: "contact@tnca.cricket",
      affiliation: "BCCI / SDAT",
      foundedYear: 1932,
      description: "Governing body for cricket in Tamil Nadu, operating M. A. Chidambaram Stadium.",
      isVerified: true,
    });

    const tnfa = await safeUpsert(OfficialSportBody, { name: "Tamil Nadu Football Association", sport: "Football" }, {
      sport: "Football",
      level: "state",
      name: "Tamil Nadu Football Association",
      shortName: "TNFA",
      city: "Chennai",
      website: "https://the-aiff.com/member-associations/tamil-nadu",
      contactEmail: "tnfa.chennai@gmail.com",
      affiliation: "AIFF",
      foundedYear: 1934,
      description: "State governing body for football leagues, youth development, and state teams.",
      isVerified: true,
    });

    const tnka = await safeUpsert(OfficialSportBody, { name: "Tamil Nadu Kabaddi Association", sport: "Kabaddi" }, {
      sport: "Kabaddi",
      level: "state",
      name: "Tamil Nadu Kabaddi Association",
      shortName: "TNKA",
      city: "Chennai",
      website: "https://tnka.in",
      contactEmail: "admin@tnka.in",
      affiliation: "Amateur Kabaddi Federation of India (AKFI)",
      foundedYear: 2013,
      description: "Promoting grassroot and professional Kabaddi across Tamil Nadu districts.",
      isVerified: true,
    });

    const tnba = await safeUpsert(OfficialSportBody, { name: "Tamil Nadu Basketball Association", sport: "Basketball" }, {
      sport: "Basketball",
      level: "state",
      name: "Tamil Nadu Basketball Association",
      shortName: "TNBA",
      city: "Chennai",
      website: "https://tnbahub.com",
      contactEmail: "support@tnbahub.com",
      affiliation: "Basketball Federation of India (BFI) / SDAT",
      foundedYear: 1955,
      description: "Apex basketball authority organizing State Championships and youth tournaments.",
      isVerified: true,
    });

    const tnsa = await safeUpsert(OfficialSportBody, { name: "Tamil Nadu Silambam Association", sport: "Silambam" }, {
      sport: "Silambam",
      level: "state",
      name: "Tamil Nadu Silambam Association",
      shortName: "TNSA",
      city: "Madurai",
      website: "https://silambam.tn.gov.in",
      contactEmail: "info@tnsilambam.org",
      affiliation: "World Silambam Association / SDAT Recognized",
      foundedYear: 1980,
      description: "Preserving and regulating traditional Tamil martial art competitions.",
      isVerified: true,
    });

    // District Bodies
    const cfa = await safeUpsert(OfficialSportBody, { name: "Chennai Football Association", sport: "Football" }, {
      sport: "Football",
      level: "district",
      name: "Chennai Football Association",
      shortName: "CFA",
      city: "Chennai",
      parentBodyId: tnfa._id,
      website: "https://cfafootball.org",
      contactEmail: "cfa.chennai@gmail.com",
      affiliation: "TNFA",
      foundedYear: 1948,
      description: "Organizes the prestigious CFA Senior Division League in Chennai.",
      isVerified: true,
    });

    const cdba = await safeUpsert(OfficialSportBody, { name: "Coimbatore District Basketball Association", sport: "Basketball" }, {
      sport: "Basketball",
      level: "district",
      name: "Coimbatore District Basketball Association",
      shortName: "CDBA",
      city: "Coimbatore",
      parentBodyId: tnba._id,
      website: "https://cdba.coimbatore.in",
      contactEmail: "cdbaoffice@gmail.com",
      affiliation: "TNBA",
      foundedYear: 1968,
      description: "Promoting basketball in Coimbatore schools, colleges, and clubs.",
      isVerified: true,
    });

    const mdka = await safeUpsert(OfficialSportBody, { name: "Madurai District Amateur Kabaddi Association", sport: "Kabaddi" }, {
      sport: "Kabaddi",
      level: "district",
      name: "Madurai District Amateur Kabaddi Association",
      shortName: "MDKA",
      city: "Madurai",
      parentBodyId: tnka._id,
      contactEmail: "maduraikabaddi@gmail.com",
      affiliation: "TNKA",
      foundedYear: 1974,
      description: "Heart of Southern Tamil Nadu kabaddi tournaments and village leagues.",
      isVerified: true,
    });

    const tdca = await safeUpsert(OfficialSportBody, { name: "Tiruchirappalli District Cricket Association", sport: "Cricket" }, {
      sport: "Cricket",
      level: "district",
      name: "Tiruchirappalli District Cricket Association",
      shortName: "TDCA",
      city: "Trichy",
      parentBodyId: tnca._id,
      contactEmail: "tdca.trichy@gmail.com",
      affiliation: "TNCA",
      foundedYear: 1958,
      description: "Trichy league cricket and inter-school talent development.",
      isVerified: true,
    });

    // 2. Seed Clubs
    const marinaClub = await safeUpsert(Club, { name: "Marina Cricket Club", city: "Chennai", sport: "Cricket" }, {
      name: "Marina Cricket Club",
      sport: "Cricket",
      city: "Chennai",
      stateBodyId: tnca._id,
      districtBodyId: null,
      homeGround: "Marina Beach Grounds / Chepauk Nets",
      foundedYear: 1998,
      contactEmail: "marinacricket@playsphere.com",
      isVerified: true,
      description: "Premier weekend cricket squad competing in Chennai division tournaments.",
      memberCount: 28,
    });

    const chennaiUnitedFC = await safeUpsert(Club, { name: "Chennai United Football Club", city: "Chennai", sport: "Football" }, {
      name: "Chennai United Football Club",
      sport: "Football",
      city: "Chennai",
      stateBodyId: tnfa._id,
      districtBodyId: cfa._id,
      homeGround: "Jawaharlal Nehru Stadium B-Ground",
      foundedYear: 2004,
      contactEmail: "chennaiunited@playsphere.com",
      isVerified: true,
      description: "CFA Senior Division contender with active youth development academy.",
      memberCount: 35,
    });

    const kovaiHoops = await safeUpsert(Club, { name: "Kovai Basketball Academy", city: "Coimbatore", sport: "Basketball" }, {
      name: "Kovai Basketball Academy",
      sport: "Basketball",
      city: "Coimbatore",
      stateBodyId: tnba._id,
      districtBodyId: cdba._id,
      homeGround: "VOC Park Basketball Court",
      foundedYear: 2012,
      contactEmail: "kovaihoops@playsphere.com",
      isVerified: true,
      description: "Top youth basketball academy training district and state representatives.",
      memberCount: 45,
    });

    const kovaiSmashers = await safeUpsert(Club, { name: "Coimbatore Smashers Badminton Club", city: "Coimbatore", sport: "Badminton" }, {
      name: "Coimbatore Smashers Badminton Club",
      sport: "Badminton",
      city: "Coimbatore",
      stateBodyId: null,
      districtBodyId: null,
      homeGround: "Nehru Stadium Badminton Complex",
      foundedYear: 2016,
      contactEmail: "kovaismashers@playsphere.com",
      isVerified: true,
      description: "Competitive badminton squad with elite coaching for state ranked juniors.",
      memberCount: 32,
    });

    const maduraiBulls = await safeUpsert(Club, { name: "Madurai Veeran Kabaddi Club", city: "Madurai", sport: "Kabaddi" }, {
      name: "Madurai Veeran Kabaddi Club",
      sport: "Kabaddi",
      city: "Madurai",
      stateBodyId: tnka._id,
      districtBodyId: mdka._id,
      homeGround: "Race Course Indoor Kabaddi Mat",
      foundedYear: 2005,
      contactEmail: "maduraibulls@playsphere.com",
      isVerified: true,
      description: "Fierce local kabaddi powerhouse known for pro-kabaddi academy talent.",
      memberCount: 22,
    });

    const maduraiSilambam = await safeUpsert(Club, { name: "Madurai Silambam Martial Academy", city: "Madurai", sport: "Silambam" }, {
      name: "Madurai Silambam Martial Academy",
      sport: "Silambam",
      city: "Madurai",
      stateBodyId: tnsa._id,
      districtBodyId: null,
      homeGround: "Tamukkam Grounds",
      foundedYear: 1995,
      contactEmail: "maduraisilambam@playsphere.com",
      isVerified: true,
      description: "Preserving traditional Tamil warrior martial arts and weapon fighting techniques.",
      memberCount: 40,
    });

    const rockfortCricket = await safeUpsert(Club, { name: "Rockfort Cricket Club", city: "Trichy", sport: "Cricket" }, {
      name: "Rockfort Cricket Club",
      sport: "Cricket",
      city: "Trichy",
      stateBodyId: tnca._id,
      districtBodyId: tdca._id,
      homeGround: "Anna Stadium Cricket Grounds",
      foundedYear: 2008,
      contactEmail: "rockfortcricket@playsphere.com",
      isVerified: true,
      description: "TDCA division 1 champion team promoting grassroot talent across Central Tamil Nadu.",
      memberCount: 30,
    });

    const salemStrikers = await safeUpsert(Club, { name: "Salem Strikers Football Club", city: "Salem", sport: "Football" }, {
      name: "Salem Strikers Football Club",
      sport: "Football",
      city: "Salem",
      stateBodyId: tnfa._id,
      districtBodyId: null,
      homeGround: "Mahatma Gandhi Stadium",
      foundedYear: 2015,
      contactEmail: "salemstrikers@playsphere.com",
      isVerified: true,
      description: "Fast-growing community football club fielding youth teams in state cups.",
      memberCount: 26,
    });

    // 3. Seed Users & Profiles
    const usersData = [
      {
        name: "Lokesh Kumar",
        email: "demo@playsphere.com",
        password: "password123",
        city: "Chennai",
        location: "Mylapore, Chennai, Tamil Nadu",
        role: "super_admin",
        hasCompletedProfile: true,
        profile: {
          sport: "Cricket",
          secondarySports: ["Badminton", "Football"],
          skillLevel: "advanced",
          rating: 4.9,
          location: { type: "Point", coordinates: [80.2608, 13.0336] },
          city: "Chennai",
          bio: "All-rounder batsman & wicketkeeper. Active in Chennai corporate and weekend leagues.",
          badges: ["League MVP 2025", "Verified Athlete", "Century Scorer", "PlaySphere Captain"],
          matchesPlayed: 48,
          matchesWon: 36,
          playerIdNumber: "PS-2026-00001",
        },
      },
      {
        name: "Karthik Subramanian",
        email: "karthik@playsphere.com",
        password: "password123",
        city: "Chennai",
        location: "Anna Nagar, Chennai, Tamil Nadu",
        role: "player",
        hasCompletedProfile: true,
        profile: {
          sport: "Football",
          secondarySports: ["Cricket"],
          skillLevel: "advanced",
          rating: 4.7,
          location: { type: "Point", coordinates: [80.2098, 13.085] },
          city: "Chennai",
          bio: "Striker & Center-forward. Chennai CFA 2nd division player.",
          badges: ["Golden Boot 2025", "Hat-trick Hero"],
          matchesPlayed: 32,
          matchesWon: 22,
          playerIdNumber: "PS-2026-00002",
        },
      },
      {
        name: "Ananya Ramesh",
        email: "ananya@playsphere.com",
        password: "password123",
        city: "Coimbatore",
        location: "RS Puram, Coimbatore, Tamil Nadu",
        role: "player",
        hasCompletedProfile: true,
        profile: {
          sport: "Badminton",
          secondarySports: ["Tennis", "Table Tennis"],
          skillLevel: "advanced",
          rating: 4.8,
          location: { type: "Point", coordinates: [76.945, 11.008] },
          city: "Coimbatore",
          bio: "State-level badminton singles player. 2024 Coimbatore Open Runner-up.",
          badges: ["State Finalist", "Smash Ace", "Fair Play Award"],
          matchesPlayed: 41,
          matchesWon: 33,
          playerIdNumber: "PS-2026-00003",
        },
      },
      {
        name: "Muthu Vel",
        email: "muthu@playsphere.com",
        password: "password123",
        city: "Madurai",
        location: "K.K. Nagar, Madurai, Tamil Nadu",
        role: "player",
        hasCompletedProfile: true,
        profile: {
          sport: "Kabaddi",
          secondarySports: ["Silambam"],
          skillLevel: "advanced",
          rating: 4.6,
          location: { type: "Point", coordinates: [78.145, 9.925] },
          city: "Madurai",
          bio: "Lead Raider for Madurai Bulls. District Championship gold medalist.",
          badges: ["Super Raider", "Pro League Trialist"],
          matchesPlayed: 29,
          matchesWon: 24,
          playerIdNumber: "PS-2026-00004",
        },
      },
      {
        name: "Praveen Raj",
        email: "praveen@playsphere.com",
        password: "password123",
        city: "Trichy",
        location: "Thillai Nagar, Tiruchirappalli, Tamil Nadu",
        role: "player",
        hasCompletedProfile: true,
        profile: {
          sport: "Basketball",
          secondarySports: ["Volleyball"],
          skillLevel: "intermediate",
          rating: 4.4,
          location: { type: "Point", coordinates: [78.692, 10.815] },
          city: "Trichy",
          bio: "Point guard for Rockfort Blasters. 3-point specialist.",
          badges: ["3-Point Sharpshooter"],
          matchesPlayed: 19,
          matchesWon: 12,
          playerIdNumber: "PS-2026-00005",
        },
      },
      {
        name: "Deepa Sundaram",
        email: "deepa@playsphere.com",
        password: "password123",
        city: "Salem",
        location: "Fairlands, Salem, Tamil Nadu",
        role: "player",
        hasCompletedProfile: true,
        profile: {
          sport: "Silambam",
          secondarySports: ["Karate"],
          skillLevel: "advanced",
          rating: 4.9,
          location: { type: "Point", coordinates: [78.146, 11.664] },
          city: "Salem",
          bio: "Traditional Silambam practitioner and martial arts trainer.",
          badges: ["Traditional Heritage Master", "Gold Medalist"],
          matchesPlayed: 25,
          matchesWon: 23,
          playerIdNumber: "PS-2026-00006",
        },
      },
      {
        name: "Vikram Sethuraman",
        email: "vikram@playsphere.com",
        password: "password123",
        city: "Chennai",
        location: "Besant Nagar, Chennai, Tamil Nadu",
        role: "player",
        hasCompletedProfile: true,
        profile: {
          sport: "Tennis",
          secondarySports: ["Squash", "Pickleball"],
          skillLevel: "advanced",
          rating: 4.7,
          location: { type: "Point", coordinates: [80.2667, 13.0002] },
          city: "Chennai",
          bio: "AITA ranked tennis athlete. Plays baseline power game.",
          badges: ["Tournament Champion", "AITA Ranked"],
          matchesPlayed: 36,
          matchesWon: 27,
          playerIdNumber: "PS-2026-00007",
        },
      },
      {
        name: "Dinesh Kumar",
        email: "dinesh@playsphere.com",
        password: "password123",
        city: "Coimbatore",
        location: "Peelamedu, Coimbatore, Tamil Nadu",
        role: "player",
        hasCompletedProfile: true,
        profile: {
          sport: "Cricket",
          secondarySports: ["Volleyball"],
          skillLevel: "intermediate",
          rating: 4.3,
          location: { type: "Point", coordinates: [77.012, 11.025] },
          city: "Coimbatore",
          bio: "Fast bowler bowling 125+ kmph. Looking for weekend league teams in Kovai.",
          badges: ["Pace Express", "5-Wicket Haul"],
          matchesPlayed: 22,
          matchesWon: 14,
          playerIdNumber: "PS-2026-00008",
        },
      },
    ];

    const seededUsers = [];
    for (const u of usersData) {
      let user = await User.findOne({ email: u.email.toLowerCase() });
      if (!user) {
        user = await User.create({
          name: u.name,
          email: u.email.toLowerCase(),
          password: u.password,
          city: u.city,
          location: u.location,
          role: u.role,
          hasCompletedProfile: u.hasCompletedProfile,
          isEmailVerified: true,
        });
      }
      seededUsers.push(user);

      if (u.profile) {
        let profile = await PlayerProfile.findOne({ userId: user._id });
        if (!profile) {
          await PlayerProfile.create({
            userId: user._id,
            ...u.profile,
          });
        }
      }
    }

    const [adminUser, karthikUser, ananyaUser, muthuUser, praveenUser] = seededUsers;

    // 4. Seed Venues
    const venuesData = [
      {
        name: "Marina Grand Sports Turf",
        sportType: "Football",
        city: "Chennai",
        address: "54 Kamarajar Salai, Marina Beach Road, Chennai, Tamil Nadu 600005",
        location: { type: "Point", coordinates: [80.2825, 13.05] },
        venueType: "private_turf",
        pricePerHour: 1200,
        openingTime: "06:00",
        closingTime: "23:00",
        photos: ["https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80"],
        amenities: ["FIFA Standard AstroTurf", "LED Floodlights", "Bibs & Match Balls", "Changing Rooms"],
        contactPhone: "+91 98401 23456",
        rating: 4.9,
        reviewCount: 56,
      },
      {
        name: "Chepauk Pavilion Cricket Nets & Ground",
        sportType: "Cricket",
        city: "Chennai",
        address: "Victoria Hostel Rd, Chepauk, Chennai, Tamil Nadu 600005",
        location: { type: "Point", coordinates: [80.2792, 13.0628] },
        venueType: "college_ground",
        pricePerHour: 800,
        openingTime: "05:30",
        closingTime: "21:00",
        photos: ["https://images.unsplash.com/photo-1531415074868-036b1c57e329?auto=format&fit=crop&w=800&q=80"],
        amenities: ["4 Turf Nets", "Bowling Machine", "Sight Screens", "Pavilion Seating"],
        contactPhone: "+91 94440 98765",
        rating: 4.8,
        reviewCount: 42,
      },
      {
        name: "Velachery Badminton & Squash Club",
        sportType: "Badminton",
        city: "Chennai",
        address: "100 Feet Bypass Road, Velachery, Chennai, Tamil Nadu 600042",
        location: { type: "Point", coordinates: [80.2209, 12.9815] },
        venueType: "private_turf",
        pricePerHour: 450,
        openingTime: "05:00",
        closingTime: "23:00",
        photos: ["https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80"],
        amenities: ["6 BWF Synthetic Courts", "Wooden Underlay", "AC Lounge", "Shower Facilities"],
        contactPhone: "+91 98844 55667",
        rating: 4.7,
        reviewCount: 38,
      },
      {
        name: "CODISSIA Sports Arena & Turf",
        sportType: "Cricket",
        city: "Coimbatore",
        address: "Avinashi Road, Peelamedu, Coimbatore, Tamil Nadu 641014",
        location: { type: "Point", coordinates: [77.035, 11.03] },
        venueType: "private_turf",
        pricePerHour: 900,
        openingTime: "06:00",
        closingTime: "22:30",
        photos: ["https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=800&q=80"],
        amenities: ["Multi-Sport Turf", "Box Cricket Cage", "Dugouts", "Ample Parking"],
        contactPhone: "+91 99422 11223",
        rating: 4.9,
        reviewCount: 47,
      },
      {
        name: "Madurai Race Course Indoor Stadium & Mat",
        sportType: "Kabaddi",
        city: "Madurai",
        address: "Race Course Colony, Madurai, Tamil Nadu 625002",
        location: { type: "Point", coordinates: [78.136, 9.936] },
        venueType: "public_stadium",
        pricePerHour: 600,
        openingTime: "06:00",
        closingTime: "21:00",
        photos: ["https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80"],
        amenities: ["Pro Mats", "Spectator Stands", "First Aid Center", "Locker Rooms"],
        contactPhone: "+91 98421 88990",
        rating: 4.8,
        reviewCount: 32,
      },
      {
        name: "Trichy Rockfort Sports Park",
        sportType: "Basketball",
        city: "Trichy",
        address: "Collector Office Rd, Cantonment, Tiruchirappalli, Tamil Nadu 620001",
        location: { type: "Point", coordinates: [78.688, 10.806] },
        venueType: "community_ground",
        pricePerHour: 500,
        openingTime: "06:00",
        closingTime: "22:00",
        photos: ["https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80"],
        amenities: ["Standard Acrylic Court", "Night Floodlights", "Seating Gallery"],
        contactPhone: "+91 97890 33445",
        rating: 4.6,
        reviewCount: 29,
      },
      {
        name: "Kovai Smashers Arena",
        sportType: "Badminton",
        city: "Coimbatore",
        address: "12 Cross Cut Rd, Gandhipuram, Coimbatore, Tamil Nadu 641012",
        location: { type: "Point", coordinates: [76.966, 11.018] },
        venueType: "private_turf",
        pricePerHour: 500,
        openingTime: "05:30",
        closingTime: "22:30",
        photos: ["https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80"],
        amenities: ["4 BWF Wooden Courts", "Locker Room", "Equipment Rental"],
        contactPhone: "+91 98430 77889",
        rating: 4.8,
        reviewCount: 24,
      },
    ];

    const seededVenues = [];
    for (const v of venuesData) {
      const venue = await safeUpsert(Venue, { name: v.name, city: v.city }, v);
      seededVenues.push(venue);
    }
    const [marinaTurf, chepaukVenue] = seededVenues;

    // 5. Seed Teams
    const team1 = await safeUpsert(Team, { name: "Chennai Super Smashers", city: "Chennai", sport: "Cricket" }, {
      name: "Chennai Super Smashers",
      sport: "Cricket",
      city: "Chennai",
      captainId: adminUser._id,
      clubId: marinaClub._id,
      bio: "Active T20 weekend cricket club based out of Chennai.",
      members: [
        { userId: adminUser._id, role: "captain", joinedAt: new Date() },
        { userId: karthikUser._id, role: "player", joinedAt: new Date() },
      ],
      stats: { matchesPlayed: 14, matchesWon: 11, matchesLost: 3, tournamentsWon: 2 },
    });

    const team2 = await safeUpsert(Team, { name: "Kovai Thunderbolts", city: "Coimbatore", sport: "Cricket" }, {
      name: "Kovai Thunderbolts",
      sport: "Cricket",
      city: "Coimbatore",
      captainId: ananyaUser._id,
      bio: "Coimbatore division champions known for aggressive batting lineups.",
      members: [{ userId: ananyaUser._id, role: "captain", joinedAt: new Date() }],
      stats: { matchesPlayed: 12, matchesWon: 8, matchesLost: 4, tournamentsWon: 1 },
    });

    const team3 = await safeUpsert(Team, { name: "Madurai Bulls Kabaddi Squad", city: "Madurai", sport: "Kabaddi" }, {
      name: "Madurai Bulls Kabaddi Squad",
      sport: "Kabaddi",
      city: "Madurai",
      captainId: muthuUser._id,
      clubId: maduraiBulls._id,
      bio: "Traditional kabaddi powerhouse representing South Tamil Nadu.",
      members: [{ userId: muthuUser._id, role: "captain", joinedAt: new Date() }],
      stats: { matchesPlayed: 18, matchesWon: 15, matchesLost: 3, tournamentsWon: 3 },
    });

    const team4 = await safeUpsert(Team, { name: "Rockfort Blasters", city: "Trichy", sport: "Cricket" }, {
      name: "Rockfort Blasters",
      sport: "Cricket",
      city: "Trichy",
      captainId: praveenUser._id,
      bio: "Trichy division warriors ready for knockout stages.",
      members: [{ userId: praveenUser._id, role: "captain", joinedAt: new Date() }],
      stats: { matchesPlayed: 9, matchesWon: 5, matchesLost: 4, tournamentsWon: 0 },
    });

    // 6. Seed Tournaments
    const tournament1 = await safeUpsert(Tournament, { name: "Tamil Nadu State T20 Championship 2026", city: "Chennai", sport: "Cricket" }, {
      name: "Tamil Nadu State T20 Championship 2026",
      sport: "Cricket",
      description: "Official Knockout tournament featuring the finest amateur cricket teams across Tamil Nadu.",
      format: "knockout",
      startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      registrationDeadline: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      venueId: chepaukVenue._id,
      city: "Chennai",
      maxTeams: 8,
      organizerId: adminUser._id,
      officialBodyId: tnca._id,
      status: "ongoing",
      prizePool: "₹50,000 + Championship Trophy",
      entryFee: 1500,
      bannerUrl: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80",
    });

    await safeUpsert(TournamentRegistration, { tournamentId: tournament1._id, teamId: team1._id }, {
      tournamentId: tournament1._id,
      teamId: team1._id,
      registeredBy: adminUser._id,
      status: "approved",
      seedNumber: 1,
    });

    // 7. Seed 34 Sports Rules
    for (const sportObj of SPORTS_LIST) {
      await safeUpsert(GameRule, { sport: sportObj.name }, {
        sport: sportObj.name,
        category: sportObj.category,
        summary: `${sportObj.name} is a renowned sport played in Tamil Nadu and internationally.`,
        keyRules: [
          `All official rules of ${sportObj.name} follow national & international federations.`,
          "Fair play, referee decisions, and respectful conduct are mandatory across all tournaments.",
        ],
        playerCount: "Standard regulation team size",
        duration: "Standard regulation match duration",
        officialSourceName: `Official ${sportObj.name} Federation 2026`,
      });
    }

    // 8. Seed Invite Links
    const inviteLinks = [
      { createdBy: adminUser._id, inviteCode: "PLAY-CHENNAI-2026", sport: "All Sports", city: "Chennai" },
      { createdBy: adminUser._id, inviteCode: "CRI-CHE-SUPER", sport: "Cricket", city: "Chennai" },
      { createdBy: ananyaUser._id, inviteCode: "PS-BAD-KOVAI", sport: "Badminton", city: "Coimbatore" },
      { createdBy: muthuUser._id, inviteCode: "PS-KAB-MADURAI", sport: "Kabaddi", city: "Madurai" },
    ];

    for (const inv of inviteLinks) {
      await safeUpsert(InviteLink, { inviteCode: inv.inviteCode }, inv);
    }

    console.log("[Seed] PlaySphere database verified & fully synchronized with zero duplicates! ✅");
  } catch (error) {
    console.error("[Seed] Seeding error:", error.message);
  }
};

export default seedDatabase;
