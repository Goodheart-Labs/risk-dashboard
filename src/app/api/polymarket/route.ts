import { NextResponse } from "next/server";

const GAMMA_API = "https://gamma-api.polymarket.com";
// Timeseries

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      console.error("NO SLUG PROVIDED TO POLYMARKET API");
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    console.error(`FETCHING POLYMARKET DATA FOR SLUG: ${slug}`);

    // First fetch the event
    const eventResponse = await fetch(`${GAMMA_API}/events?slug=${slug}`, {
      headers: {
        Accept: "application/json",
      },
    });
    const events = await eventResponse.json();

    if (!events?.[0]) {
      return NextResponse.json(
        { error: "No events found for this slug" },
        { status: 404 }
      );
    }

    const event = events[0];
    if (!event.markets?.[0]) {
      return NextResponse.json(
        { error: "No markets found for this event" },
        { status: 404 }
      );
    }

    // Then fetch the specific market data
    const marketId = event.markets[0].id;
    const marketResponse = await fetch(`${GAMMA_API}/markets/${marketId}`, {
      headers: {
        Accept: "application/json",
      },
    });
    const marketData = await marketResponse.json();

    return NextResponse.json(marketData);
  } catch (error) {
    console.error("Error fetching from Polymarket:", error);
    return NextResponse.json(
      { error: "Failed to fetch market data" },
      { status: 500 }
    );
  }
}
