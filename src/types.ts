export type CurrencyDecimals = 2 | 3;

export type RiskRating = "Low" | "Medium" | "High";

export type SortMode = "roi" | "profit" | "risk" | "buyPrice";

export type RatingValue = 1 | 2 | 3 | 4 | 5;

export interface Settings {
  defaultFeePercent: number;
  currencyLabel: string;
  decimals: CurrencyDecimals;
}

export interface FlipItem {
  id: string;
  itemName: string;
  buyPrice: number;
  expectedSellPrice: number;
  feePercent: number;
  riskRating: RiskRating;
  notes: string;
  demandRating: RatingValue;
  liquidityRating: RatingValue;
  volatilityRating: RatingValue;
}

export interface BasicCalculation {
  isValid: boolean;
  errors: string[];
  feeRate: number;
  sellerRate: number;
  netReceived: number | null;
  netProfit: number | null;
  roiPercent: number | null;
  breakEvenSellPrice: number | null;
}

export interface FlipScoreBreakdown {
  score: number;
  roiScore: number;
  profitScore: number;
  priceSafetyScore: number;
  demandScore: number;
  liquidityScore: number;
  volatilityScore: number;
}
