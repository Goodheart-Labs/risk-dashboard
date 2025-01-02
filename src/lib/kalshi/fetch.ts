import crypto from "crypto";
import { config } from "./config";

export async function kalshiFetch(path: string, init: RequestInit = {}) {
  const timestamp = Date.now().toString();
  const method = init.method || "GET";

  const message = Buffer.from(timestamp + method + path, "utf-8");
  const key = crypto.createPrivateKey(config.privateKey);

  const signature = crypto
    .sign("sha256", message, {
      key,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
      saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST,
    })
    .toString("base64");

  const headers = {
    "KALSHI-ACCESS-KEY": config.accessKey,
    "KALSHI-ACCESS-SIGNATURE": signature,
    "KALSHI-ACCESS-TIMESTAMP": timestamp,
    "Content-Type": "application/json",
    ...init.headers,
  };

  const url = config.baseUrl + path;
  console.log("Fetching URL:", url);
  console.log("Headers:", headers);

  const response = await fetch(url, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Response error:", {
      status: response.status,
      statusText: response.statusText,
      body: errorText,
      url,
      headers: Object.fromEntries(response.headers),
    });
    throw new Error(`Kalshi API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}
