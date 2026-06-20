import { NextResponse } from "next/server";
import { getDishes } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const dishes = await getDishes();
    return NextResponse.json({ dishes });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
