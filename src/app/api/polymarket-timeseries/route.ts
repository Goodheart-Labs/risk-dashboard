import { NextResponse } from "next/server";

const CLOB_API = "https://clob.polymarket.com";

export async function GET(request: Request) {
  try {
    // Get marketId from URL params
    const { searchParams } = new URL(request.url);
    const marketId = searchParams.get("marketId");

    if (!marketId) {
      return NextResponse.json(
        { error: "Market ID is required" },
        { status: 400 }
      );
    }

    const timeseriesResponse = await fetch(
      `${CLOB_API}/prices-history?market=${marketId}&interval=1w&fidelity=30`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    // Add debugging for response status and details
    console.log("Response status:", timeseriesResponse.status);
    console.log(
      "Response headers:",
      Object.fromEntries(timeseriesResponse.headers.entries())
    );

    if (!timeseriesResponse.ok) {
      const errorText = await timeseriesResponse.text();
      console.error("Error response body:", errorText);

      return NextResponse.json(
        {
          error: "Failed to fetch timeseries data",
          status: timeseriesResponse.status,
          details: errorText,
        },
        { status: timeseriesResponse.status }
      );
    }

    const timeseriesData = await timeseriesResponse.json();
    return NextResponse.json(timeseriesData);
  } catch (error) {
    console.error("Error fetching timeseries data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
