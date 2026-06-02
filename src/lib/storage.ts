import type { FlipItem, Settings } from "../types";

const SETTINGS_KEY = "gaijin-flip-settings:v1";
const ITEMS_KEY = "gaijin-flip-items:v1";

export const DEFAULT_SETTINGS: Settings = {
  defaultFeePercent: 20,
  currencyLabel: "GJN",
  decimals: 2,
};

const safeRead = <T>(key: string): T | null => {
  try {
    const storedValue = window.localStorage.getItem(key);
    return storedValue ? (JSON.parse(storedValue) as T) : null;
  } catch {
    return null;
  }
};

const safeWrite = (key: string, value: unknown) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage can fail in private mode or locked-down browsers.
  }
};

export const loadSettings = (): Settings => {
  const savedSettings = safeRead<Partial<Settings>>(SETTINGS_KEY);
  return {
    ...DEFAULT_SETTINGS,
    ...savedSettings,
    decimals: savedSettings?.decimals === 3 ? 3 : 2,
  };
};

export const saveSettings = (settings: Settings) => {
  safeWrite(SETTINGS_KEY, settings);
};

export const loadItems = () => safeRead<FlipItem[]>(ITEMS_KEY);

export const saveItems = (items: FlipItem[]) => {
  safeWrite(ITEMS_KEY, items);
};
