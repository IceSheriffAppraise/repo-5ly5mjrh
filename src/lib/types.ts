export type ProgramCode = "FIT" | "HIT" | "PRO";

export interface Program {
  id: string;
  code: string;
  name: string;
  description: string;
  sort_order: number;
  is_active: boolean;
}

export type DishCategory = "breakfast" | "lunch" | "dinner" | "snack";

export interface Dish {
  id: string;
  name: string;
  description: string;
  image_url: string;
  category: string;
  calories: number;
  proteins: number;
  fats: number;
  carbs: number;
  has_fish: boolean;
  sort_order: number;
  is_active: boolean;
}

export interface MealPlanItem {
  id: string;
  meal_plan_id: string;
  dish_id: string;
  meal_type: string;
  sort_order: number;
  dish?: Dish;
}

export interface MealPlan {
  id: string;
  program_id: string;
  calories: number;
  name: string;
  plan_date: string | null;
  sort_order: number;
  is_active: boolean;
  items?: MealPlanItem[];
}

export interface DeliveryRule {
  id: string;
  days: number;
  discount_percent: number;
  badge: string | null;
  is_default: boolean;
  sort_order: number;
  is_active: boolean;
}

export interface PricingRule {
  id: string;
  program_id: string;
  calories: number;
  meals_count: number;
  price_per_day: number;
  is_active: boolean;
}

export interface ContentItem {
  id: string;
  key: string;
  title: string;
  value: string;
}

export type OrderFormat = "one_time" | "subscription";

export interface Order {
  id: string;
  customer_name: string;
  phone: string;
  address: string;
  program_id: string | null;
  program_code: string | null;
  calories: number;
  duration_days: number;
  order_format: OrderFormat;
  without_fish: boolean;
  first_delivery_date: string | null;
  meals_count: number;
  total_price: number;
  comment: string;
  status: string;
  created_at: string;
}

export interface AppConfig {
  programs: Program[];
  deliveryRules: DeliveryRule[];
  pricingRules: PricingRule[];
  content: Record<string, string>;
}
