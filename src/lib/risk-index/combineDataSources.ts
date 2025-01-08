import { getInterpolatedValue } from "./getInterpolatedValue";
import { ChartDataPoint } from "./types";

export interface HourlyDatasets {
  meta: ChartDataPoint[];
  travel: ChartDataPoint[];
  cases: ChartDataPoint[];
}

// Target time resolution is 1 hour
const TARGET_TIME_RESOLUTION = 1 * 60 * 60 * 1000;
export const WEIGHTS = {
  metaculus: 0.5,
  kalshiDelayTravel: 0.1,
  kalshiCases: 0.5,
};

// const WEIGHTS_SUM = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);

export function combineDataSources(
  metaculusTimeSeries: ChartDataPoint[],
  kalshiDelayTravel: ChartDataPoint[],
  kalshiCases: ChartDataPoint[],
) {
  // Assume series are already sorted by date
  // Choose a start time from the most recent 0-index point
  const start = [
    metaculusTimeSeries[0],
    kalshiDelayTravel[0],
    kalshiCases[0],
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
    .date;

  // Get the end date from the least recent 0-index point
  const end = [
    metaculusTimeSeries[metaculusTimeSeries.length - 1],
    kalshiDelayTravel[kalshiDelayTravel.length - 1],
    kalshiCases[kalshiCases.length - 1],
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]
    .date;

  // Set the start and end date to the nearest hour
  const startDate = new Date(start).setMinutes(0, 0, 0);
  const endDate = new Date(end).setMinutes(0, 0, 0);

  const riskIndex = [],
    hourlyDatasets: HourlyDatasets = {
      meta: [],
      travel: [],
      cases: [],
    };
  for (let i = startDate; i <= endDate; i += TARGET_TIME_RESOLUTION) {
    const date = new Date(i).toISOString();
    const metaculusValue = getInterpolatedValue(metaculusTimeSeries, date);
    const kalshiDelayTravelValue = getInterpolatedValue(
      kalshiDelayTravel,
      date,
    );
    const kalshiCasesValue = getInterpolatedValue(kalshiCases, date);

    hourlyDatasets.meta.push({ date, value: metaculusValue });
    hourlyDatasets.travel.push({ date, value: kalshiDelayTravelValue });
    hourlyDatasets.cases.push({ date, value: kalshiCasesValue });

    const indexValue =
      (metaculusValue * WEIGHTS.metaculus +
        kalshiDelayTravelValue * WEIGHTS.kalshiDelayTravel +
        kalshiCasesValue * WEIGHTS.kalshiCases) /
      3;

    riskIndex.push({ date, value: indexValue });
  }

  // Now let's determine the percentage movement in the past 24 hours
  const last24Hours = riskIndex.slice(-24);
  const last24HoursValues = last24Hours.map((point) => point.value);
  const percentageMovement =
    ((last24HoursValues[last24HoursValues.length - 1] - last24HoursValues[0]) /
      last24HoursValues[0]) *
    100;

  return { riskIndex, hourlyDatasets, percentageMovement };
}
