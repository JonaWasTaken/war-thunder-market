import { Goal, Percent } from "lucide-react";
import {
  calculateRequiredSellForProfit,
  calculateRequiredSellForRoi,
  formatNumber,
  parseNumericInput,
} from "../lib/calculations";
import type { Settings } from "../types";
import { Panel, StatCard, TextInput } from "./ui";

export const TargetProfitCalculator = ({
  buyPrice,
  targetProfit,
  feePercent,
  setBuyPrice,
  setTargetProfit,
  settings,
}: {
  buyPrice: string;
  targetProfit: string;
  feePercent: string;
  setBuyPrice: (value: string) => void;
  setTargetProfit: (value: string) => void;
  settings: Settings;
}) => {
  const requiredSellPrice = calculateRequiredSellForProfit(
    parseNumericInput(buyPrice),
    parseNumericInput(targetProfit),
    parseNumericInput(feePercent),
  );

  return (
    <Panel title="Target Profit" eyebrow="Minimum resale">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-profit/20 bg-profit/10 text-profit">
        <Goal size={20} />
      </div>
      <div className="grid gap-4">
        <TextInput
          label="Buy price"
          min={0}
          step={0.01}
          type="number"
          value={buyPrice}
          suffix={settings.currencyLabel}
          onChange={setBuyPrice}
        />
        <TextInput
          label="Desired profit"
          step={0.01}
          type="number"
          value={targetProfit}
          suffix={settings.currencyLabel}
          onChange={setTargetProfit}
        />
        <StatCard
          label="Required sell price"
          value={`${formatNumber(requiredSellPrice, settings.decimals)} ${settings.currencyLabel}`}
          helper="(Buy price + profit) / seller rate"
          tone="profit"
        />
      </div>
    </Panel>
  );
};

export const TargetRoiCalculator = ({
  buyPrice,
  targetRoi,
  feePercent,
  setBuyPrice,
  setTargetRoi,
  settings,
}: {
  buyPrice: string;
  targetRoi: string;
  feePercent: string;
  setBuyPrice: (value: string) => void;
  setTargetRoi: (value: string) => void;
  settings: Settings;
}) => {
  const requiredSellPrice = calculateRequiredSellForRoi(
    parseNumericInput(buyPrice),
    parseNumericInput(targetRoi),
    parseNumericInput(feePercent),
  );

  return (
    <Panel title="Target ROI" eyebrow="Growth target">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-caution/20 bg-caution/10 text-caution">
        <Percent size={20} />
      </div>
      <div className="grid gap-4">
        <TextInput
          label="Buy price"
          min={0}
          step={0.01}
          type="number"
          value={buyPrice}
          suffix={settings.currencyLabel}
          onChange={setBuyPrice}
        />
        <TextInput
          label="Desired ROI"
          step={0.1}
          type="number"
          value={targetRoi}
          suffix="%"
          onChange={setTargetRoi}
        />
        <StatCard
          label="Required sell price"
          value={`${formatNumber(requiredSellPrice, settings.decimals)} ${settings.currencyLabel}`}
          helper="Buy price x (1 + ROI) / seller rate"
          tone="caution"
        />
      </div>
    </Panel>
  );
};
