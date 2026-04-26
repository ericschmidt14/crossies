import { NextRequest, NextResponse } from "next/server";
import wordList from "../../../data/german-words.json";

const words = wordList as string[];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawPattern = (searchParams.get("pattern") ?? "").trim().toLowerCase();
  const length = parseInt(searchParams.get("length") ?? "0", 10);

  if (!rawPattern) return NextResponse.json([]);

  // Mirror umlaut replacement so patterns like "AE" match words already normalized in the list
  const pattern = rawPattern
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss");

  const hasWildcard = pattern.includes("*");
  let regex: RegExp;
  if (hasWildcard) {
    const escaped = pattern
      .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
      .replace(/\*/g, ".");
    regex = new RegExp(`^${escaped}$`);
  } else {
    const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    regex = new RegExp(escaped);
  }

  const matches = words
    .filter((w) => (length > 0 ? w.length === length : true) && regex.test(w))
    .slice(0, 50)
    .map((w) => w.toUpperCase());

  return NextResponse.json(matches);
}
