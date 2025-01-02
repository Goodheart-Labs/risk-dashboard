import { kalshiFetch } from "@/lib/kalshi/fetch";

const MARKET_ID = "KXCDCTRAVELH5-26-3";

export async function GET() {
  try {
    const data = await kalshiFetch(`/markets/${MARKET_ID}`);
    return Response.json(data);
  } catch (error) {
    console.error("Kalshi API error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
