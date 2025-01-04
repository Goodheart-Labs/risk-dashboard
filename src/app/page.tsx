"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ChartDataPoint } from "../lib/risk-index/types";
import {
  fetchPolymarketData,
  fetchMetaculusData,
  fetchKalshiData,
  fetchCdcData,
} from "../lib/services";
import { PREDICTION_MARKETS } from "../lib/config";
import { LineGraph } from "../components/LineGraph";
import { combineDataSources } from "../lib/risk-index/combine";
import { getProbabilityWord, getProbabilityColor } from "@/lib/probabilities";
import { format } from "date-fns";
import { BarGraph } from "@/components/BarGraph";
import { LinkIcon } from "lucide-react";

function GraphTitle({
  title,
  sourceUrl,
}: {
  title: string;
  sourceUrl?: string;
}) {
  return (
    <div className="mb-2 grid gap-1">
      <div className="flex items-start gap-2">
        <h2 className="text-pretty text-xl font-semibold tracking-tight">
          {title}
        </h2>
        {sourceUrl ? (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 opacity-30 hover:opacity-60"
          >
            <LinkIcon className="h-3 w-3" />
          </a>
        ) : null}
      </div>
    </div>
  );
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [polymarketTimeSeries, setPolymarketTimeSeries] = useState<
    ChartDataPoint[]
  >([]);
  const [metaculusTimeSeries, setMetaculusTimeSeries] = useState<
    ChartDataPoint[]
  >([]);
  const [kalshiDelayTravel, setKalshiDelayTravel] = useState<ChartDataPoint[]>(
    [],
  );
  const [cdcTimeSeries, setCdcTimeSeries] = useState<ChartDataPoint[]>([]);
  const [kalshiCases, setKalshiCases] = useState<ChartDataPoint[]>([]);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

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

    // Kalshi delay travel
    fetchKalshiData({
      marketTicker: "KXCDCTRAVELH5-26-3",
      seriesTicker: "KXCDCTRAVELH5",
      marketId: "d02240fe-5c63-4378-885f-97657e90b783",
    })
      .then(setKalshiDelayTravel)
      .catch((error) => {
        console.error("Error loading Kalshi data:", error);
      });

    fetchCdcData()
      .then(setCdcTimeSeries)
      .catch((error) => {
        console.error("Error loading CDC data:", error);
      });

    fetchKalshiData({
      marketTicker: "KXH5N1CASES-25-1000",
      seriesTicker: "KXH5N1CASES",
      marketId: "bc856764-877e-4c4d-8c3c-82f497e0bc07",
    })
      .then(setKalshiCases)
      .catch((error) => {
        console.error("Error loading Kalshi cases data:", error);
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

  useEffect(() => {
    fetch("/api/cdc-data")
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
      });
  }, []);

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
          <GraphTitle title="H5N1 Risk Index" />
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
            <GraphTitle
              title="Another state declare a state of emergency over bird flu before February?"
              sourceUrl="https://polymarket.com/event/another-state-declare-a-state-of-emergency-over-bird-flu-before-february"
            />
            <LineGraph
              data={polymarketTimeSeries}
              color="#3b82f6"
              label="Polymarket Prediction (%)"
              formatValue={(v) => `${v.toFixed(1)}%`}
            />
          </div>

          <div className="rounded-lg bg-white p-6 shadow-lg">
            <GraphTitle
              title="Will CDC report 10,000 or more H5 avian influenza cases in the United States before January 1, 2026?"
              sourceUrl="https://www.metaculus.com/questions/30960/?sub-question=30732"
            />
            <LineGraph
              data={metaculusTimeSeries}
              color="#10b981"
              label="Metaculus Prediction (%)"
              formatValue={(v) => `${v.toFixed(1)}%`}
            />
          </div>

          <div className="rounded-lg bg-white p-6 shadow-lg">
            <GraphTitle
              title="Will the CDC recommend delaying non-essential travel due to H5 bird flu before 2026?"
              sourceUrl="https://kalshi.com/markets/kxcdctravelh5/avian-flu-travel-warning"
            />
            <LineGraph
              data={kalshiDelayTravel}
              color="#8b5cf6"
              label="Kalshi Prediction (%)"
              formatValue={(v) => `${v.toFixed(1)}%`}
              tooltipLabelFormatter={(date) =>
                format(new Date(date), "MM/dd ha")
              }
            />
          </div>

          <div className="rounded-lg bg-white p-6 shadow-lg">
            <GraphTitle
              title="Above 1000 Bird Flu (H5N1) cases this year?"
              sourceUrl="https://kalshi.com/markets/kxh5n1cases/h5n1-cases"
            />
            <LineGraph
              data={kalshiCases}
              color="#8b5cf6"
              label="Kalshi Prediction (%)"
              formatValue={(v) => `${v.toFixed(1)}%`}
              tooltipLabelFormatter={(date) =>
                format(new Date(date), "MM/dd ha")
              }
            />
          </div>

          <div className="col-span-full rounded-lg bg-white p-6 shadow-lg">
            <GraphTitle
              title="Monthly H5N1 Cases Worldwide"
              sourceUrl="https://www.cdc.gov/bird-flu/php/avian-flu-summary/chart-epi-curve-ah5n1.html"
            />
            <BarGraph
              data={cdcTimeSeries}
              color="#f97316"
              label="Cases"
              formatValue={(v) => v.toString()}
              tickFormatter={(date) => format(new Date(date), "MMM ''yy")}
              tooltipLabelFormatter={(date) =>
                format(new Date(date), "MMMM yyyy")
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
            onSubmit={async (e) => {
              e.preventDefault();
              const email = (e.target as HTMLFormElement).email.value;

              try {
                const res = await fetch("/api/email", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email }),
                });

                if (!res.ok) throw new Error();

                setSubmitStatus("success");
                (e.target as HTMLFormElement).reset();
              } catch {
                setSubmitStatus("error");
              }
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
          {submitStatus === "success" && (
            <p className="mt-2 text-green-600">
              Thanks! We&apos;ll send you updates.
            </p>
          )}
          {submitStatus === "error" && (
            <p className="mt-2 text-red-600">
              Something went wrong. Please try again.
            </p>
          )}
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
