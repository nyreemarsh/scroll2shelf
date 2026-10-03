import type {
  DataSignal,
  DetectedTrend,
  Finding,
  ModelContribution,
  Opportunity,
  PredictedBasket,
  Product,
  ProductLikelihood,
  Retailer,
  ShopperPersona,
  SimulationPreview,
  TimeRange,
} from "@/lib/types";

export const retailer: Retailer = {
  id: "marks-and-spencer",
  name: "M&S",
  market: "UK Food",
};

export const timeRanges: TimeRange[] = [
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
  { id: "90d", label: "Last 90 days" },
];

export const dataFreshness = "Updated 12 minutes ago";

export const products: Product[] = [
  {
    id: "burrata-tomatoes",
    name: "Burrata & Tomatoes",
    category: "Starter",
    price: 5.5,
    description: "Creamy burrata with heritage tomatoes and basil oil.",
  },
  {
    id: "steak-peppercorn",
    name: "Steak & Peppercorn Sauce",
    category: "Main",
    price: 12.0,
    description: "Two sirloin steaks with a peppercorn sauce.",
  },
  {
    id: "tiramisu",
    name: "Tiramisu",
    category: "Dessert",
    price: 4.75,
    description: "Coffee-soaked sponge layered with mascarpone cream.",
  },
  {
    id: "prosecco",
    name: "Prosecco",
    category: "Drink",
    price: 8.0,
    description: "Dry sparkling wine, chilled.",
  },
  {
    id: "chocolate-truffles",
    name: "Chocolate Truffles",
    category: "Wildcard",
    price: 3.5,
    description: "Dark chocolate truffles, shareable box.",
  },
];

const productById = (id: string): Product => {
  const match = products.find((product) => product.id === id);
  if (!match) throw new Error(`Unknown product: ${id}`);
  return match;
};

export const detectedTrend: DetectedTrend = {
  id: "rps-date-night",
  name: "Rock Paper Scissors Date Night",
  description:
    "Couples use Rock Paper Scissors to decide who chooses each course of a date-night meal.",
  summary:
    "Couples are turning grocery shopping into a game, using Rock Paper Scissors to decide who chooses each course of a date-night meal.",
  velocity: 224,
  views: 1_800_000,
  sentiment: 83,
  retailRelevance: "High",
  momentum: [
    { day: "Mon", value: 22 },
    { day: "Tue", value: 29 },
    { day: "Wed", value: 38 },
    { day: "Thu", value: 47 },
    { day: "Fri", value: 68 },
    { day: "Sat", value: 86 },
    { day: "Sun", value: 100 },
  ],
  mission: [
    { id: "starter", label: "Starter", caption: "Shared opener" },
    { id: "main", label: "Main", caption: "Highest spend" },
    { id: "dessert", label: "Dessert", caption: "Indulgence peak", highlight: true },
    { id: "drink", label: "Drink", caption: "Premium swing" },
    { id: "wildcard", label: "Wildcard", caption: "Impulse treat" },
  ],
};

export const latestFinding: Finding = {
  id: "tiramisu-dessert-opportunity",
  label: "Latest finding",
  headline:
    "Tiramisu is emerging as the strongest dessert opportunity for Date Night shoppers.",
  emphasis: "Tiramisu",
  stat: { value: 18, prefix: "+", suffix: "%" },
  statCaption: "predicted selection likelihood vs. category baseline",
  reasons: [
    "High indulgence match",
    "Strong social visibility",
    "High couple-sharing affinity",
  ],
  metrics: [
    { id: "selection", value: "31%", label: "predicted selection" },
    { id: "price", value: "£4.75", label: "average price" },
    { id: "attach", value: "74%", label: "dessert attach rate" },
  ],
  product: productById("tiramisu"),
  cta: "Explore finding",
};

export const predictedBasket: PredictedBasket = {
  items: [
    { id: "starter", course: "Starter", product: productById("burrata-tomatoes") },
    { id: "main", course: "Main", product: productById("steak-peppercorn") },
    {
      id: "dessert",
      course: "Dessert",
      product: productById("tiramisu"),
      highlight: true,
    },
    { id: "drink", course: "Drink", product: productById("prosecco") },
    {
      id: "wildcard",
      course: "Wildcard",
      product: productById("chocolate-truffles"),
    },
  ],
  basis: "Generated from 10,000 simulated shopping journeys",
};

export const productLikelihoods: ProductLikelihood[] = [
  {
    id: "tiramisu",
    name: "Tiramisu",
    chartLabel: "Tiramisu",
    probability: 31,
    emphasis: "highlight",
  },
  {
    id: "chocolate-melt",
    name: "Chocolate Melt-in-the-Middle Pudding",
    chartLabel: "Chocolate Melt-in-the-Middle Pudding",
    probability: 24,
    emphasis: "primary",
  },
  {
    id: "cheesecake",
    name: "Cheesecake",
    chartLabel: "Cheesecake",
    probability: 19,
    emphasis: "secondary",
  },
  {
    id: "profiteroles",
    name: "Profiteroles",
    chartLabel: "Profiteroles",
    probability: 14,
    emphasis: "primary",
  },
  {
    id: "other",
    name: "Other",
    chartLabel: "Other",
    probability: 12,
    emphasis: "muted",
  },
];

const trendLedFoodie: ShopperPersona = {
  id: "shopper-a",
  name: "Trend-Led Foodie",
  description: "Follows social food culture and trades up for novelty.",
  budget: 40,
  noveltySeeking: 0.82,
  indulgence: 0.74,
  priceSensitivity: 0.31,
  trendAffinity: 0.91,
  premiumPreference: 0.68,
};

const comfortFoodLover: ShopperPersona = {
  id: "shopper-b",
  name: "Comfort Food Lover",
  description: "Chooses familiar favourites and shares generous portions.",
  budget: 32,
  noveltySeeking: 0.38,
  indulgence: 0.86,
  priceSensitivity: 0.54,
  trendAffinity: 0.42,
  premiumPreference: 0.45,
};

export const shopperPersonas: ShopperPersona[] = [trendLedFoodie, comfortFoodLover];

export const simulationPreview: SimulationPreview = {
  shoppers: [
    { id: "shopper-a", slot: "Shopper A", persona: trendLedFoodie },
    { id: "shopper-b", slot: "Shopper B", persona: comfortFoodLover },
  ],
  round: {
    id: "round-01",
    label: "Round 01",
    course: "Starter",
    moves: [
      { shopperId: "shopper-a", gesture: "Rock", glyph: "✊" },
      { shopperId: "shopper-b", gesture: "Scissors", glyph: "✌️" },
    ],
    winnerId: "shopper-a",
    outcome: "Burrata selected",
    probability: 31,
  },
  cta: "Run shopping simulation",
};

export const retailerOpportunities: Opportunity[] = [
  {
    id: "wildcard-round",
    label: "High impact",
    title: "Add a wildcard round",
    description:
      "Introduce a final treat selection to extend the social shopping mission beyond the core meal.",
    metric: { value: 5.4, prefix: "+", suffix: "%", decimals: 1 },
    metricCaption: "simulated basket uplift",
    cta: "View simulation",
    featured: true,
  },
  {
    id: "tiramisu-merchandising",
    title: "Feature tiramisu in Date Night merchandising",
    metric: { value: 9, prefix: "+", suffix: "pp" },
    metricCaption: "predicted dessert attachment",
  },
  {
    id: "premium-drinks-pairing",
    title: "Pair premium drinks with main-course selection",
    metric: { value: 1.2, prefix: "+£", decimals: 2 },
    metricCaption: "modelled basket value",
  },
];

export const modelContributions: ModelContribution[] = [
  { id: "trend-affinity", label: "Trend affinity", weight: 0.31 },
  { id: "indulgence-match", label: "Indulgence match", weight: 0.24 },
  { id: "couple-sharing", label: "Couple-sharing", weight: 0.18 },
  { id: "price-compatibility", label: "Price compatibility", weight: 0.12 },
  { id: "date-night-context", label: "Date-night context", weight: 0.08 },
];

export const modelNote =
  "Scroll2Shelf combines social signals, shopper behaviour, retailer catalogue information and probabilistic basket simulations.";

export const dataSignals: DataSignal[] = [
  { id: "social", label: "Social trend data", icon: "social" },
  { id: "catalogue", label: "M&S product catalogue", icon: "catalogue" },
  { id: "research", label: "Consumer behaviour research", icon: "research" },
  { id: "mission", label: "Shopping mission model", icon: "mission" },
  { id: "journeys", label: "10,000 simulated journeys", icon: "simulation" },
];
