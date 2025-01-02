import { MockDataSeries, ChartDataPoint } from "../risk-index/types";

// Generate mock data with fixed values - only for charts without real data yet
export function generateMockData(): MockDataSeries {
  return {
    riskIndex: generateMockTimeSeries(10, 0.5),
    variantCount: generateMockTimeSeries(5, 0.5),
  };
}

// Helper to generate a mock time series with a starting value and increment
function generateMockTimeSeries(
  startValue: number,
  increment: number,
): ChartDataPoint[] {
  return Array.from({ length: 12 }, (_, i) => ({
    date: `2023-${String(i + 1).padStart(2, "0")}`,
    value: startValue + i * increment,
  }));
}

// Initial empty state
export const emptyData: MockDataSeries = {
  riskIndex: generateMockTimeSeries(0, 0),
  variantCount: generateMockTimeSeries(0, 0),
};
