import type { FlipItem } from "../types";
import { createId } from "../lib/calculations";

export const createExampleItems = (): FlipItem[] => [
  {
    id: createId(),
    itemName: "Example Event Coupon A",
    buyPrice: 42.5,
    expectedSellPrice: 62,
    feePercent: 20,
    riskRating: "Medium",
    demandRating: 4,
    liquidityRating: 3,
    volatilityRating: 3,
    notes: "Fake row for learning the calculator, not market advice.",
  },
  {
    id: createId(),
    itemName: "Example Camo Crate B",
    buyPrice: 7.2,
    expectedSellPrice: 9.4,
    feePercent: 20,
    riskRating: "Low",
    demandRating: 3,
    liquidityRating: 4,
    volatilityRating: 2,
    notes: "Small margin example; check fee impact.",
  },
  {
    id: createId(),
    itemName: "Example Rare Vehicle C",
    buyPrice: 135,
    expectedSellPrice: 182,
    feePercent: 20,
    riskRating: "High",
    demandRating: 4,
    liquidityRating: 2,
    volatilityRating: 4,
    notes: "Shows high capital risk and slower liquidity.",
  },
];
