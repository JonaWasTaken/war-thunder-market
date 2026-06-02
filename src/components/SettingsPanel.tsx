import { Settings as SettingsIcon, SlidersHorizontal } from "lucide-react";
import type { Settings } from "../types";
import { Badge, Panel, SelectInput, TextInput } from "./ui";

export const SettingsPanel = ({
  settings,
  onChange,
}: {
  settings: Settings;
  onChange: (settings: Settings) => void;
}) => {
  const updateDefaultFee = (value: string) => {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) {
      return;
    }

    onChange({
      ...settings,
      defaultFeePercent: Math.min(Math.max(numericValue, 0), 99.99),
    });
  };

  return (
    <Panel
      title="Settings"
      eyebrow="Saved locally"
      action={<Badge tone="neutral">localStorage</Badge>}
    >
      <div className="mb-5 flex items-center gap-3 rounded-lg border border-white/8 bg-white/[0.035] p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber/10 text-amber">
          <SettingsIcon size={20} />
        </div>
        <p className="text-sm leading-6 text-slate-300">
          Default fee starts at 20%, but you can change it for your own calculator setup.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
        <TextInput
          label="Default fee"
          min={0}
          step={0.1}
          type="number"
          suffix="%"
          value={String(settings.defaultFeePercent)}
          onChange={updateDefaultFee}
        />
        <TextInput
          label="Currency"
          value={settings.currencyLabel}
          placeholder="GJN"
          onChange={(currencyLabel) =>
            onChange({ ...settings, currencyLabel: currencyLabel.trim().slice(0, 8) || "GJN" })
          }
        />
        <SelectInput
          label="Rounding"
          value={String(settings.decimals)}
          onChange={(decimals) =>
            onChange({ ...settings, decimals: decimals === "3" ? 3 : 2 })
          }
        >
          <option value="2">2 decimals</option>
          <option value="3">3 decimals</option>
        </SelectInput>
      </div>

      <div className="mt-5 flex items-center gap-2 text-xs text-steel">
        <SlidersHorizontal size={15} />
        Settings and comparison rows persist on this device only.
      </div>
    </Panel>
  );
};
