import { Calculator, TrendingDown, TrendingUp } from "lucide-react";
import {
  buildSmartWarnings,
  calculateFlip,
  formatNumber,
  formatPercent,
  getProfitTone,
  parseNumericInput,
} from "../lib/calculations";
import type { Settings } from "../types";
import { Badge, Panel, StatCard, TextInput } from "./ui";

export const BasicCalculator = ({
  buyPrice,
  sellPrice,
  feePercent,
  setBuyPrice,
  setSellPrice,
  setFeePercent,
  settings,
}: {
  buyPrice: string;
  sellPrice: string;
  feePercent: string;
  setBuyPrice: (value: string) => void;
  setSellPrice: (value: string) => void;
  setFeePercent: (value: string) => void;
  settings: Settings;
}) => {
  const parsedBuyPrice = parseNumericInput(buyPrice);
  const parsedSellPrice = parseNumericInput(sellPrice);
  const parsedFeePercent = parseNumericInput(feePercent);
  const calculation = calculateFlip(parsedBuyPrice, parsedSellPrice, parsedFeePercent);
  const tone = getProfitTone(calculation.netProfit, parsedBuyPrice);
  const statusLabel =
    tone === "neutral"
      ? "Enter values"
      : tone === "profit"
        ? "Profitable"
        : tone === "loss"
          ? "Loss"
          : "Near break-even";
  const warnings = buildSmartWarnings({
    calculation,
    buyPrice: parsedBuyPrice,
    sellPrice: parsedSellPrice,
    feePercent: parsedFeePercent,
  });

  const amount = (value: number | null) =>
    `${formatNumber(value, settings.decimals)} ${settings.currencyLabel}`;

  return (
    <Panel
      title="Basic Calculator"
      eyebrow="Fee-adjusted flip math"
      className="lg:col-span-8"
      action={
        <Badge tone={tone === "profit" ? "profit" : tone === "loss" ? "loss" : "caution"}>
          {statusLabel}
        </Badge>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        <TextInput
          label="Buy price"
          min={0}
          step={0.01}
          type="number"
          value={buyPrice}
          suffix={settings.currencyLabel}
          testId="basic-buy-price"
          onChange={setBuyPrice}
          error={parsedBuyPrice !== null && parsedBuyPrice < 0 ? "Use zero or higher." : undefined}
        />
        <TextInput
          label="Sell price"
          min={0}
          step={0.01}
          type="number"
          value={sellPrice}
          suffix={settings.currencyLabel}
          testId="basic-sell-price"
          onChange={setSellPrice}
          error={parsedSellPrice !== null && parsedSellPrice < 0 ? "Use zero or higher." : undefined}
        />
        <TextInput
          label="Fee"
          min={0}
          step={0.1}
          type="number"
          value={feePercent}
          suffix="%"
          testId="basic-fee-percent"
          onChange={setFeePercent}
          error={
            parsedFeePercent !== null && parsedFeePercent >= 100
              ? "Fee must stay below 100%."
              : undefined
          }
        />
      </div>

      {calculation.errors.length > 0 && (
        <div className="mt-4 rounded-lg border border-loss/25 bg-loss/10 px-4 py-3 text-sm text-loss">
          {calculation.errors.join(" ")}
        </div>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Net received"
          value={amount(calculation.netReceived)}
          helper={`Seller rate: ${formatPercent(
            calculation.sellerRate * 100,
            0,
          )}`}
        />
        <StatCard
          label="Profit / loss"
          value={amount(calculation.netProfit)}
          tone={tone}
          helper="Received minus buy price"
        />
        <StatCard
          label="ROI"
          value={formatPercent(calculation.roiPercent)}
          tone={tone}
          helper={parsedBuyPrice === 0 ? "Undefined when buy price is 0" : "Profit divided by buy price"}
        />
        <StatCard
          label="Break-even sell"
          value={amount(calculation.breakEvenSellPrice)}
          helper="Buy price divided by seller rate"
        />
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-[1fr_1.2fr]">
        <div className="rounded-lg border border-amber/20 bg-amber/10 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber">
            <Calculator size={18} />
            Formula check
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Seller receives <strong>sell price x (1 - fee)</strong>, rounded down to the
            displayed cents. With a 15% fee, <strong>5.30</strong> pays about{" "}
            <strong>4.50</strong>.
          </p>
        </div>
        <div className="rounded-lg border border-white/8 bg-white/[0.035] p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
            {tone === "loss" ? <TrendingDown size={18} /> : <TrendingUp size={18} />}
            Smart warnings
          </div>
          <ul className="space-y-2 text-sm text-slate-300">
            {warnings.map((warning) => (
              <li key={warning} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber" />
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Panel>
  );
};
