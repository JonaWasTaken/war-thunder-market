import { ChangeEvent, useMemo, useRef, useState } from "react";
import {
  ArrowDownAZ,
  Download,
  Plus,
  RotateCcw,
  Trash2,
  Upload,
} from "lucide-react";
import {
  calculateFlip,
  calculateFlipScore,
  createId,
  formatNumber,
  formatPercent,
} from "../lib/calculations";
import { downloadCsv, exportItemsToCsv, importItemsFromCsv } from "../lib/csv";
import { createExampleItems } from "../data/exampleItems";
import type { FlipItem, RatingValue, RiskRating, Settings, SortMode } from "../types";
import { Badge, Panel, SelectInput, TextInput } from "./ui";

const riskRank: Record<RiskRating, number> = {
  Low: 1,
  Medium: 2,
  High: 3,
};

const riskTone = (riskRating: RiskRating) => riskRating.toLowerCase() as "low" | "medium" | "high";

const createBlankDraft = (defaultFeePercent: number) => ({
  itemName: "",
  buyPrice: "",
  expectedSellPrice: "",
  feePercent: String(defaultFeePercent),
  riskRating: "Medium" as RiskRating,
  demandRating: 3 as RatingValue,
  liquidityRating: 3 as RatingValue,
  volatilityRating: 3 as RatingValue,
  notes: "",
});

export const FlipComparisonTable = ({
  items,
  settings,
  sortMode,
  setSortMode,
  setItems,
}: {
  items: FlipItem[];
  settings: Settings;
  sortMode: SortMode;
  setSortMode: (mode: SortMode) => void;
  setItems: (items: FlipItem[]) => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [draft, setDraft] = useState(() => createBlankDraft(settings.defaultFeePercent));
  const [formError, setFormError] = useState("");

  const enrichedItems = useMemo(() => {
    const rows = items.map((item) => {
      const calculation = calculateFlip(item.buyPrice, item.expectedSellPrice, item.feePercent);
      const score = calculateFlipScore({
        roiPercent: calculation.roiPercent,
        netProfit: calculation.netProfit,
        buyPrice: item.buyPrice,
        demandRating: item.demandRating,
        liquidityRating: item.liquidityRating,
        volatilityRating: item.volatilityRating,
      });

      return { item, calculation, score };
    });

    return [...rows].sort((a, b) => {
      if (sortMode === "roi") {
        return (b.calculation.roiPercent ?? -Infinity) - (a.calculation.roiPercent ?? -Infinity);
      }
      if (sortMode === "profit") {
        return (b.calculation.netProfit ?? -Infinity) - (a.calculation.netProfit ?? -Infinity);
      }
      if (sortMode === "risk") {
        return riskRank[a.item.riskRating] - riskRank[b.item.riskRating];
      }
      return a.item.buyPrice - b.item.buyPrice;
    });
  }, [items, sortMode]);

  const addItem = () => {
    const buyPrice = Number(draft.buyPrice);
    const expectedSellPrice = Number(draft.expectedSellPrice);
    const feePercent = Number(draft.feePercent);

    if (!draft.itemName.trim()) {
      setFormError("Add an item name.");
      return;
    }
    if (!Number.isFinite(buyPrice) || buyPrice < 0) {
      setFormError("Buy price must be zero or higher.");
      return;
    }
    if (!Number.isFinite(expectedSellPrice) || expectedSellPrice < 0) {
      setFormError("Expected sell price must be zero or higher.");
      return;
    }
    if (!Number.isFinite(feePercent) || feePercent < 0 || feePercent >= 100) {
      setFormError("Fee must be between 0% and below 100%.");
      return;
    }

    setItems([
      ...items,
      {
        id: createId(),
        itemName: draft.itemName.trim(),
        buyPrice,
        expectedSellPrice,
        feePercent,
        riskRating: draft.riskRating,
        demandRating: draft.demandRating,
        liquidityRating: draft.liquidityRating,
        volatilityRating: draft.volatilityRating,
        notes: draft.notes.trim(),
      },
    ]);
    setDraft(createBlankDraft(settings.defaultFeePercent));
    setFormError("");
  };

  const deleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const exportCsv = () => {
    const csv = exportItemsToCsv(
      enrichedItems.map(({ item, calculation }) => ({
        item,
        netProfit: calculation.netProfit,
        roiPercent: calculation.roiPercent,
      })),
    );
    downloadCsv("gaijin-flip-comparison.csv", csv);
  };

  const importCsv = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const importedItems = importItemsFromCsv(String(reader.result ?? ""), settings.defaultFeePercent);
      if (importedItems.length === 0) {
        setFormError("No valid CSV rows were found.");
        return;
      }
      setItems([...items, ...importedItems]);
      setFormError("");
      event.target.value = "";
    };
    reader.readAsText(file);
  };

  const amount = (value: number | null) =>
    `${formatNumber(value, settings.decimals)} ${settings.currencyLabel}`;

  return (
    <Panel
      title="Flip Comparison Table"
      eyebrow="Manual watchlist"
      className="mt-6"
      action={
        <div className="flex flex-wrap justify-end gap-2">
          <button className="ghost-button" type="button" onClick={() => setItems(createExampleItems())}>
            <RotateCcw size={16} />
            Examples
          </button>
          <button className="ghost-button" type="button" onClick={exportCsv} disabled={items.length === 0}>
            <Download size={16} />
            CSV
          </button>
          <button className="ghost-button" type="button" onClick={() => fileInputRef.current?.click()}>
            <Upload size={16} />
            Import
          </button>
          <input
            ref={fileInputRef}
            className="hidden"
            type="file"
            accept=".csv,text/csv"
            onChange={importCsv}
          />
          <button className="danger-button" type="button" onClick={() => setItems([])} disabled={items.length === 0}>
            <Trash2 size={16} />
            Clear
          </button>
        </div>
      }
    >
      <div className="mb-5 rounded-lg border border-amber/20 bg-amber/10 p-4 text-sm text-amber">
        Example rows are fake presets for learning the math. They are not real market advice.
      </div>

      <div className="grid gap-3 rounded-xl border border-white/8 bg-black/10 p-4 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <TextInput
            label="Item name"
            value={draft.itemName}
            placeholder="Example coupon"
            testId="draft-item-name"
            onChange={(itemName) => setDraft({ ...draft, itemName })}
          />
        </div>
        <div className="lg:col-span-2">
          <TextInput
            label="Buy"
            type="number"
            min={0}
            step={0.01}
            suffix={settings.currencyLabel}
            value={draft.buyPrice}
            testId="draft-buy-price"
            onChange={(buyPrice) => setDraft({ ...draft, buyPrice })}
          />
        </div>
        <div className="lg:col-span-2">
          <TextInput
            label="Expected sell"
            type="number"
            min={0}
            step={0.01}
            suffix={settings.currencyLabel}
            value={draft.expectedSellPrice}
            testId="draft-expected-sell-price"
            onChange={(expectedSellPrice) => setDraft({ ...draft, expectedSellPrice })}
          />
        </div>
        <div className="lg:col-span-1">
          <TextInput
            label="Fee"
            type="number"
            min={0}
            step={0.1}
            suffix="%"
            value={draft.feePercent}
            testId="draft-fee-percent"
            onChange={(feePercent) => setDraft({ ...draft, feePercent })}
          />
        </div>
        <div className="lg:col-span-2">
          <SelectInput
            label="Risk"
            value={draft.riskRating}
            testId="draft-risk-rating"
            onChange={(riskRating) => setDraft({ ...draft, riskRating: riskRating as RiskRating })}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </SelectInput>
        </div>
        <div className="lg:col-span-2">
          <TextInput
            label="Notes"
            value={draft.notes}
            placeholder="History, spread, timing"
            onChange={(notes) => setDraft({ ...draft, notes })}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-3 lg:col-span-9">
          <SelectInput
            label="Demand"
            value={String(draft.demandRating)}
            onChange={(demandRating) =>
              setDraft({ ...draft, demandRating: Number(demandRating) as RatingValue })
            }
          >
            <option value="1">1 weak</option>
            <option value="2">2 low</option>
            <option value="3">3 average</option>
            <option value="4">4 strong</option>
            <option value="5">5 very strong</option>
          </SelectInput>
          <SelectInput
            label="Liquidity"
            value={String(draft.liquidityRating)}
            onChange={(liquidityRating) =>
              setDraft({ ...draft, liquidityRating: Number(liquidityRating) as RatingValue })
            }
          >
            <option value="1">1 slow</option>
            <option value="2">2 thin</option>
            <option value="3">3 average</option>
            <option value="4">4 active</option>
            <option value="5">5 fast</option>
          </SelectInput>
          <SelectInput
            label="Volatility"
            value={String(draft.volatilityRating)}
            onChange={(volatilityRating) =>
              setDraft({ ...draft, volatilityRating: Number(volatilityRating) as RatingValue })
            }
          >
            <option value="1">1 stable</option>
            <option value="2">2 mild</option>
            <option value="3">3 normal</option>
            <option value="4">4 swingy</option>
            <option value="5">5 wild</option>
          </SelectInput>
        </div>
        <div className="flex items-end lg:col-span-3">
          <button className="primary-button w-full" type="button" onClick={addItem}>
            <Plus size={18} />
            Add item
          </button>
        </div>
      </div>

      {formError && (
        <div className="mt-3 rounded-lg border border-loss/25 bg-loss/10 px-4 py-3 text-sm text-loss">
          {formError}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-steel">
          <ArrowDownAZ size={17} />
          Sort by
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            ["roi", "Best ROI"],
            ["profit", "Best profit"],
            ["risk", "Lowest risk"],
            ["buyPrice", "Cheapest buy"],
          ].map(([mode, label]) => (
            <button
              key={mode}
              className={sortMode === mode ? "tab-button-active" : "tab-button"}
              type="button"
              onClick={() => setSortMode(mode as SortMode)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-[980px] w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-[0.16em] text-steel">
              <th className="py-3 pr-4">Item</th>
              <th className="py-3 pr-4">Buy</th>
              <th className="py-3 pr-4">Expected sell</th>
              <th className="py-3 pr-4">Fee</th>
              <th className="py-3 pr-4">Net profit</th>
              <th className="py-3 pr-4">ROI</th>
              <th className="py-3 pr-4">Risk</th>
              <th className="py-3 pr-4">Score</th>
              <th className="py-3 pr-4">Notes</th>
              <th className="py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {enrichedItems.map(({ item, calculation, score }) => {
              const profitTone =
                (calculation.netProfit ?? 0) > 0
                  ? "profit"
                  : (calculation.netProfit ?? 0) < 0
                    ? "loss"
                    : "caution";

              return (
                <tr key={item.id} className="border-b border-white/[0.06] text-slate-200">
                  <td className="py-4 pr-4 font-semibold text-white">{item.itemName}</td>
                  <td className="py-4 pr-4">{amount(item.buyPrice)}</td>
                  <td className="py-4 pr-4">{amount(item.expectedSellPrice)}</td>
                  <td className="py-4 pr-4">{formatPercent(item.feePercent, 1)}</td>
                  <td className={`py-4 pr-4 font-semibold ${profitTone === "profit" ? "text-profit" : profitTone === "loss" ? "text-loss" : "text-caution"}`}>
                    {amount(calculation.netProfit)}
                  </td>
                  <td className={`py-4 pr-4 font-semibold ${profitTone === "profit" ? "text-profit" : profitTone === "loss" ? "text-loss" : "text-caution"}`}>
                    {formatPercent(calculation.roiPercent)}
                  </td>
                  <td className="py-4 pr-4">
                    <Badge tone={riskTone(item.riskRating)}>{item.riskRating}</Badge>
                  </td>
                  <td className="py-4 pr-4">
                    <Badge tone={score.score >= 70 ? "profit" : score.score >= 45 ? "caution" : "loss"}>
                      {score.score}/100
                    </Badge>
                  </td>
                  <td className="max-w-[250px] py-4 pr-4 text-steel">{item.notes || "No notes"}</td>
                  <td className="py-4 text-right">
                    <button
                      className="icon-button text-loss"
                      type="button"
                      aria-label={`Delete ${item.itemName}`}
                      onClick={() => deleteItem(item.id)}
                    >
                      <Trash2 size={17} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {enrichedItems.length === 0 && (
              <tr>
                <td colSpan={10} className="py-10 text-center text-steel">
                  No saved items yet. Add one manually or reload the fake examples.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
};
