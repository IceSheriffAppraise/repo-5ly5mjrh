import { NextResponse } from "next/server";
import { getMealPlans } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const mealPlans = await getMealPlans();
    return NextResponse.json({ mealPlans });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
