// Mock feedback database tailored by occasion
export const OCCASIONS = [
  {
    id: 'Casual',
    label: 'Casual',
    icon: 'Coffee',
    description: 'Everyday hangouts, coffee runs & weekend chill',
    color: '#E0633A',
  },
  {
    id: 'Work',
    label: 'Work',
    icon: 'Briefcase',
    description: 'Office, client meetings & smart professional settings',
    color: '#2563EB',
  },
  {
    id: 'Date',
    label: 'Date',
    icon: 'Heart',
    description: 'Dinner, drinks & charming first impressions',
    color: '#D946EF',
  },
  {
    id: 'Formal',
    label: 'Formal',
    icon: 'Sparkles',
    description: 'Weddings, galas & black-tie celebrations',
    color: '#D97706',
  },
];

const SUGGESTIONS_BANK = {
  Casual: [
    "Swap footwear for clean minimalist sneakers or leather slip-ons to sharpen the silhouette.",
    "Introduce a subtle accessory like an everyday watch or a canvas tote to elevate the relaxed vibe.",
    "Cuff the sleeves or hem slightly to give the proportions a more intentional, styled feel.",
    "Layer with an open lightweight overshirt or denim jacket to add depth and texture.",
    "Balance looser top proportions with slightly tapered trousers or vice-versa for better harmony.",
    "Incorporate a gentle neutral contrast (e.g., warm cream or olive) to break up monochromatic blocks."
  ],
  Work: [
    "Ensure trousers break cleanly at the shoe collar without excessive bunching at the hem.",
    "Add a structured blazer or tailored cardigan to instantly frame your shoulders.",
    "Upgrade to sleek leather footwear (loafers, oxfords, or clean dress flats) with a matching belt.",
    "Tuck in your top or try a neat French tuck to define your waistline and look more put-together.",
    "Opt for subtle, minimal accessories (classic timepiece or delicate jewelry) to keep the look sharp.",
    "Check shoulder seam alignment—having the seam sit right at the edge makes any shirt look bespoke."
  ],
  Date: [
    "Unbutton the top collar slightly or choose a flattering open neckline to create an approachable silhouette.",
    "Choose one focal statement piece—like textured knitwear, sleek boots, or distinct fragrance/jewelry.",
    "Ensure the fit is tailored rather than overly baggy; defined lines convey confidence and presence.",
    "Introduce a warm, inviting texture such as suede, corduroy, silk, or high-gauge merino wool.",
    "Pay attention to shoe polish and grooming details—they pull together the entire date night aesthetic.",
    "Opt for rich evening tones (deep navy, forest green, warm burgundy) over harsh fluorescent brights."
  ],
  Formal: [
    "Make sure your jacket sleeves show about 1/4 to 1/2 inch of shirt cuff for classic formal poise.",
    "Ensure your tie width complements your lapel width, and verify the tie tip hits right at the belt buckle.",
    "Select high-shine, well-buffed dress shoes and pair with socks matching your trousers.",
    "Consider adding a crisp pocket square in white linen or silk with a clean presidential fold.",
    "Check waist tailoring—slight tapering through the midsection enhances an upright, elegant posture.",
    "Keep accessories strictly refined: cufflinks, a dress watch, and coordinated metallic accents."
  ],
};

const VIBE_SUMMARIES = {
  Casual: [
    "Relaxed, modern & effortlessly comfortable",
    "Great everyday cohesion with clean street appeal",
    "Youthful, easygoing, and well-balanced",
  ],
  Work: [
    "Sharp, credible & commanding professional presence",
    "Smart-casual balance with great workplace authority",
    "Clean lines that project competence and poise",
  ],
  Date: [
    "Charming, alluring & charismatic silhouette",
    "High-attraction polish with confident details",
    "Thoughtful balance of comfort and sophistication",
  ],
  Formal: [
    "Sleek, distinguished & impeccably elevated",
    "Red-carpet ready with timeless luxury appeal",
    "Striking elegance and dignified tailoring",
  ],
};

// Generates a mock AI analysis with realistic delay simulation
export function generateFitAnalysis(occasion) {
  const selectedOccasion = occasion || 'Casual';
  const pool = SUGGESTIONS_BANK[selectedOccasion] || SUGGESTIONS_BANK.Casual;
  const vibes = VIBE_SUMMARIES[selectedOccasion] || VIBE_SUMMARIES.Casual;

  // Shuffle and pick 3 suggestions
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  const suggestions = shuffled.slice(0, 3);

  // Score between 7.4 and 9.7 with one decimal
  const baseScore = 7.4 + Math.random() * 2.3;
  const score = Math.min(9.8, parseFloat(baseScore.toFixed(1)));

  // Pick random vibe summary
  const vibe = vibes[Math.floor(Math.random() * vibes.length)];

  // Color harmony verdict
  const harmonies = [
    "Balanced Neutral Harmony",
    "High-Contrast Earth Tone Palette",
    "Subtle Monochromatic Tones",
    "Rich Autumnal Nuances"
  ];
  const harmony = harmonies[Math.floor(Math.random() * harmonies.length)];

  return {
    score,
    vibe,
    harmony,
    occasion: selectedOccasion,
    suggestions,
    analyzedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}
