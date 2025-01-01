"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ChartDataPoint, MockDataSeries } from "../lib/risk-index/types";
import {
  fetchPolymarketData,
  fetchMetaculusData,
  generateMockData,
  emptyData,
} from "../lib/services";
import { PREDICTION_MARKETS } from "../lib/config";
import { LineGraph } from "../components/LineGraph";
import { combineDataSources } from "../lib/risk-index/combine";

export default function Home() {
  const [data, setData] = useState<MockDataSeries>(emptyData);
  const [mounted, setMounted] = useState(false);
  const [polymarketTimeSeries, setPolymarketTimeSeries] = useState<
    ChartDataPoint[]
  >([]);
  const [metaculusTimeSeries, setMetaculusTimeSeries] = useState<
    ChartDataPoint[]
  >([]);

  useEffect(() => {
    setMounted(true);

    // Load data from services
    fetchPolymarketData(PREDICTION_MARKETS.POLYMARKET.SLUG)
      .then((data) => {
        setPolymarketTimeSeries(data);
      })
      .catch((error) => {
        console.error("Error loading Polymarket data:", error);
      });

    fetchMetaculusData(PREDICTION_MARKETS.METACULUS.QUESTION_ID)
      .then((data) => {
        setMetaculusTimeSeries(data);
      })
      .catch((error) => {
        console.error("Error loading Metaculus data:", error);
      });

    // Set initial mock data for other charts
    setData({
      ...emptyData,
      riskIndex: generateMockData().riskIndex,
      variantCount: generateMockData().variantCount,
    });
  }, []);

  // Calculate combined risk index when either data source updates
  const riskIndex = useMemo(() => {
    // Only use mock data if we have no real data from either source
    if (polymarketTimeSeries.length === 0 && metaculusTimeSeries.length === 0) {
      console.log("No real data available, using mock risk index");
      return data.riskIndex;
    }

    // Otherwise combine the real data we have
    return combineDataSources(polymarketTimeSeries, metaculusTimeSeries);
  }, [polymarketTimeSeries, metaculusTimeSeries, data.riskIndex]);

  if (!mounted) return null;

  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen bg-gray-100 p-6 font-[family-name:var(--font-geist-sans)]">
      {/* Header */}
      <header className="mb-8 text-center max-w-6xl mx-auto w-full">
        <h1 className="text-4xl md:text-6xl font-bold text-black mb-4">
          Will H5N1 be a disaster?
        </h1>
        <p className="text-2xl text-gray-700 mb-4">
          [Probably not] - our risk index gives it [5 out of 100 (about 5%)]
        </p>
        <p className="text-xl text-gray-600">
          Real-time monitoring of avian flu data sources
        </p>
      </header>

      <main className="space-y-6 max-w-6xl mx-auto w-full">
        {/* Main Graph */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-black mb-4">
            H5N1 Risk Index
          </h2>
          <LineGraph
            data={riskIndex}
            color="#ef4444"
            label="Risk index value"
            formatValue={(v) => `${v.toFixed(1)}%`}
          />
        </div>

        {/* Grid of smaller graphs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-black mb-4">
              Another state declare a state of emergency over bird flu before
              February?
            </h2>
            <LineGraph
              data={polymarketTimeSeries}
              color="#3b82f6"
              label="Polymarket Prediction (%)"
              formatValue={(v) => `${v.toFixed(1)}%`}
            />
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-black mb-4">
              Will CDC report 10,000 or more H5 avian influenza cases in the
              United States before January 1, 2026?
            </h2>
            <LineGraph
              data={metaculusTimeSeries}
              color="#10b981"
              label="Metaculus Prediction (%)"
              formatValue={(v) => `${v.toFixed(1)}%`}
            />
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-black mb-4">
              Detected H5N1 Variants
            </h2>
            <LineGraph
              data={data.variantCount}
              color="#8b5cf6"
              label="Number of variants"
              formatValue={(v) => v.toString()}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-8 text-center text-gray-500 text-sm max-w-6xl mx-auto w-full">
        <div className="mb-8 p-6 bg-white rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-black mb-2">
            Stay Updated
          </h3>
          <p className="text-gray-600 mb-4">
            Get update H5N1 risk levels and other risk dashboards.
          </p>
          <form
            className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto"
            onSubmit={(e) => {
              e.preventDefault();
              const email = (e.target as HTMLFormElement).email.value;
              alert(`Thanks! We'll send updates to ${email}`);
              (e.target as HTMLFormElement).reset();
            }}
          >
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Subscribe
            </button>
          </form>
        </div>
        <div className="mb-8 text-gray-600">
          <p className="mb-2">
            If you want to vote for other things to be included in the index or
            to see other data sources on this site,{" "}
            <a
              href="#"
              className="text-blue-500 hover:text-blue-600 underline"
              onClick={(e) => {
                e.preventDefault();
                alert("Poll coming soon!");
              }}
            >
              please vote using this 2 minute poll
            </a>
          </p>
        </div>
        <p>Data is simulated for demonstration purposes</p>
        <p>Last updated: {mounted ? new Date().toLocaleDateString() : ""}</p>
      </footer>
    </div>
  );
}
