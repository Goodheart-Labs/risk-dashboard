"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ChartDataPoint } from "../lib/risk-index/types";
import {
  fetchPolymarketData,
  fetchMetaculusData,
  fetchKalshiData,
} from "../lib/services";
import { PREDICTION_MARKETS } from "../lib/config";
import { LineGraph } from "../components/LineGraph";
import { combineDataSources } from "../lib/risk-index/combine";
import { getProbabilityWord, getProbabilityColor } from "@/lib/probabilities";
import { format } from "date-fns";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [polymarketTimeSeries, setPolymarketTimeSeries] = useState<
    ChartDataPoint[]
  >([]);
  const [metaculusTimeSeries, setMetaculusTimeSeries] = useState<
    ChartDataPoint[]
  >([]);
  const [kalshiTimeSeries, setKalshiTimeSeries] = useState<ChartDataPoint[]>(
    [],
  );

  useEffect(() => {
    setMounted(true);

    // Load data from services
    fetchPolymarketData(PREDICTION_MARKETS.POLYMARKET.SLUG)
      .then(setPolymarketTimeSeries)
      .catch((error) => {
        console.error("Error loading Polymarket data:", error);
      });

    fetchMetaculusData(PREDICTION_MARKETS.METACULUS.QUESTION_ID)
      .then(setMetaculusTimeSeries)
      .catch((error) => {
        console.error("Error loading Metaculus data:", error);
      });

    fetchKalshiData()
      .then(setKalshiTimeSeries)
      .catch((error) => {
        console.error("Error loading Kalshi data:", error);
      });
  }, []);

  // Calculate combined risk index when either data source updates
  const riskIndex = useMemo(() => {
    // Only use mock data if we have no real data from either source
    if (polymarketTimeSeries.length === 0 && metaculusTimeSeries.length === 0) {
      console.log("No real data available, using mock risk index");
      return [];
    }

    // Otherwise combine the real data we have
    return combineDataSources(polymarketTimeSeries, metaculusTimeSeries);
  }, [polymarketTimeSeries, metaculusTimeSeries]);

  if (!mounted) return null;

  return (
    <div className="grid min-h-screen grid-rows-[auto_1fr_auto] bg-gray-100 p-6 font-[family-name:var(--font-geist-sans)]">
      <header className="mx-auto mb-8 w-full max-w-6xl text-center">
        <h1 className="my-4 text-4xl font-bold text-black md:text-6xl">
          Will H5N1 be a disaster?
        </h1>
        <p className="mb-4 text-2xl text-gray-700">
          {riskIndex.length > 0 ? (
            <>
              <span
                className={getProbabilityColor(
                  riskIndex[riskIndex.length - 1].value / 100,
                )}
              >
                {getProbabilityWord(
                  riskIndex[riskIndex.length - 1].value / 100,
                )}
              </span>{" "}
              - our risk index gives it{" "}
              {riskIndex[riskIndex.length - 1].value.toFixed(1)} out of 100
              (about {riskIndex[riskIndex.length - 1].value.toFixed(1)}%)
            </>
          ) : (
            "Loading risk assessment..."
          )}
        </p>
        <p className="text-xl text-gray-600">
          Real-time monitoring of avian flu data sources
        </p>
      </header>

      <main className="mx-auto w-full max-w-6xl space-y-6">
        <div className="rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-2xl font-bold text-black">
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
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-pretty text-xl font-semibold tracking-tight">
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

          <div className="rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-pretty text-xl font-semibold tracking-tight">
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

          <div className="col-span-full rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-bold text-black">
              Will the CDC recommend delaying non-essential travel due to H5
              bird flu before 2026?
            </h2>
            <LineGraph
              data={kalshiTimeSeries}
              color="#8b5cf6"
              label="Kalshi Prediction (%)"
              formatValue={(v) => `${v.toFixed(1)}%`}
              tooltipLabelFormatter={(date) =>
                format(new Date(date), "MM/dd ha")
              }
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mx-auto mt-8 w-full max-w-6xl text-center text-sm text-gray-500">
        <div className="mb-8 rounded-lg bg-white p-6 shadow-lg">
          <h3 className="mb-2 text-lg font-semibold text-black">
            Stay Updated
          </h3>
          <p className="mb-4 text-gray-600">
            Get update H5N1 risk levels and other risk dashboards.
          </p>
          <form
            className="mx-auto flex max-w-md flex-col gap-2 sm:flex-row"
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
              className="flex-1 rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              className="rounded-md bg-blue-500 px-6 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="text-blue-500 underline hover:text-blue-600"
              onClick={(e) => {
                e.preventDefault();
                alert("Poll coming soon!");
              }}
            >
              please vote using this 2 minute poll
            </a>
          </p>
        </div>
        {/* <p>Data is simulated for demonstration purposes</p> */}
        <p>Last updated: {mounted ? new Date().toLocaleDateString() : ""}</p>
      </footer>
    </div>
  );
}
