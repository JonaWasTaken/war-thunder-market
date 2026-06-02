import type { ReactNode } from "react";

export const Panel = ({
  children,
  className = "",
  title,
  eyebrow,
  action,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  eyebrow?: string;
  action?: ReactNode;
}) => (
  <section className={`panel ${className}`}>
    {(title || eyebrow || action) && (
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          {eyebrow && (
            <p className="mb-1 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-amber">
              {eyebrow}
            </p>
          )}
          {title && <h2 className="text-lg font-semibold text-white">{title}</h2>}
        </div>
        {action}
      </div>
    )}
    {children}
  </section>
);

export const TextInput = ({
  label,
  value,
  onChange,
  placeholder,
  suffix,
  type = "text",
  min,
  step,
  error,
  testId,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suffix?: string;
  type?: "text" | "number";
  min?: number;
  step?: number;
  error?: string;
  testId?: string;
}) => (
  <label className="block">
    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-steel">
      {label}
    </span>
    <span className="relative block">
      <input
        data-testid={testId}
        className={`field ${suffix ? "pr-14" : ""} ${error ? "border-loss/70" : ""}`}
        min={min}
        step={step}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      {suffix && (
        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-semibold text-steel">
          {suffix}
        </span>
      )}
    </span>
    {error && <span className="mt-2 block text-xs text-loss">{error}</span>}
  </label>
);

export const SelectInput = ({
  label,
  value,
  onChange,
  children,
  testId,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  testId?: string;
}) => (
  <label className="block">
    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-steel">
      {label}
    </span>
    <select
      className="field"
      data-testid={testId}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {children}
    </select>
  </label>
);

export const StatCard = ({
  label,
  value,
  helper,
  tone = "neutral",
}: {
  label: string;
  value: string;
  helper?: string;
  tone?: "neutral" | "profit" | "loss" | "caution";
}) => {
  const toneClass = {
    neutral: "text-white",
    profit: "text-profit",
    loss: "text-loss",
    caution: "text-caution",
  }[tone];

  return (
    <div className="rounded-lg border border-white/8 bg-white/[0.035] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-steel">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${toneClass}`}>{value}</p>
      {helper && <p className="mt-1 text-xs text-steel">{helper}</p>}
    </div>
  );
};

export const Badge = ({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "profit" | "loss" | "caution" | "low" | "medium" | "high";
}) => {
  const toneClass = {
    neutral: "border-white/10 bg-white/5 text-steel",
    profit: "border-profit/25 bg-profit/10 text-profit",
    loss: "border-loss/25 bg-loss/10 text-loss",
    caution: "border-caution/25 bg-caution/10 text-caution",
    low: "border-profit/25 bg-profit/10 text-profit",
    medium: "border-caution/25 bg-caution/10 text-caution",
    high: "border-loss/25 bg-loss/10 text-loss",
  }[tone];

  return (
    <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold ${toneClass}`}>
      {children}
    </span>
  );
};

export const Slider = ({
  label,
  value,
  onChange,
  lowLabel,
  highLabel,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  lowLabel: string;
  highLabel: string;
}) => (
  <label className="block">
    <div className="mb-2 flex items-center justify-between">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-steel">{label}</span>
      <span className="rounded bg-white/8 px-2 py-0.5 text-xs font-semibold text-white">{value}/5</span>
    </div>
    <input
      className="range"
      type="range"
      min="1"
      max="5"
      step="1"
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
    />
    <div className="mt-1 flex justify-between text-[0.68rem] text-steel">
      <span>{lowLabel}</span>
      <span>{highLabel}</span>
    </div>
  </label>
);
