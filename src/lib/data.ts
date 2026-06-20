import { createAnonClient } from "./supabase/server";
import { AppConfig, ContentItem, DeliveryRule, Dish, MealPlan, MealPlanItem, PricingRule, Program } from "./types";

export async function getPrograms(): Promise<Program[]> {
  const supabase = createAnonClient();
  const { data, error } = await supabase.from("programs").select("*").order("sort_order");
  if (error) throw error;
  return data ?? [];
}

export async function getDeliveryRules(): Promise<DeliveryRule[]> {
  const supabase = createAnonClient();
  const { data, error } = await supabase.from("delivery_rules").select("*").order("sort_order");
  if (error) throw error;
  return data ?? [];
}

export async function getPricingRules(): Promise<PricingRule[]> {
  const supabase = createAnonClient();
  const { data, error } = await supabase.from("pricing_rules").select("*").order("calories");
  if (error) throw error;
  return data ?? [];
}

export async function getContent(): Promise<ContentItem[]> {
  const supabase = createAnonClient();
  const { data, error } = await supabase.from("content").select("*");
  if (error) throw error;
  return data ?? [];
}

export async function getDishes(): Promise<Dish[]> {
  const supabase = createAnonClient();
  const { data, error } = await supabase.from("dishes").select("*").order("sort_order");
  if (error) throw error;
  return data ?? [];
}

export async function getMealPlans(): Promise<MealPlan[]> {
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from("meal_plans")
    .select("*, items:meal_plan_items(*, dish:dishes(*))")
    .order("sort_order");
  if (error) throw error;
  return (data ?? []).map((plan) => ({
    ...plan,
    items: ((plan.items ?? []) as MealPlanItem[]).sort((a, b) => a.sort_order - b.sort_order),
  }));
}

export async function getConfig(): Promise<AppConfig> {
  const [programs, deliveryRules, pricingRules, contentItems] = await Promise.all([
    getPrograms(),
    getDeliveryRules(),
    getPricingRules(),
    getContent(),
  ]);

  const content: Record<string, string> = {};
  for (const item of contentItems) {
    content[item.key] = item.value;
  }

  return { programs, deliveryRules, pricingRules, content };
}
