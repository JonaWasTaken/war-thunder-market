import type { FlipItem, RatingValue, RiskRating } from "../types";
import { createId } from "./calculations";

const csvHeaders = [
  "Item name",
  "Buy price",
  "Expected sell price",
  "Fee %",
  "Net profit",
  "ROI %",
  "Risk rating",
  "Demand",
  "Liquidity",
  "Volatility",
  "Notes",
];

const escapeCell = (value: string | number | null) => {
  const cellValue = value === null ? "" : String(value);
  if (/[",\n\r]/.test(cellValue)) {
    return `"${cellValue.replace(/"/g, '""')}"`;
  }

  return cellValue;
};

export const exportItemsToCsv = (
  rows: Array<{
    item: FlipItem;
    netProfit: number | null;
    roiPercent: number | null;
  }>,
) => {
  const csvRows = [
    csvHeaders.map(escapeCell).join(","),
    ...rows.map(({ item, netProfit, roiPercent }) =>
      [
        item.itemName,
        item.buyPrice,
        item.expectedSellPrice,
        item.feePercent,
        netProfit,
        roiPercent,
        item.riskRating,
        item.demandRating,
        item.liquidityRating,
        item.volatilityRating,
        item.notes,
      ]
        .map(escapeCell)
        .join(","),
    ),
  ];

  return csvRows.join("\n");
};

const parseCsvRows = (text: string) => {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }
      row.push(cell);
      if (row.some((value) => value.trim() !== "")) {
        rows.push(row);
      }
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  row.push(cell);
  if (row.some((value) => value.trim() !== "")) {
    rows.push(row);
  }

  return rows;
};

const toRiskRating = (value: string): RiskRating => {
  const normalizedValue = value.trim().toLowerCase();
  if (normalizedValue === "low") return "Low";
  if (normalizedValue === "high") return "High";
  return "Medium";
};

const toRating = (value: string, fallback: RatingValue): RatingValue => {
  const numericValue = Number(value);
  if (numericValue >= 1 && numericValue <= 5) {
    return Math.round(numericValue) as RatingValue;
  }

  return fallback;
};

export const importItemsFromCsv = (text: string, fallbackFeePercent: number) => {
  const rows = parseCsvRows(text);
  if (rows.length === 0) {
    return [];
  }

  const header = rows[0].map((cell) => cell.trim().toLowerCase());
  const dataRows = header.includes("item name") ? rows.slice(1) : rows;
  const indexOf = (name: string, fallbackIndex: number) => {
    const index = header.indexOf(name);
    return index >= 0 ? index : fallbackIndex;
  };

  return dataRows.flatMap((row): FlipItem[] => {
    const itemName = row[indexOf("item name", 0)]?.trim();
    const buyPrice = Number(row[indexOf("buy price", 1)]);
    const expectedSellPrice = Number(row[indexOf("expected sell price", 2)]);
    const feePercent = Number(row[indexOf("fee %", 3)]);

    if (!itemName || !Number.isFinite(buyPrice) || !Number.isFinite(expectedSellPrice)) {
      return [];
    }

    return [
      {
        id: createId(),
        itemName,
        buyPrice: Math.max(0, buyPrice),
        expectedSellPrice: Math.max(0, expectedSellPrice),
        feePercent:
          Number.isFinite(feePercent) && feePercent >= 0 && feePercent < 100
            ? feePercent
            : fallbackFeePercent,
        riskRating: toRiskRating(row[indexOf("risk rating", 6)] ?? "Medium"),
        demandRating: toRating(row[indexOf("demand", 7)] ?? "", 3),
        liquidityRating: toRating(row[indexOf("liquidity", 8)] ?? "", 3),
        volatilityRating: toRating(row[indexOf("volatility", 9)] ?? "", 3),
        notes: row[indexOf("notes", 10)] ?? "",
      },
    ];
  });
};

export const downloadCsv = (filename: string, csvText: string) => {
  const blob = new Blob([csvText], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};
