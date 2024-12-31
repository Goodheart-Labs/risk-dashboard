import { NextResponse } from "next/server";
import { launchChromium } from "playwright-aws-lambda";
import { parse } from "papaparse";

export const runtime = "nodejs"; // Switch to Node runtime
export const dynamic = "force-dynamic"; // Disable static generation

export async function GET() {
  let browser;
  try {
    // Launch browser
    browser = await launchChromium({
      chromiumSandbox: false, // Required for some serverless environments
      headless: true, // Ensure headless mode is enabled
    });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Navigate to the CDC page
    await page.goto(
      "https://www.cdc.gov/bird-flu/php/avian-flu-summary/chart-epi-curve-ah5n1.html",
      { waitUntil: "domcontentloaded" }
    );

    // Wait for the download link to be available
    await page.waitForSelector('.download-links a[download="data-table.csv"]');

    // Get the blob URL
    const csvData = await page.evaluate(async () => {
      const link = document.querySelector(
        '.download-links a[download="data-table.csv"]'
      );
      const blobUrl = link?.getAttribute("href");
      if (!blobUrl) throw new Error("Could not find download link");

      // Fetch the blob data
      const response = await fetch(blobUrl);
      const blob = await response.blob();

      // Convert blob to text
      return await blob.text();
    });

    // Parse CSV data using papaparse
    const { data } = parse(csvData, {
      header: true,
      skipEmptyLines: true,
    });

    // Return JSON
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    console.error("Error fetching CDC data:", error);
    return NextResponse.json(
      { error: "Failed to fetch CDC data" },
      { status: 500 }
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
