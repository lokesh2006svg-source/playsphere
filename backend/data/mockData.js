// In-memory mock data. Replace with MongoDB/Mongoose models when ready.

export let rules = [
  {
    id: "r1",
    sport: "Football",
    source: "FIFA",
    sourceUrl: "https://www.fifa.com/en/legal/laws-of-the-game",
    lastUpdated: "2026-01-15",
    version: 3,
    summary: [
      "Match duration: 2 halves of 45 minutes.",
      "Offside rule applies from the halfway line.",
      "VAR allowed only in senior tournaments, not U13-U17.",
    ],
    ageCategoryVariations: {
      U13: "Match reduced to 2 x 25 min. No slide tackles allowed.",
      U14: "Match reduced to 2 x 25 min.",
      U15: "Match reduced to 2 x 30 min.",
      U16: "Match reduced to 2 x 35 min.",
      U17: "Match: 2 x 40 min, full offside rule applies.",
    },
  },
  {
    id: "r2",
    sport: "Basketball",
    source: "FIBA",
    sourceUrl: "https://www.fiba.basketball/rulebook",
    lastUpdated: "2026-02-01",
    version: 2,
    summary: [
      "4 quarters of 10 minutes each.",
      "24-second shot clock in senior play.",
      "Zone defense restricted for U13-U14 categories.",
    ],
    ageCategoryVariations: {
      U13: "Quarters shortened to 8 min. No full-court press allowed.",
      U14: "Quarters shortened to 8 min.",
      U15: "Quarters: 10 min, 24-sec shot clock introduced.",
      U16: "Standard FIBA youth rules apply.",
      U17: "Standard FIBA youth rules apply.",
    },
  },
];

export let matches = [
  {
    id: "m1",
    sport: "Football",
    ageCategory: "U15",
    status: "LIVE",
    teamA: "Coimbatore Strikers",
    teamB: "Erode Eagles",
    scoreA: 2,
    scoreB: 1,
    venue: "SNS Ground, Coimbatore",
    referee: "R. Karthik",
    minute: 63,
    fouls: { teamA: 3, teamB: 5 },
    substitutions: [{ team: "teamA", player: "J. Vishnu -> A. Ram", minute: 58 }],
  },
  {
    id: "m2",
    sport: "Basketball",
    ageCategory: "U17",
    status: "UPCOMING",
    teamA: "Vannam Warriors",
    teamB: "Peelamedu Panthers",
    venue: "Anna University Court, Coimbatore",
    date: "2026-08-20",
    time: "16:00",
    foodAvailable: true,
    foodMenu: ["Water", "Energy bars", "Fresh juice"],
    teamsRegistered: 6,
    totalSlots: 8,
    registrationDeadline: "2026-08-17",
  },
];

export let profiles = [
  {
    id: "p1",
    playerId: "PS-2026-0001",
    name: "Lokesh J",
    sport: "Basketball",
    ageCategory: "U17",
    team: "Vannam Warriors",
    verified: true,
    matchesPlayed: 12,
    achievements: ["Zonal Tournament - 3rd Place"],
  },
];
