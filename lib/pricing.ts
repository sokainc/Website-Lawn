export const FREQUENCIES = ["weekly", "biweekly", "one-time"] as const;
export const GRASS_HEIGHTS = ["maintained", "tall", "overgrown"] as const;

export type Frequency = (typeof FREQUENCIES)[number];
export type GrassHeight = (typeof GRASS_HEIGHTS)[number];

export const ADD_ONS = [
  { id: "edging", name: "Edging", price: 12 },
  { id: "leaf-removal", name: "Leaf removal", price: 55 },
  { id: "fertilization", name: "Fertilization", price: 45 },
  { id: "aeration", name: "Aeration", price: 65 },
  { id: "bush-trimming", name: "Bush trimming", price: 35 },
  { id: "mulching", name: "Mulching", price: 75 },
  { id: "flower-bed-weeding", name: "Flower-bed weeding", price: 35 },
  { id: "yard-cleanup", name: "Yard cleanup", price: 85 },
] as const;

export type QuoteInput = {
  lotSize: number;
  frequency: Frequency;
  grassHeight: GrassHeight;
  gated: boolean;
  addOns: string[];
};

export type PriceBreakdown = {
  mowing: number;
  frequencyAdjustment: number;
  conditionAdjustment: number;
  accessAdjustment: number;
  addOns: Array<{ id: string; name: string; price: number }>;
  total: number;
  totalCents: number;
};

function mowingBase(lotSize: number) {
  if (lotSize <= 1500) return 21;
  if (lotSize <= 3000) return 33;
  if (lotSize <= 5000) return 42;
  if (lotSize <= 7500) return 49;
  if (lotSize <= 10000) return 58;
  if (lotSize <= 15000) return 68;
  return 89 + Math.ceil((lotSize - 15000) / 5000) * 18;
}

export function calculatePrice(input: QuoteInput): PriceBreakdown {
  const mowing = mowingBase(input.lotSize);
  const multiplier = input.frequency === "weekly" ? 0.9 : input.frequency === "one-time" ? 1.2 : 1;
  const adjustedMowing = Math.max(19, Math.round(mowing * multiplier));
  const frequencyAdjustment = adjustedMowing - mowing;
  const conditionAdjustment =
    input.grassHeight === "tall" ? 18 : input.grassHeight === "overgrown" ? 38 : 0;
  const accessAdjustment = input.gated ? 7 : 0;
  const selectedAddOns = ADD_ONS.filter((service) => input.addOns.includes(service.id));
  const total = adjustedMowing + conditionAdjustment + accessAdjustment +
    selectedAddOns.reduce((sum, service) => sum + service.price, 0);

  return {
    mowing,
    frequencyAdjustment,
    conditionAdjustment,
    accessAdjustment,
    addOns: selectedAddOns.map((service) => ({ ...service })),
    total,
    totalCents: total * 100,
  };
}

export function isQuoteInput(value: unknown): value is QuoteInput {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.lotSize === "number" && Number.isFinite(item.lotSize) &&
    item.lotSize >= 500 && item.lotSize <= 100000 &&
    FREQUENCIES.includes(item.frequency as Frequency) &&
    GRASS_HEIGHTS.includes(item.grassHeight as GrassHeight) &&
    typeof item.gated === "boolean" && Array.isArray(item.addOns) &&
    item.addOns.every((id) => typeof id === "string" && ADD_ONS.some((service) => service.id === id))
  );
}
