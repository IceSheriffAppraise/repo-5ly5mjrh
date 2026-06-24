import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const TABLES: Record<string, { table: string; order: string }> = {
  programs: { table: "programs", order: "sort_order" },
  dishes: { table: "dishes", order: "sort_order" },
  "delivery-rules": { table: "delivery_rules", order: "sort_order" },
  "pricing-rules": { table: "pricing_rules", order: "calories" },
  content: { table: "content", order: "key" },
  "meal-plans": { table: "meal_plans", order: "sort_order" },
};

function resolve(resource: string) {
  return TABLES[resource] ?? null;
}

export async function GET(_req: NextRequest, { params }: { params: { resource: string } }) {
  const def = resolve(params.resource);
  if (!def) return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase.from(def.table).select("*").order(def.order);
    if (error) throw error;
    return NextResponse.json({ items: data ?? [] });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { resource: string } }) {
  const def = resolve(params.resource);
  if (!def) return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  try {
    const body = await req.json();
    const supabase = createServiceClient();
    const { data, error } = await supabase.from(def.table).insert(body).select().single();
    if (error) throw error;
    return NextResponse.json({ item: data }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
