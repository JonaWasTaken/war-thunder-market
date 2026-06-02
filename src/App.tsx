import { useEffect, useState } from "react";
import { BarChart3, ShieldCheck } from "lucide-react";
import { BasicCalculator } from "./components/BasicCalculator";
import { FlipComparisonTable } from "./components/FlipComparisonTable";
import { RiskScorePanel } from "./components/RiskScorePanel";
import { SettingsPanel } from "./components/SettingsPanel";
import { TargetProfitCalculator, TargetRoiCalculator } from "./components/TargetCalculators";
import { createExampleItems } from "./data/exampleItems";
import { loadItems, loadSettings, saveItems, saveSettings } from "./lib/storage";
import type { FlipItem, RatingValue, Settings, SortMode } from "./types";

const loadInitialItems = () => loadItems() ?? createExampleItems();

export default function App() {
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const [items, setItems] = useState<FlipItem[]>(loadInitialItems);
  const [sortMode, setSortMode] = useState<SortMode>("roi");

  const [basicBuyPrice, setBasicBuyPrice] = useState("42.50");
  const [basicSellPrice, setBasicSellPrice] = useState("62");
  const [feePercent, setFeePercent] = useState(() => String(settings.defaultFeePercent));

  const [targetProfitBuyPrice, setTargetProfitBuyPrice] = useState("42.50");
  const [targetProfit, setTargetProfit] = useState("10");
  const [targetRoiBuyPrice, setTargetRoiBuyPrice] = useState("42.50");
  const [targetRoi, setTargetRoi] = useState("15");

  const [demandRating, setDemandRating] = useState<RatingValue>(4);
  const [liquidityRating, setLiquidityRating] = useState<RatingValue>(3);
  const [volatilityRating, setVolatilityRating] = useState<RatingValue>(3);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveItems(items);
  }, [items]);

  const updateSettings = (nextSettings: Settings) => {
    setSettings(nextSettings);
    setFeePercent(String(nextSettings.defaultFeePercent));
  };

  return (
    <div className="min-h-screen overflow-hidden bg-coal text-slate-100">
      <div className="noise-layer" />
      <main className="relative mx-auto flex w-full max-w-[1500px] flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="mb-6 rounded-xl border border-white/10 bg-white/[0.035] p-5 shadow-panel backdrop-blur">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-amber/25 bg-amber/10 text-amber shadow-glow">
                  <BarChart3 size={23} />
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-normal text-white sm:text-4xl">
                    Gaijin Flip Calculator
                  </h1>
                  <p className="mt-1 text-sm text-steel">
                    War Thunder / Gaijin Market fee, profit, ROI, break-even, and risk analysis.
                  </p>
                </div>
              </div>
              <div className="flex max-w-4xl items-start gap-2 rounded-lg border border-profit/15 bg-profit/10 px-4 py-3 text-sm leading-6 text-slate-300">
                <ShieldCheck className="mt-0.5 shrink-0 text-profit" size={18} />
                <span>
                  Calculator only. No bots, auto-buyers, auto-snipers, scraping scripts, or market
                  automation. Check real market history and Gaijin rules before spending.
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 lg:min-w-[360px]">
              <div className="metric-tile">
                <span>Default fee</span>
                <strong>{settings.defaultFeePercent}%</strong>
              </div>
              <div className="metric-tile">
                <span>Seller gets</span>
                <strong>{Math.max(0, 100 - settings.defaultFeePercent).toFixed(0)}%</strong>
              </div>
              <div className="metric-tile">
                <span>Rows saved</span>
                <strong>{items.length}</strong>
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-12">
          <BasicCalculator
            buyPrice={basicBuyPrice}
            sellPrice={basicSellPrice}
            feePercent={feePercent}
            setBuyPrice={setBasicBuyPrice}
            setSellPrice={setBasicSellPrice}
            setFeePercent={setFeePercent}
            settings={settings}
          />

          <RiskScorePanel
            buyPrice={basicBuyPrice}
            sellPrice={basicSellPrice}
            feePercent={feePercent}
            demandRating={demandRating}
            liquidityRating={liquidityRating}
            volatilityRating={volatilityRating}
            setDemandRating={setDemandRating}
            setLiquidityRating={setLiquidityRating}
            setVolatilityRating={setVolatilityRating}
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <TargetProfitCalculator
            buyPrice={targetProfitBuyPrice}
            targetProfit={targetProfit}
            feePercent={feePercent}
            setBuyPrice={setTargetProfitBuyPrice}
            setTargetProfit={setTargetProfit}
            settings={settings}
          />
          <TargetRoiCalculator
            buyPrice={targetRoiBuyPrice}
            targetRoi={targetRoi}
            feePercent={feePercent}
            setBuyPrice={setTargetRoiBuyPrice}
            setTargetRoi={setTargetRoi}
            settings={settings}
          />
          <SettingsPanel settings={settings} onChange={updateSettings} />
        </div>

        <FlipComparisonTable
          items={items}
          settings={settings}
          sortMode={sortMode}
          setSortMode={setSortMode}
          setItems={setItems}
        />
      </main>
    </div>
  );
}
