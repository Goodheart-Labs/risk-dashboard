import { getInterpolatedValue } from "./getInterpolatedValue";
import { ChartDataPoint } from "./types";

export interface HourlyDatasets {
  poly: ChartDataPoint[];
  meta: ChartDataPoint[];
  travel: ChartDataPoint[];
  cases: ChartDataPoint[];
}

// Target time resolution is 1 hour
const TARGET_TIME_RESOLUTION = 1 * 60 * 60 * 1000;
export const WEIGHTS = {
  polymarket: 0.1,
  metaculus: 0.5,
  kalshiDelayTravel: 0.25,
  kalshiCases: 0.3,
};

const WEIGHTS_SUM = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);

export function combineDataSources2(
  polymarketTimeSeries: ChartDataPoint[],
  metaculusTimeSeries: ChartDataPoint[],
  kalshiDelayTravel: ChartDataPoint[],
  kalshiCases: ChartDataPoint[],
) {
  console.log("polymarketTimeSeries", polymarketTimeSeries.slice(-3));
  console.log("metaculusTimeSeries", metaculusTimeSeries.slice(-3));
  console.log("kalshiDelayTravel", kalshiDelayTravel.slice(-3));
  console.log("kalshiCases", kalshiCases.slice(-3));

  // Assume series are already sorted by date
  // Choose a start time from the most recent 0-index point
  const start = [
    polymarketTimeSeries[0],
    metaculusTimeSeries[0],
    kalshiDelayTravel[0],
    kalshiCases[0],
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
    .date;

  // Get the end date from the least recent 0-index point
  const end = [
    polymarketTimeSeries[polymarketTimeSeries.length - 1],
    metaculusTimeSeries[metaculusTimeSeries.length - 1],
    kalshiDelayTravel[kalshiDelayTravel.length - 1],
    kalshiCases[kalshiCases.length - 1],
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]
    .date;

  console.log("start", start);
  console.log("end", end);

  // Set the start and end date to the nearest hour
  const startDate = new Date(start).setMinutes(0, 0, 0);
  const endDate = new Date(end).setMinutes(0, 0, 0);

  console.log("startDate", startDate);
  console.log("endDate", endDate);

  const riskIndex = [],
    hourlyDatasets: HourlyDatasets = {
      poly: [],
      meta: [],
      travel: [],
      cases: [],
    };
  for (let i = startDate; i <= endDate; i += TARGET_TIME_RESOLUTION) {
    const date = new Date(i).toISOString();
    const polymarketValue = getInterpolatedValue(polymarketTimeSeries, date);
    const metaculusValue = getInterpolatedValue(metaculusTimeSeries, date);
    const kalshiDelayTravelValue = getInterpolatedValue(
      kalshiDelayTravel,
      date,
    );
    const kalshiCasesValue = getInterpolatedValue(kalshiCases, date);

    hourlyDatasets.poly.push({ date, value: polymarketValue });
    hourlyDatasets.meta.push({ date, value: metaculusValue });
    hourlyDatasets.travel.push({ date, value: kalshiDelayTravelValue });
    hourlyDatasets.cases.push({ date, value: kalshiCasesValue });

    const indexValue =
      (polymarketValue * WEIGHTS.polymarket +
        metaculusValue * WEIGHTS.metaculus +
        kalshiDelayTravelValue * WEIGHTS.kalshiDelayTravel +
        kalshiCasesValue * WEIGHTS.kalshiCases) /
      WEIGHTS_SUM;
    riskIndex.push({ date, value: indexValue });
  }

  return { riskIndex, hourlyDatasets };
}
