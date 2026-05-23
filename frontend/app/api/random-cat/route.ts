import { NextRequest, NextResponse } from "next/server";
import { getRandomCat } from "@/lib/directus";
import type { Locale } from "@/lib/types";

export async function GET(req: NextRequest) {
  const locale = (req.nextUrl.searchParams.get("locale") ?? "en") as Locale;
  const cat = await getRandomCat(locale);
  if (!cat) {
    return NextResponse.json({ error: "No cats available" }, { status: 404 });
  }
  return NextResponse.json(cat);
}
