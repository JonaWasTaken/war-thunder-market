import type { BasicCalculation, FlipScoreBreakdown, RatingValue } from "../types";

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const parseNumericInput = (value: string): number | null => {
  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return null;
  }

  const numericValue = Number(trimmedValue.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(numericValue) ? numericValue : null;
};

export const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const sanitizeFeePercent = (feePercent: number) =>
  Number.isFinite(feePercent) ? feePercent : 20;

export const calculateFlip = (
  buyPrice: number | null,
  sellPrice: number | null,
  feePercent: number | null,
): BasicCalculation => {
  const errors: string[] = [];
  const safeFeePercent = feePercent ?? NaN;
  const feeRate = safeFeePercent / 100;
  const sellerRate = 1 - feeRate;
  const hasValidBuyPrice = buyPrice !== null && buyPrice >= 0;
  const hasValidSellPrice = sellPrice !== null && sellPrice >= 0;
  const hasValidFee = feePercent !== null && feePercent >= 0 && feePercent < 100;
  const validBuyPrice = hasValidBuyPrice ? buyPrice : null;
  const validSellPrice = hasValidSellPrice ? sellPrice : null;

  if (buyPrice === null) {
    errors.push("Buy price is required.");
  } else if (buyPrice < 0) {
    errors.push("Buy price cannot be negative.");
  }

  if (sellPrice === null) {
    errors.push("Sell price is required.");
  } else if (sellPrice < 0) {
    errors.push("Sell price cannot be negative.");
  }

  if (feePercent === null) {
    errors.push("Fee percentage is required.");
  } else if (feePercent < 0) {
    errors.push("Fee percentage cannot be negative.");
  } else if (feePercent >= 100) {
    errors.push("Fee must be below 100%.");
  }

  const normalizedFeeRate = hasValidFee ? feeRate : 0;
  const normalizedSellerRate = hasValidFee ? sellerRate : 0;
  // Seller receives the sale amount minus the market fee. This can be calculated
  // as soon as sell price and fee are valid, even if buy price is still missing.
  const netReceived =
    validSellPrice !== null && hasValidFee ? validSellPrice * normalizedSellerRate : null;
  // Net profit needs both sides of the trade.
  const netProfit = netReceived !== null && validBuyPrice !== null ? netReceived - validBuyPrice : null;
  // ROI is undefined for a zero buy price because there is no investment base.
  const roiPercent = netProfit !== null && validBuyPrice !== null && validBuyPrice > 0
    ? (netProfit / validBuyPrice) * 100
    : null;
  // Break-even is the sell price where received amount equals buy cost.
  const breakEvenSellPrice =
    validBuyPrice !== null && hasValidFee && normalizedSellerRate > 0
      ? validBuyPrice / normalizedSellerRate
      : null;

  return {
    isValid: errors.length === 0,
    errors,
    feeRate: normalizedFeeRate,
    sellerRate: normalizedSellerRate,
    netReceived,
    netProfit,
    roiPercent,
    breakEvenSellPrice,
  };
};

export const calculateRequiredSellForProfit = (
  buyPrice: number | null,
  targetProfit: number | null,
  feePercent: number | null,
) => {
  if (
    buyPrice === null ||
    targetProfit === null ||
    feePercent === null ||
    buyPrice < 0 ||
    feePercent < 0 ||
    feePercent >= 100
  ) {
    return null;
  }

  const sellerRate = 1 - feePercent / 100;
  // Required sell = (original cost + desired profit) / seller rate after fee.
  return (buyPrice + targetProfit) / sellerRate;
};

export const calculateRequiredSellForRoi = (
  buyPrice: number | null,
  targetRoiPercent: number | null,
  feePercent: number | null,
) => {
  if (
    buyPrice === null ||
    targetRoiPercent === null ||
    feePercent === null ||
    buyPrice < 0 ||
    feePercent < 0 ||
    feePercent >= 100
  ) {
    return null;
  }

  const sellerRate = 1 - feePercent / 100;
  // Required sell = buy price * desired growth / seller rate after fee.
  return (buyPrice * (1 + targetRoiPercent / 100)) / sellerRate;
};

export const calculateFlipScore = ({
  roiPercent,
  netProfit,
  buyPrice,
  demandRating,
  liquidityRating,
  volatilityRating,
}: {
  roiPercent: number | null;
  netProfit: number | null;
  buyPrice: number;
  demandRating: RatingValue;
  liquidityRating: RatingValue;
  volatilityRating: RatingValue;
}): FlipScoreBreakdown => {
  const safeProfit = netProfit ?? 0;
  const safeRoi = roiPercent ?? -100;

  const roiScore = clamp(safeRoi / 40, 0, 1) * 30;
  const profitTarget = Math.max(2, buyPrice * 0.15);
  const profitScore = clamp(safeProfit / profitTarget, 0, 1) * 20;
  const priceSafetyScore = (1 - clamp(buyPrice / 150, 0, 1)) * 15;
  const demandScore = ((demandRating - 1) / 4) * 15;
  const liquidityScore = ((liquidityRating - 1) / 4) * 15;
  const volatilityScore = (1 - (volatilityRating - 1) / 4) * 10;

  return {
    score: Math.round(
      roiScore +
        profitScore +
        priceSafetyScore +
        demandScore +
        liquidityScore +
        volatilityScore,
    ),
    roiScore,
    profitScore,
    priceSafetyScore,
    demandScore,
    liquidityScore,
    volatilityScore,
  };
};

export const getProfitTone = (profit: number | null, buyPrice: number | null) => {
  if (profit === null) {
    return "neutral";
  }

  const nearBreakEvenWindow = Math.max(0.01, Math.abs(buyPrice ?? 0) * 0.01);
  if (Math.abs(profit) <= nearBreakEvenWindow) {
    return "caution";
  }

  return profit > 0 ? "profit" : "loss";
};

export const buildSmartWarnings = ({
  calculation,
  buyPrice,
  sellPrice,
  feePercent,
}: {
  calculation: BasicCalculation;
  buyPrice: number | null;
  sellPrice: number | null;
  feePercent: number | null;
}) => {
  const warnings: string[] = [];

  if (feePercent !== null && feePercent >= 0 && feePercent < 100) {
    warnings.push(
      `You only receive ${(100 - feePercent).toFixed(0)}% of the sell price after the ${feePercent}% fee.`,
    );
  }

  if (calculation.netProfit !== null && calculation.netProfit < 0) {
    warnings.push(`This flip loses money after the ${feePercent ?? "selected"}% market fee.`);
  }

  if (
    calculation.netProfit !== null &&
    calculation.roiPercent !== null &&
    calculation.netProfit > 0 &&
    calculation.roiPercent < 5
  ) {
    warnings.push("Low ROI: one price drop could erase the profit.");
  }

  if (
    buyPrice !== null &&
    calculation.breakEvenSellPrice !== null &&
    calculation.breakEvenSellPrice > buyPrice * 1.35
  ) {
    warnings.push("This needs a very high resale price to be worth it.");
  }

  if (buyPrice !== null && buyPrice >= 100) {
    warnings.push("High buy price = higher risk and more capital locked in one item.");
  }

  if (
    calculation.netProfit !== null &&
    sellPrice !== null &&
    calculation.netProfit > 0 &&
    sellPrice > 0 &&
    Math.abs(calculation.netProfit) / sellPrice < 0.03
  ) {
    warnings.push("Extremely small margin: fee rounding or a tiny undercut may wipe it out.");
  }

  warnings.push("Always check real market history before buying.");

  return warnings;
};

export const formatNumber = (value: number | null, decimals: 2 | 3) => {
  if (value === null || !Number.isFinite(value)) {
    return "N/A";
  }

  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const formatPercent = (value: number | null, decimals = 2) => {
  if (value === null || !Number.isFinite(value)) {
    return "N/A";
  }

  return `${value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}%`;
};
