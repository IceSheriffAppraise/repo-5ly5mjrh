import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const TABLES: Record<string, string> = {
  programs: "programs",
  dishes: "dishes",
  "delivery-rules": "delivery_rules",
  "pricing-rules": "pricing_rules",
  content: "content",
  "meal-plans": "meal_plans",
  orders: "orders",
};

export async function PATCH(req: NextRequest, { params }: { params: { resource: string; id: string } }) {
  const table = TABLES[params.resource];
  if (!table) return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  try {
    const body = await req.json();
    const supabase = createServiceClient();
    const { data, error } = await supabase.from(table).update(body).eq("id", params.id).select().single();
    if (error) throw error;
    return NextResponse.json({ item: data });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { resource: string; id: string } }) {
  const table = TABLES[params.resource];
  if (!table) return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  try {
    const supabase = createServiceClient();
    const { error } = await supabase.from(table).delete().eq("id", params.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
