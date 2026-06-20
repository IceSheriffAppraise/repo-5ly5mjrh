import { NextResponse } from "next/server";
import { getPricingRules } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const pricingRules = await getPricingRules();
    return NextResponse.json({ pricingRules });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
