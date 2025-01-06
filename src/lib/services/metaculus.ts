import { MetaculusResponse, ChartDataPoint } from "../risk-index/types";

export async function fetchMetaculusData(
  questionId: number,
): Promise<ChartDataPoint[]> {
  try {
    // Try API first
    const response = await fetch(`/api/metaculus?questionId=${questionId}`);
    if (!response.ok) throw new Error("API failed");
    const data: MetaculusResponse = await response.json();
    return transformMetaculusData(data);
  } catch (error) {
    console.error("Error fetching Metaculus data:", error);

    // Fall back to example data
    const fallbackResponse = await fetch("/example-data/metaculus.json");
    if (!fallbackResponse.ok) throw new Error("Failed to load example data");
    const data: MetaculusResponse = await fallbackResponse.json();
    return transformMetaculusData(data);
  }
}

function transformMetaculusData(data: MetaculusResponse): ChartDataPoint[] {
  if (!data?.question?.aggregations?.recency_weighted?.history) return [];
  const result = data.question.aggregations.recency_weighted.history.map(
    (point) => ({
      date: new Date(point.start_time * 1000).toISOString(),
      value: point.means[0] * 100,
    }),
  );
  return result;
}
