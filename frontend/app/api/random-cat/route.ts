import { NextResponse } from "next/server";
import { getRandomCat } from "@/lib/directus";

export async function GET() {
  const cat = await getRandomCat();
  if (!cat) {
    return NextResponse.json({ error: "No cats available" }, { status: 404 });
  }
  return NextResponse.json(cat);
}
