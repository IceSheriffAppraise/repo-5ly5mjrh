import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { calculatePrice } from "@/lib/pricing";
import { DeliveryRule, PricingRule, Program } from "@/lib/types";

export const dynamic = "force-dynamic";

interface OrderPayload {
  customer_name?: string;
  phone?: string;
  address?: string;
  program_id?: string;
  calories?: number;
  duration_days?: number;
  order_format?: string;
  without_fish?: boolean;
  first_delivery_date?: string | null;
  comment?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as OrderPayload;

    if (!body.customer_name || !body.phone) {
      return NextResponse.json({ error: "Укажите имя и телефон" }, { status: 400 });
    }
    if (!body.program_id || !body.calories || !body.duration_days) {
      return NextResponse.json({ error: "Не выбрана программа, калорийность или длительность" }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Recompute the price server-side from Supabase data — never trust the client.
    const [{ data: program }, { data: pricing }, { data: rule }] = await Promise.all([
      supabase.from("programs").select("*").eq("id", body.program_id).single(),
      supabase
        .from("pricing_rules")
        .select("*")
        .eq("program_id", body.program_id)
        .eq("calories", body.calories)
        .maybeSingle(),
      supabase.from("delivery_rules").select("*").eq("days", body.duration_days).maybeSingle(),
    ]);

    if (!pricing || !rule) {
      return NextResponse.json({ error: "Неверная комбинация программы, калорийности и длительности" }, { status: 400 });
    }

    const breakdown = calculatePrice(pricing as PricingRule, rule as DeliveryRule);
    const orderFormat = body.order_format === "subscription" ? "subscription" : "one_time";

    const { data, error } = await supabase
      .from("orders")
      .insert({
        customer_name: body.customer_name,
        phone: body.phone,
        address: body.address ?? "",
        program_id: body.program_id,
        program_code: (program as Program | null)?.code ?? null,
        calories: body.calories,
        duration_days: body.duration_days,
        order_format: orderFormat,
        without_fish: Boolean(body.without_fish),
        first_delivery_date: body.first_delivery_date || null,
        meals_count: breakdown.mealsCount,
        total_price: breakdown.total,
        comment: body.comment ?? "",
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ order: data, total: breakdown.total }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ orders: data ?? [] });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
