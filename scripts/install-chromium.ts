import { execSync } from "child_process";
import { chmodSync, writeFileSync } from "fs";
import { join } from "path";
import fs from "fs";

async function installChromium() {
  try {
    // Install Chromium using Playwright
    console.log("Installing Chromium...");
    execSync("bunx --bun playwright install chromium", {
      stdio: "inherit",
      env: {
        ...process.env,
        PLAYWRIGHT_BROWSERS_PATH: ".local-browsers",
      },
    });

    // Get the installed version by running playwright CLI
    const versionOutput = execSync("bunx --bun playwright --version", {
      encoding: "utf8",
    });
    console.log("Version output:", versionOutput);

    console.log("Finding Chromium executable...");
    const chromePath = execSync("find .local-browsers -name Chromium -type f", {
      encoding: "utf8",
    }).trim();

    if (!chromePath) {
      throw new Error("Could not find Chromium executable");
    }

    // Make executable
    console.log("Setting permissions...");
    chmodSync(chromePath, "755");

    // Write path to .env.local
    console.log("Updating .env.local...");
    const envPath = join(process.cwd(), ".env.local");
    const chromiumEnvVar = `CHROMIUM_PATH=${chromePath}`;

    try {
      const currentEnv = fs.readFileSync(envPath, "utf8");
      const updatedEnv = currentEnv.includes("CHROMIUM_PATH=")
        ? currentEnv.replace(/CHROMIUM_PATH=.*$/m, chromiumEnvVar)
        : `${currentEnv}\n${chromiumEnvVar}`;
      writeFileSync(envPath, updatedEnv);
    } catch {
      writeFileSync(envPath, chromiumEnvVar);
    }

    console.log("✅ Chromium installed successfully!");
    console.log(`Path: ${chromePath}`);
  } catch (error) {
    console.error("❌ Installation failed:", error);
    process.exit(1);
  }
}

installChromium();
