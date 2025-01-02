import { kalshiFetch } from "@/lib/kalshi/fetch";

const MARKET_TICKER = "KXCDCTRAVELH5-26-3";
const SERIES_TICKER = "KXCDCTRAVELH5";
// 👇 Had to get this from looking at the request in the browser
const MARKET_ID = "d02240fe-5c63-4378-885f-97657e90b783";

export async function GET() {
  try {
    const marketData = await kalshiFetch(`/markets/${MARKET_TICKER}`);
    console.log(marketData);

    const openTime = new Date(marketData.market.open_time);
    const now = new Date();
    const oneMonthAgo = new Date(openTime);
    oneMonthAgo.setMonth(openTime.getMonth() - 1);

    // Round to nearest hour
    now.setMinutes(0, 0, 0);
    oneMonthAgo.setMinutes(0, 0, 0);

    const start_ts = Math.floor(oneMonthAgo.getTime() / 1000);
    const end_ts = Math.floor(now.getTime() / 1000);

    console.log(start_ts, end_ts);

    const candlesticks = await kalshiFetch(
      `/series/${SERIES_TICKER}/markets/${MARKET_ID}/candlesticks`,
      {
        query: {
          start_ts: start_ts,
          end_ts: end_ts,
          period_interval: 60,
        },
      },
    );

    return Response.json({
      marketData,
      candlesticks,
      dateRange: {
        start: oneMonthAgo.toISOString(),
        end: now.toISOString(),
      },
    });
  } catch (error) {
    console.error("Kalshi API error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
