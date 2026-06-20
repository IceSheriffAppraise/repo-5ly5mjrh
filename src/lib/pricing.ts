import { DeliveryRule, PricingRule } from "./types";

export interface PriceBreakdown {
  pricePerDay: number;
  days: number;
  discountPercent: number;
  subtotal: number;
  discountAmount: number;
  total: number;
  mealsCount: number;
}

/**
 * Single source of truth for price math. Inputs (price per day, discounts,
 * durations) all come from Supabase — nothing is hardcoded here.
 */
export function calculatePrice(pricing: PricingRule | null, rule: DeliveryRule | null): PriceBreakdown {
  const pricePerDay = pricing?.price_per_day ?? 0;
  const mealsCount = pricing?.meals_count ?? 0;
  const days = rule?.days ?? 0;
  const discountPercent = rule?.discount_percent ?? 0;

  const subtotal = pricePerDay * days;
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const total = subtotal - discountAmount;

  return { pricePerDay, days, discountPercent, subtotal, discountAmount, total, mealsCount };
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("ru-RU").format(Math.round(value)) + " ₽";
}
