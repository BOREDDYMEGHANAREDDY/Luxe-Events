const Event = require('../models/Event');
const Venue = require('../models/Venue');

// Rule-based AI event recommendation engine
// (Can be upgraded to OpenAI/Gemini for production)

const BUDGET_TIERS = {
  budget:   { min: 0,      max: 300000,   label: 'Budget-Friendly' },
  mid:      { min: 300000, max: 800000,   label: 'Mid-Range' },
  premium:  { min: 800000, max: 2000000,  label: 'Premium' },
  luxury:   { min: 2000000, max: Infinity, label: 'Ultra-Luxury' }
};

const DECORATION_SUGGESTIONS = {
  wedding: {
    themes: ['Royal Heritage', 'Garden Bloom', 'Crystal Palace', 'Rustic Chic'],
    colors: [['Gold', 'Ivory', 'Blush'], ['Deep Red', 'Gold', 'White'], ['Sage', 'Dusty Pink', 'Cream']],
    elements: ['Floral arches', 'Fairy lights', 'Draped fabric', 'Crystal centerpieces', 'Lanterns']
  },
  corporate: {
    themes: ['Modern Minimal', 'Tech Forward', 'Executive Elegance'],
    colors: [['Navy', 'Gold', 'White'], ['Charcoal', 'Silver', 'Black']],
    elements: ['LED backdrops', 'Company branding', 'Minimalist table settings', 'Stage setup']
  },
  birthday: {
    themes: ['Glam Party', 'Tropical Escape', 'Vintage Hollywood', 'Milestone Celebration'],
    colors: [['Gold', 'Black', 'White'], ['Pastel Rainbow', 'Silver'], ['Purple', 'Gold']],
    elements: ['Photo walls', 'Balloon installations', 'Neon signs', 'Dessert displays']
  }
};

const VENUE_PREFERENCES = {
  wedding: ['palace', 'resort', 'garden', 'beach', 'banquet-hall'],
  corporate: ['convention-center', 'hotel', 'rooftop'],
  birthday: ['banquet-hall', 'rooftop', 'farmhouse'],
  'destination-wedding': ['beach', 'resort', 'palace'],
  'product-launch': ['convention-center', 'hotel', 'rooftop'],
  'private-celebration': ['farmhouse', 'rooftop', 'resort']
};

// ─── POST /api/ai/recommendations ───────────────────────────────
exports.getRecommendations = async (req, res) => {
  const { eventType, guestCount, budget, preferences = [], date } = req.body;

  // Determine budget tier
  const tier = Object.entries(BUDGET_TIERS).find(([, v]) => budget >= v.min && budget < v.max);
  const budgetTier = tier ? tier[0] : 'mid';

  // Get matching events
  const events = await Event.find({
    category: eventType,
    isActive: true,
    minGuests: { $lte: guestCount },
    maxGuests: { $gte: guestCount },
    basePrice: { $lte: budget * 0.6 }
  }).limit(3);

  // Get matching venues
  const venueTypes = VENUE_PREFERENCES[eventType] || ['banquet-hall'];
  const venues = await Venue.find({
    type: { $in: venueTypes },
    isActive: true,
    'capacity.min': { $lte: guestCount },
    'capacity.max': { $gte: guestCount },
    'pricing.basePrice': { $lte: budget * 0.4 }
  }).limit(3);

  // Budget breakdown
  const budgetBreakdown = {
    venue:       Math.round(budget * 0.30),
    catering:    Math.round(budget * 0.35),
    decoration:  Math.round(budget * 0.15),
    photography: Math.round(budget * 0.10),
    music:       Math.round(budget * 0.05),
    miscellaneous: Math.round(budget * 0.05)
  };

  // Decoration suggestions
  const eventCategory = eventType in DECORATION_SUGGESTIONS ? eventType : 'wedding';
  const decorSuggestions = DECORATION_SUGGESTIONS[eventCategory];

  // Package recommendations
  const packageTip = budgetTier === 'luxury'
    ? 'We recommend our Diamond package with fully customized services, a dedicated event director, and 24/7 support.'
    : budgetTier === 'premium'
    ? 'Our Gold package offers luxury touches with premium vendors and personalized coordination.'
    : 'Our Silver package provides excellent value with curated services within your budget.';

  // Timeline suggestion
  const monthsBefore = guestCount > 200 ? 6 : guestCount > 100 ? 4 : 2;
  const eventDateObj = date ? new Date(date) : new Date();
  const bookByDate = new Date(eventDateObj);
  bookByDate.setMonth(bookByDate.getMonth() - monthsBefore);

  const recommendations = {
    budgetTier: BUDGET_TIERS[budgetTier]?.label,
    summary: `Based on ${guestCount} guests and a budget of ₹${budget.toLocaleString('en-IN')}, we've curated the perfect ${eventType.replace('-', ' ')} plan for you.`,
    recommendedPackage: packageTip,
    events: events.map(e => ({
      id: e._id, title: e.title, basePrice: e.basePrice,
      coverImage: e.coverImage, rating: e.rating
    })),
    venues: venues.map(v => ({
      id: v._id, name: v.name, type: v.type,
      location: v.location, basePrice: v.pricing.basePrice,
      coverImage: v.coverImage, rating: v.rating, capacity: v.capacity
    })),
    budgetBreakdown,
    decoration: {
      recommendedTheme: decorSuggestions.themes[Math.floor(Math.random() * decorSuggestions.themes.length)],
      colorPalette: decorSuggestions.colors[Math.floor(Math.random() * decorSuggestions.colors.length)],
      keyElements: decorSuggestions.elements.slice(0, 4)
    },
    timeline: {
      bookBy: bookByDate.toLocaleDateString('en-IN'),
      monthsAhead: monthsBefore,
      milestones: [
        `Book venue ${monthsBefore} months in advance`,
        `Confirm catering menu ${Math.max(1, monthsBefore - 1)} months before`,
        `Send invitations ${Math.max(1, monthsBefore - 2)} months before`,
        'Final headcount 2 weeks before the event',
        'Run-through & site check 3 days before'
      ]
    },
    tips: [
      `For ${guestCount} guests, plan seating in rounds of 8-10 for optimal comfort`,
      'Book photography at least 3 months in advance for premium slots',
      `${eventType === 'wedding' ? 'Consider a pre-wedding shoot for additional memories' : 'A live band adds 15-20% to entertainment costs'}`,
      'GST of 18% will be applied to all services'
    ]
  };

  res.json({ success: true, data: recommendations });
};

// ─── GET /api/ai/budget-estimate ────────────────────────────────
exports.getBudgetEstimate = async (req, res) => {
  const { eventType, guestCount, luxuryLevel = 'mid', includeFood = true } = req.query;
  const guests = parseInt(guestCount);

  const perPersonRates = {
    budget:  { venue: 500, food: 800, decor: 200, misc: 150 },
    mid:     { venue: 1200, food: 1500, decor: 500, misc: 350 },
    premium: { venue: 3000, food: 3000, decor: 1200, misc: 800 },
    luxury:  { venue: 8000, food: 6000, decor: 3000, misc: 2000 }
  };

  const rates = perPersonRates[luxuryLevel] || perPersonRates.mid;
  const eventMultiplier = { wedding: 1.5, 'destination-wedding': 2.5, corporate: 1.0, birthday: 0.8 };
  const mult = eventMultiplier[eventType] || 1.0;

  const venue        = Math.round(rates.venue * guests * mult);
  const food         = includeFood === 'true' ? Math.round(rates.food * guests * mult) : 0;
  const decoration   = Math.round(rates.decor * guests * mult);
  const photography  = Math.round((luxuryLevel === 'luxury' ? 80000 : luxuryLevel === 'premium' ? 40000 : 15000) * mult);
  const entertainment = Math.round((luxuryLevel === 'luxury' ? 120000 : luxuryLevel === 'premium' ? 60000 : 25000) * mult);
  const misc         = Math.round(rates.misc * guests * mult);
  const subtotal     = venue + food + decoration + photography + entertainment + misc;
  const gst          = Math.round(subtotal * 0.18);

  res.json({
    success: true,
    data: {
      breakdown: { venue, food, decoration, photography, entertainment, misc },
      subtotal, gst, total: subtotal + gst,
      perPerson: Math.round((subtotal + gst) / guests),
      currency: 'INR'
    }
  });
};
