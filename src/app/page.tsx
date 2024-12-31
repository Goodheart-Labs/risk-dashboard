"use client";

import React, { useState, useEffect } from "react";

// Types for our data
type TimeSeriesData = {
  date: string;
  value: number;
};

type DashboardData = {
  cases: TimeSeriesData[];
  mortality: TimeSeriesData[];
  spread: TimeSeriesData[];
  mutations: TimeSeriesData[];
};

// Helper component for line graphs
const LineGraph = ({
  data,
  color,
  label,
}: {
  data: TimeSeriesData[];
  color: string;
  label: string;
}) => {
  const maxValue = Math.max(...data.map((d) => d.value));
  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - (d.value / maxValue) * 90;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="relative h-64 w-full">
      <div className="absolute top-0 left-0 text-sm text-gray-500">{label}</div>
      <svg
        className="w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="absolute bottom-0 right-0 text-sm text-gray-500">
        Latest: {data[data.length - 1].value}
      </div>
    </div>
  );
};

// Generate mock data with fixed values
const generateMockData = (): DashboardData => ({
  cases: Array.from({ length: 12 }, (_, i) => ({
    date: `2023-${i + 1}`,
    value: 100 + i * 50,
  })),
  mortality: Array.from({ length: 12 }, (_, i) => ({
    date: `2023-${i + 1}`,
    value: 20 + i * 2,
  })),
  spread: Array.from({ length: 12 }, (_, i) => ({
    date: `2023-${i + 1}`,
    value: 10 + i,
  })),
  mutations: Array.from({ length: 12 }, (_, i) => ({
    date: `2023-${i + 1}`,
    value: 5 + Math.floor(i / 2),
  })),
});

// Initial empty state
const emptyData: DashboardData = {
  cases: Array.from({ length: 12 }, (_, i) => ({
    date: `2023-${i + 1}`,
    value: 0,
  })),
  mortality: Array.from({ length: 12 }, (_, i) => ({
    date: `2023-${i + 1}`,
    value: 0,
  })),
  spread: Array.from({ length: 12 }, (_, i) => ({
    date: `2023-${i + 1}`,
    value: 0,
  })),
  mutations: Array.from({ length: 12 }, (_, i) => ({
    date: `2023-${i + 1}`,
    value: 0,
  })),
};

const POLYMARKET_SLUG =
  "another-state-declare-a-state-of-emergency-over-bird-flu-before-february";

export default function Home() {
  const [data, setData] = useState<DashboardData>(emptyData);
  const [mounted, setMounted] = useState(false);
  const [cdcData, setCdcData] = useState<any>(null);
  const [polymarketData, setPolymarketData] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    setData(generateMockData());
    // fetch("/api/cdc-data")
    //   .then((res) => res.json())
    //   .then((data) => setCdcData(data))
    //   .catch((error) => console.error("Error fetching CDC data:", error));
    fetch(`/api/polymarket?slug=${POLYMARKET_SLUG}`)
      .then((res) => res.json())
      .then((data) => setPolymarketData(data))
      .catch((error) =>
        console.error("Error fetching Polymarket data:", error)
      );
  }, []);

  if (!mounted) {
    return null; // or a loading skeleton
  }

  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen bg-gray-100 p-6 font-[family-name:var(--font-geist-sans)]">
      {/* Header */}
      <header className="mb-8 text-center max-w-6xl mx-auto w-full">
        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
          Will H5N1 be a disaster?
        </h1>
        <p className="text-2xl text-gray-700 mb-4">
          Probably not - our risk index gives it 5 out of 100 (about 5%)
        </p>
        <p className="text-xl text-gray-600">
          Real-time monitoring of avian influenza trends
        </p>
      </header>

      <main className="space-y-6 max-w-6xl mx-auto w-full">
        {/* Main Graph */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Global H5N1 Cases</h2>
          <LineGraph
            data={data.cases}
            color="#ef4444"
            label="Cases over time"
          />
        </div>

        {/* Grid of smaller graphs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Mortality Rate</h2>
            <LineGraph
              data={data.mortality}
              color="#3b82f6"
              label="Deaths per 100 cases"
            />
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Geographic Spread</h2>
            <LineGraph
              data={data.spread}
              color="#10b981"
              label="Countries affected"
            />
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Mutation Rate</h2>
            <LineGraph
              data={data.mutations}
              color="#8b5cf6"
              label="New variants detected"
            />
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Current Risk Level</h2>
            <div className="flex items-center justify-center h-48">
              <div className="text-6xl font-bold text-yellow-500">MODERATE</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-8 text-center text-gray-500 text-sm max-w-6xl mx-auto w-full">
        <p>Data is simulated for demonstration purposes</p>
        <p>Last updated: {mounted ? new Date().toLocaleDateString() : ""}</p>
      </footer>
      {/* <pre>{JSON.stringify(cdcData, null, 2)}</pre> */}
      <pre>{JSON.stringify(polymarketData, null, 2)}</pre>
    </div>
  );
}
