import { NextResponse } from "next/server";
import { parse } from "papaparse";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CdcDataRow {
  Range: string;
  [key: string]: string;
}

export async function GET() {
  let browser;

  if (process.env.NODE_ENV === "development" && !process.env.CHROMIUM_PATH) {
    throw new Error(
      "CHROMIUM_PATH is not set in development mode. Please run `bun install:chromium` to install Chromium.",
    );
  }

  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath:
        process.env.NODE_ENV === "development"
          ? process.env.CHROMIUM_PATH
          : await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();

    await page.goto(
      "https://www.cdc.gov/bird-flu/php/avian-flu-summary/chart-epi-curve-ah5n1.html",
      { waitUntil: "domcontentloaded" },
    );

    await page.waitForSelector('.download-links a[download="data-table.csv"]');

    const csvData = await page.evaluate(async () => {
      const link = document.querySelector(
        '.download-links a[download="data-table.csv"]',
      );
      const blobUrl = link?.getAttribute("href");
      if (!blobUrl) throw new Error("Could not find download link");

      const response = await fetch(blobUrl);
      const blob = await response.blob();
      return await blob.text();
    });

    const { data } = parse<CdcDataRow>(csvData, {
      header: true,
      skipEmptyLines: true,
    });

    const filteredData = data.filter((row) => row.Range === "2020-2024");

    return NextResponse.json(filteredData, {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    console.error("Error fetching CDC data:", error);
    return NextResponse.json(
      { error: "Failed to fetch CDC data" },
      { status: 500 },
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
