import { ShieldAlert } from "lucide-react";
import { calculateFlip, calculateFlipScore, parseNumericInput } from "../lib/calculations";
import type { RatingValue } from "../types";
import { Badge, Panel, Slider } from "./ui";

export const RiskScorePanel = ({
  buyPrice,
  sellPrice,
  feePercent,
  demandRating,
  liquidityRating,
  volatilityRating,
  setDemandRating,
  setLiquidityRating,
  setVolatilityRating,
}: {
  buyPrice: string;
  sellPrice: string;
  feePercent: string;
  demandRating: RatingValue;
  liquidityRating: RatingValue;
  volatilityRating: RatingValue;
  setDemandRating: (value: RatingValue) => void;
  setLiquidityRating: (value: RatingValue) => void;
  setVolatilityRating: (value: RatingValue) => void;
}) => {
  const parsedBuyPrice = parseNumericInput(buyPrice) ?? 0;
  const calculation = calculateFlip(
    parseNumericInput(buyPrice),
    parseNumericInput(sellPrice),
    parseNumericInput(feePercent),
  );
  const score = calculateFlipScore({
    roiPercent: calculation.roiPercent,
    netProfit: calculation.netProfit,
    buyPrice: parsedBuyPrice,
    demandRating,
    liquidityRating,
    volatilityRating,
  });

  const tone = score.score >= 70 ? "profit" : score.score >= 45 ? "caution" : "loss";

  return (
    <Panel title="Flip Score" eyebrow="Estimate, not certainty" className="lg:col-span-4">
      <div className="flex items-center gap-5">
        <div
          className="score-ring"
          style={{
            background: `conic-gradient(#f5b84b ${score.score * 3.6}deg, rgba(255,255,255,.08) 0deg)`,
          }}
        >
          <div className="score-ring-inner">
            <span className="text-4xl font-black text-white">{score.score}</span>
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-steel">/100</span>
          </div>
        </div>
        <div>
          <Badge tone={tone}>{score.score >= 70 ? "Strong watchlist" : score.score >= 45 ? "Needs review" : "Risky"}</Badge>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Score combines ROI, profit, capital risk, demand, liquidity, and volatility. It is a
            rough screening estimate, never a guarantee.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-5">
        <Slider
          label="Demand"
          value={demandRating}
          lowLabel="Weak"
          highLabel="Strong"
          onChange={(value) => setDemandRating(value as RatingValue)}
        />
        <Slider
          label="Liquidity"
          value={liquidityRating}
          lowLabel="Slow"
          highLabel="Fast"
          onChange={(value) => setLiquidityRating(value as RatingValue)}
        />
        <Slider
          label="Volatility"
          value={volatilityRating}
          lowLabel="Stable"
          highLabel="Wild"
          onChange={(value) => setVolatilityRating(value as RatingValue)}
        />
      </div>

      <div className="mt-6 rounded-lg border border-white/8 bg-white/[0.035] p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
          <ShieldAlert size={18} />
          Score inputs
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-steel">
          <span>ROI weight</span>
          <span className="text-right text-white">{score.roiScore.toFixed(1)} / 30</span>
          <span>Profit weight</span>
          <span className="text-right text-white">{score.profitScore.toFixed(1)} / 20</span>
          <span>Buy-size safety</span>
          <span className="text-right text-white">{score.priceSafetyScore.toFixed(1)} / 15</span>
          <span>Demand</span>
          <span className="text-right text-white">{score.demandScore.toFixed(1)} / 15</span>
          <span>Liquidity</span>
          <span className="text-right text-white">{score.liquidityScore.toFixed(1)} / 15</span>
          <span>Volatility safety</span>
          <span className="text-right text-white">{score.volatilityScore.toFixed(1)} / 10</span>
        </div>
      </div>
    </Panel>
  );
};
