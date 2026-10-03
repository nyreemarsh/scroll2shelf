export interface Retailer {
  id: string;
  name: string;
  market?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  image?: string;
}

export interface ShopperPersona {
  id: string;
  name: string;
  description?: string;
  budget: number;
  noveltySeeking: number;
  indulgence: number;
  priceSensitivity: number;
  trendAffinity: number;
  premiumPreference: number;
}

export interface Trend {
  id: string;
  name: string;
  description: string;
  velocity?: number;
  views?: number;
  sentiment?: number;
  retailRelevance?: string;
}

/** A figure that can be counted up on reveal, e.g. +£1.20 or +5.4%. */
export interface StatValue {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

/** Short supporting figure shown as value over caption. */
export interface Metric {
  id: string;
  value: string;
  label: string;
}

export interface MomentumPoint {
  day: string;
  value: number;
}

/** One step of the behavioural journey a trend implies. */
export interface MissionStage {
  id: string;
  label: string;
  caption: string;
  highlight?: boolean;
}

export interface DetectedTrend extends Trend {
  summary: string;
  momentum: MomentumPoint[];
  mission: MissionStage[];
}

export interface Finding {
  id: string;
  label: string;
  headline: string;
  /** Substring of the headline to visually emphasise. */
  emphasis?: string;
  stat: StatValue;
  statCaption: string;
  reasons: string[];
  metrics: Metric[];
  product: Product;
  cta: string;
}

export interface BasketItem {
  id: string;
  course: string;
  product: Product;
  highlight?: boolean;
}

export interface PredictedBasket {
  items: BasketItem[];
  basis: string;
}

export type LikelihoodEmphasis = "highlight" | "primary" | "secondary" | "muted";

export interface ProductLikelihood {
  id: string;
  name: string;
  /** Shorter label used on the chart axis. */
  chartLabel: string;
  probability: number;
  emphasis: LikelihoodEmphasis;
}

export interface Opportunity {
  id: string;
  title: string;
  label?: string;
  description?: string;
  metric: StatValue;
  metricCaption: string;
  cta?: string;
  featured?: boolean;
}

export interface ModelContribution {
  id: string;
  label: string;
  weight: number;
}

export interface SimulationShopper {
  id: string;
  slot: string;
  persona: ShopperPersona;
}

export interface SimulationMove {
  shopperId: string;
  gesture: string;
  glyph: string;
}

export interface SimulationRound {
  id: string;
  label: string;
  course: string;
  moves: SimulationMove[];
  winnerId: string;
  outcome: string;
  probability: number;
}

export interface SimulationPreview {
  shoppers: SimulationShopper[];
  round: SimulationRound;
  cta: string;
}

export type SignalIcon =
  | "social"
  | "catalogue"
  | "research"
  | "mission"
  | "simulation";

export interface DataSignal {
  id: string;
  label: string;
  icon: SignalIcon;
}

export interface TimeRange {
  id: string;
  label: string;
}
