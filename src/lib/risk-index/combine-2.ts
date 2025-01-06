import { ChartDataPoint } from "./types";

// Target time resolution is 1 hour
// const TARGET_TIME_RESOLUTION = 1 * 60 * 60 * 1000;
export function combineDataSources2(
  polymarketTimeSeries: ChartDataPoint[],
  metaculusTimeSeries: ChartDataPoint[],
  kalshiDelayTravel: ChartDataPoint[],
  kalshiCases: ChartDataPoint[],
) {
  console.log("polymarketTimeSeries", polymarketTimeSeries.slice(0, 3));
  console.log("metaculusTimeSeries", metaculusTimeSeries.slice(0, 3));
  console.log("kalshiDelayTravel", kalshiDelayTravel.slice(0, 3));
  console.log("kalshiCases", kalshiCases.slice(0, 3));

  // Assume series are already sorted by date
  // Choose a start time from the most recent 0-index point
  const startDate = [
    polymarketTimeSeries[0],
    metaculusTimeSeries[0],
    kalshiDelayTravel[0],
    kalshiCases[0],
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
    .date;

  // Get the end date from the least recent 0-index point
  const endDate = [
    polymarketTimeSeries[polymarketTimeSeries.length - 1],
    metaculusTimeSeries[metaculusTimeSeries.length - 1],
    kalshiDelayTravel[kalshiDelayTravel.length - 1],
    kalshiCases[kalshiCases.length - 1],
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]
    .date;

  console.log("startDate", startDate);
  console.log("endDate", endDate);

  return {};
}
