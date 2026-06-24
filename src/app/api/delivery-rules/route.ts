import { NextResponse } from "next/server";
import { getDeliveryRules } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const deliveryRules = await getDeliveryRules();
    return NextResponse.json({ deliveryRules });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
