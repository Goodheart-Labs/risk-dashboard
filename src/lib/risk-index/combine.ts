import { ChartDataPoint } from "./types";

export function combineDataSources(
  polymarketPoints: ChartDataPoint[],
  metaculusPoints: ChartDataPoint[],
): ChartDataPoint[] {
  // If we have no data, return empty array
  if (polymarketPoints.length === 0 && metaculusPoints.length === 0) {
    return [];
  }

  // If we only have one data source, return that
  if (polymarketPoints.length === 0) return metaculusPoints;
  if (metaculusPoints.length === 0) return polymarketPoints;

  // Create a map of dates to values for quick lookup
  const metaculusByDate = new Map(
    metaculusPoints.map((point) => [point.date, point.value]),
  );

  // For each Polymarket point, find matching Metaculus point and combine
  return polymarketPoints
    .map((polyPoint) => {
      const metaculusValue = metaculusByDate.get(polyPoint.date);
      if (metaculusValue === undefined) {
        return null; // Skip points where we don't have both sources
      }

      // Combine: Average of 10% of Polymarket and the full value of Metaculus. Please dont change this without understanding why it's there .
      return {
        date: polyPoint.date,
        value: (polyPoint.value * 0.1 + metaculusValue) / 2,
      };
    })
    .filter((point): point is ChartDataPoint => point !== null);
}
