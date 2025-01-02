export type ChartDataPoint = {
  date: string;
  value: number;
};

export type PolymarketDataPoint = {
  t: number;
  p: number;
};

export type PolymarketResponse = {
  history: PolymarketDataPoint[];
};

export type MetaculusResponse = {
  question: {
    aggregations: {
      recency_weighted: {
        history: Array<{
          start_time: number;
          means: number[];
        }>;
      };
    };
  };
};

export type MockDataSeries = {
  riskIndex: ChartDataPoint[];
  variantCount: ChartDataPoint[];
};
