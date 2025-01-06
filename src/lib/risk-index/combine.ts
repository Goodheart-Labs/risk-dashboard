import { ChartDataPoint } from "./types";

export interface HourlyDatasets {
  poly: ChartDataPoint[];
  meta: ChartDataPoint[];
  travel: ChartDataPoint[];
  cases: ChartDataPoint[];
}

export interface CombineResult {
  combinedData: ChartDataPoint[];
  hourlyDatasets: HourlyDatasets;
}

function interpolateValue(
  date: string,
  points: ChartDataPoint[],
): number | undefined {
  if (points.length === 0) return undefined;

  // Sort points by date
  const sortedPoints = [...points].sort((a, b) => a.date.localeCompare(b.date));

  // Find the points before and after our target date
  const before = sortedPoints.filter((p) => p.date <= date).pop();
  const after = sortedPoints.find((p) => p.date > date);

  // If we have an exact match, use it
  if (before?.date === date) return before.value;

  // If we only have one point, use it
  if (!before) return after?.value;
  if (!after) return before?.value;

  // Convert dates to timestamps for calculation
  const beforeTime = new Date(before.date).getTime();
  const afterTime = new Date(after.date).getTime();
  const targetTime = new Date(date).getTime();

  // Calculate the interpolation factor (0 to 1)
  const factor = (targetTime - beforeTime) / (afterTime - beforeTime);

  // Linear interpolation
  return before.value + (after.value - before.value) * factor;
}

function createHourlyDataset(points: ChartDataPoint[]): ChartDataPoint[] {
  if (points.length === 0) return [];

  const startDate = new Date(points[0].date);
  const endDate = new Date(points[points.length - 1].date);

  // Create array of hourly timestamps
  const hourlyPoints: ChartDataPoint[] = [];
  const currentDate = new Date(startDate);
  currentDate.setMinutes(0, 0, 0); // Start at the beginning of the hour

  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString();
    const value = interpolateValue(dateStr, points);
    if (value !== undefined) {
      hourlyPoints.push({ date: dateStr, value });
    }
    currentDate.setHours(currentDate.getHours() + 1);
  }

  return hourlyPoints;
}

export function combineDataSources(
  polymarketPoints: ChartDataPoint[],
  metaculusPoints: ChartDataPoint[],
  kalshiTravelPoints: ChartDataPoint[] = [],
  kalshiCasesPoints: ChartDataPoint[] = [],
): CombineResult {
  // Create hourly datasets for each source
  const hourlyPoly = createHourlyDataset(polymarketPoints);
  const hourlyMeta = createHourlyDataset(metaculusPoints);
  const hourlyTravel = createHourlyDataset(kalshiTravelPoints);
  const hourlyCases = createHourlyDataset(kalshiCasesPoints);

  // Get all unique dates from hourly datasets
  const allDates = new Set([
    ...hourlyPoly.map((p) => p.date),
    ...hourlyMeta.map((p) => p.date),
    ...hourlyTravel.map((p) => p.date),
    ...hourlyCases.map((p) => p.date),
  ]);

  // Create maps for quick lookup
  const polyByDate = new Map(hourlyPoly.map((p) => [p.date, p.value]));
  const metaByDate = new Map(hourlyMeta.map((p) => [p.date, p.value]));
  const travelByDate = new Map(hourlyTravel.map((p) => [p.date, p.value]));
  const casesByDate = new Map(hourlyCases.map((p) => [p.date, p.value]));

  // Combine the hourly data points
  const combinedData = Array.from(allDates)
    .sort()
    .map((date) => {
      const polyValue = polyByDate.get(date);
      const metaValue = metaByDate.get(date);
      const travelValue = travelByDate.get(date);
      const casesValue = casesByDate.get(date);

      // Calculate weighted values (or undefined if missing)
      const weightedValues = {
        poly: polyValue !== undefined ? polyValue * 0.1 : undefined,
        meta: metaValue !== undefined ? metaValue * 1.0 : undefined,
        travel: travelValue !== undefined ? travelValue * 0.25 : undefined,
        cases: casesValue !== undefined ? casesValue * 0.3 : undefined,
      };

      // Calculate total weight of available values
      const availableWeights = [
        polyValue !== undefined ? 0.1 : 0,
        metaValue !== undefined ? 1.0 : 0,
        travelValue !== undefined ? 0.25 : 0,
        casesValue !== undefined ? 0.3 : 0,
      ];

      const totalWeight = availableWeights.reduce((a, b) => a + b, 0);

      // Skip points where we don't have enough data
      if (totalWeight === 0) return null;

      // Sum available weighted values and divide by total weight
      const weightedSum = [
        weightedValues.poly,
        weightedValues.meta,
        weightedValues.travel,
        weightedValues.cases,
      ]
        .filter((v): v is number => v !== undefined)
        .reduce((a, b) => a + b, 0);

      return {
        date,
        value: weightedSum / totalWeight,
      };
    })
    .filter((point): point is ChartDataPoint => point !== null);

  return {
    combinedData,
    hourlyDatasets: {
      poly: hourlyPoly,
      meta: hourlyMeta,
      travel: hourlyTravel,
      cases: hourlyCases,
    },
  };
}
