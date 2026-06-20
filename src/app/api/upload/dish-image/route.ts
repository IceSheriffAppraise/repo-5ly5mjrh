import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const BUCKET = "dish-images";
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Файл не передан" }, { status: 400 });
    }
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ error: "Допустимы только JPG, PNG или WEBP" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Размер файла не должен превышать 5 МБ" }, { status: 400 });
    }

    const supabase = createServiceClient();
    const ext = EXT[file.type] ?? "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    });
    if (error) throw error;

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return NextResponse.json({ url: data.publicUrl, path }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
