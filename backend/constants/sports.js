export const SPORTS_LIST = [
  // Team Sports
  { name: "Cricket", category: "Team Sport", icon: "🏏", minPlayers: 11, maxPlayers: 22 },
  { name: "Football", category: "Team Sport", icon: "⚽", minPlayers: 11, maxPlayers: 22 },
  { name: "Kabaddi", category: "Team Sport", icon: "🤼", minPlayers: 7, maxPlayers: 14 },
  { name: "Volleyball", category: "Team Sport", icon: "🏐", minPlayers: 6, maxPlayers: 12 },
  { name: "Basketball", category: "Team Sport", icon: "🏀", minPlayers: 5, maxPlayers: 10 },
  { name: "Hockey", category: "Team Sport", icon: "🏑", minPlayers: 11, maxPlayers: 22 },
  { name: "Handball", category: "Team Sport", icon: "🤾", minPlayers: 7, maxPlayers: 14 },

  // Racquet Sports
  { name: "Badminton", category: "Racquet Sport", icon: "🏸", minPlayers: 1, maxPlayers: 4 },
  { name: "Tennis", category: "Racquet Sport", icon: "🎾", minPlayers: 1, maxPlayers: 4 },
  { name: "Table Tennis", category: "Racquet Sport", icon: "🏓", minPlayers: 1, maxPlayers: 4 },
  { name: "Squash", category: "Racquet Sport", icon: "🏸", minPlayers: 1, maxPlayers: 2 },

  // Combat Sports
  { name: "Boxing", category: "Combat Sport", icon: "🥊", minPlayers: 1, maxPlayers: 2 },
  { name: "Wrestling", category: "Combat Sport", icon: "🤼", minPlayers: 1, maxPlayers: 2 },
  { name: "Judo", category: "Combat Sport", icon: "🥋", minPlayers: 1, maxPlayers: 2 },
  { name: "Karate", category: "Combat Sport", icon: "🥋", minPlayers: 1, maxPlayers: 2 },
  { name: "Taekwondo", category: "Combat Sport", icon: "🥋", minPlayers: 1, maxPlayers: 2 },
  { name: "Fencing", category: "Combat Sport", icon: "🤺", minPlayers: 1, maxPlayers: 2 },

  // Individual Sports
  { name: "Athletics", category: "Individual Sport", icon: "🏃", minPlayers: 1, maxPlayers: 100 },
  { name: "Swimming", category: "Individual Sport", icon: "🏊", minPlayers: 1, maxPlayers: 50 },
  { name: "Cycling", category: "Individual Sport", icon: "🚴", minPlayers: 1, maxPlayers: 50 },
  { name: "Archery", category: "Individual Sport", icon: "🏹", minPlayers: 1, maxPlayers: 10 },
  { name: "Rowing", category: "Individual Sport", icon: "🚣", minPlayers: 1, maxPlayers: 8 },
  { name: "Sailing", category: "Individual Sport", icon: "⛵", minPlayers: 1, maxPlayers: 10 },
  { name: "Gymnastics", category: "Individual Sport", icon: "🤸", minPlayers: 1, maxPlayers: 10 },
  { name: "Weightlifting", category: "Individual Sport", icon: "🏋️", minPlayers: 1, maxPlayers: 10 },
  { name: "Powerlifting", category: "Individual Sport", icon: "🏋️‍♂️", minPlayers: 1, maxPlayers: 10 },
  { name: "Golf", category: "Individual Sport", icon: "⛳", minPlayers: 1, maxPlayers: 4 },
  { name: "Shooting", category: "Individual Sport", icon: "🎯", minPlayers: 1, maxPlayers: 10 },
  { name: "Triathlon", category: "Individual Sport", icon: "🏃‍♀️", minPlayers: 1, maxPlayers: 100 },

  // Indoor Games
  { name: "Chess", category: "Indoor Game", icon: "♟️", minPlayers: 2, maxPlayers: 2 },
  { name: "Carrom", category: "Indoor Game", icon: "🎯", minPlayers: 2, maxPlayers: 4 },
  { name: "Billiards", category: "Indoor Game", icon: "🎱", minPlayers: 2, maxPlayers: 2 },
  { name: "Snooker", category: "Indoor Game", icon: "🎱", minPlayers: 2, maxPlayers: 2 },

  // Traditional Sports
  { name: "Silambam", category: "Traditional Sport", icon: "🎋", minPlayers: 1, maxPlayers: 2 }
];

export const CATEGORIES = [
  "Team Sport",
  "Racquet Sport",
  "Combat Sport",
  "Individual Sport",
  "Indoor Game",
  "Traditional Sport"
];

export const getSportsGroupedByCategory = () => {
  return CATEGORIES.reduce((acc, category) => {
    acc[category] = SPORTS_LIST.filter((s) => s.category === category);
    return acc;
  }, {});
};

export default SPORTS_LIST;
