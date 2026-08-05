// ─────────────────────────────────────────────────────────────
// EDIT ME: every piece of party-specific content lives in this
// one file. Swap text, photos, dates and numbers here — nothing
// else in the app needs to change.
// ─────────────────────────────────────────────────────────────

export const siteConfig = {
  babyName: "Sihagi Ayenya",
  eventTitle: "Sihagi Ayenya turns ONE",
  eventSlug: "sihagi-ayenya-first-birthday", // used as a storage key prefix — change per event

  // Hero
  heroPhoto: "/photos/11 months.jpeg",
  heroTagline: "One trip around the sun, a whole lot of love.",

  // Story sections (shown while scrolling, in order)
  story: [
    {
      id: "arrival",
      eyebrow: "August 2025",
      title: "The day she arrived",
      text: "After nine months of waiting (and about a hundred name debates), Sihagi Ayenya finally made her entrance — loud, pink-cheeked, and utterly sure of herself from minute one.",
      photo: "/photos/The day she arrived.jpeg",
    },
    {
      id: "parents",
      eyebrow: "Mom & Dad",
      title: "Meet the (very tired, very happy) parents",
      text: "Kaushani and Nalaka — coffee-dependent, sleep-deprived, and completely smitten. Between them they've mastered swaddling, sung roughly four thousand lullabies, and learned that a baby's laugh fixes almost anything.",
      photo: "/photos/Meet the very tired very happy parents.jpeg",
    },
    {
      id: "firsts",
      eyebrow: "The year of firsts",
      title: "First smile. First tooth. First everything.",
      text: "First giggle at three months. First taste of banana (mixed reviews). First wobbly steps just last week — she's been keeping us on our toes ever since, and we wouldn't have it any other way.",
      photo: "/photos/First smile. First tooth.jpeg",
    },
    {
      id: "today",
      eyebrow: "Today",
      title: "Now she's turning one!",
      text: "A whole year of firsts calls for a proper celebration — cake, chaos, and everyone we love in one room. We'd be so happy if you could join us.",
      photo: "/photos/11 months.jpeg",
    },
  ],

  // Party details
  party: {
    dateISO: "2026-08-29T18:00:00+05:30", // ISO date used for the countdown + calendar link
    dateDisplay: "Saturday, August 29th, 2026",
    timeDisplay: "6:00 PM onwards",
    venueName: "Crown Regency",
    venueAddress: "Crown Regency, Badulla, Sri Lanka",
    // Get these from Google Maps: share a place → the lat,lng is in the URL
    mapsQuery: "Crown Regency, Badulla, Sri Lanka",
    dressCode: "Soft pastels & comfy shoes — there's a celebration involved.",
  },

  // Contacts shown at the bottom
  contacts: {
    mom: { name: "Kaushani", whatsapp: "94716307200" }, // country code, no +, no spaces
    dad: { name: "Nalaka", whatsapp: "94764019678" },
  },

  // Simple shared passcode for the parents' live dashboard at /dashboard
  // (also set as DASHBOARD_PASSWORD env var on Vercel — that's the one that's actually enforced)
  dashboardHint: "Ask Nalaka or Kaushani if you forgot the passcode 🍼",
} as const;

export const monthlyMilestones = [
  { month: 1, label: "1st Month", caption: "Sweet beginnings & tiny hands", photo: "/photos/1 month.jpeg" },
  { month: 2, label: "2nd Month", caption: "Bright eyes & big curious smiles", photo: "/photos/2 months.jpeg" },
  { month: 3, label: "3rd Month", caption: "Soft giggles & happy coos", photo: "/photos/3 months.jpeg" },
  { month: 4, label: "4th Month", caption: "Reaching out & exploring the world", photo: "/photos/4 months.jpeg" },
  { month: 5, label: "5th Month", caption: "Rolling over & belly laughs", photo: "/photos/5 months.jpeg" },
  { month: 6, label: "6th Month", caption: "Halfway to one! Sunshine & joy", photo: "/photos/6 months.jpeg" },
  { month: 7, label: "7th Month", caption: "Sitting up proud & playing around", photo: "/photos/7 months.jpeg" },
  { month: 8, label: "8th Month", caption: "Little explorer on the move", photo: "/photos/8 months.jpeg" },
  { month: 9, label: "9th Month", caption: "Standing tall with a golden smile", photo: "/photos/9 months.jpeg" },
  { month: 10, label: "10th Month", caption: "Waving hello & cheerful steps", photo: "/photos/10 months.jpeg" },
  { month: 11, label: "11th Month", caption: "Almost ONE! Ready to celebrate", photo: "/photos/11 months.jpeg" },
];

export type StoryItem = (typeof siteConfig.story)[number];
