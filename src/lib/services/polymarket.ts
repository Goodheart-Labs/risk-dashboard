import { PolymarketResponse, ChartDataPoint } from '../risk-index/types';

export async function fetchPolymarketData(slug: string): Promise<ChartDataPoint[]> {
    // Note there are two different ways to end up seeing the example data. 
  const data = await fetchFromAPI(slug).catch(() => fetchExampleData());
  
  const points = transformPolymarketData(data);
  if (points.length === 0) {
    const exampleData = await fetchExampleData();
    return transformPolymarketData(exampleData);
  }
  
  return points;
}

async function fetchFromAPI(slug: string): Promise<PolymarketResponse> {
  const response = await fetch(`/api/polymarket?slug=${slug}`);
  if (!response.ok) throw new Error('API failed');
  return response.json();
}

async function fetchExampleData(): Promise<PolymarketResponse> {
  const response = await fetch("/example-data/timeseries.json");
  if (!response.ok) throw new Error('Failed to load example data');
  return response.json();
}

function transformPolymarketData(data: PolymarketResponse): ChartDataPoint[] {
  if (!data?.history) {
    return [];
  }
  return data.history.map(point => ({
    date: new Date(point.t * 1000).toISOString().split('T')[0],
    value: point.p * 100
  }));
} 