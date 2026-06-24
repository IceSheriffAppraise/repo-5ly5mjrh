import { NextResponse } from "next/server";
import { getPrograms } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const programs = await getPrograms();
    return NextResponse.json({ programs });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
