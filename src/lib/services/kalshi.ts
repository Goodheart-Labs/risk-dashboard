import { format } from "date-fns";
import {
  KalshiResponse,
  ChartDataPoint,
  KalshiCandlestick,
} from "../risk-index/types";

export async function fetchKalshiData(): Promise<ChartDataPoint[]> {
  const data = await fetchFromAPI();
  return transformKalshiData(data);
}

async function fetchFromAPI(): Promise<KalshiResponse> {
  const response = await fetch("/api/kalshi");
  if (!response.ok) throw new Error("API failed");
  return response.json();
}

function transformKalshiData(data: KalshiResponse): ChartDataPoint[] {
  if (!data?.candlesticks?.candlesticks) {
    return [];
  }

  console.log(data.candlesticks.candlesticks);

  // get the first date
  const firstDate = data.candlesticks.candlesticks[0].end_period_ts;
  const lastDate =
    data.candlesticks.candlesticks[data.candlesticks.candlesticks.length - 1]
      .end_period_ts;
  let lastPrice = data.candlesticks.candlesticks[0].yes_bid.close;

  // Loop hourly until reaching the last date, update lastPrice
  let currentDate = firstDate;
  const dataPoints: ChartDataPoint[] = [];
  while (currentDate <= lastDate) {
    // Look for candlestick with end_period_ts equal to currentDate
    const candlestick = data.candlesticks.candlesticks.find(
      (stick) => stick.end_period_ts === currentDate,
    );
    if (candlestick && candlestick.price.open) {
      lastPrice = candlestick.price.open;
    }

    const niceDate = new Date(currentDate * 1000);

    // If date is not before 8am or after 11pm then add it
    if (niceDate.getHours() >= 8 && niceDate.getHours() <= 23) {
      dataPoints.push({
        date: niceDate.toISOString(),
        value: lastPrice,
      });
    }

    currentDate += 3600;
  }

  return dataPoints;
}
