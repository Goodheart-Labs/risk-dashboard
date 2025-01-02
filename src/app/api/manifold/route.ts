const MANIFOLD_API = "https://api.manifold.markets/v0";

export async function GET(request: Request) {
  try {
    // Get slug from URL params
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return Response.json(
        { error: "Market slug is required" },
        { status: 400 },
      );
    }

    const marketResponse = await fetch(`${MANIFOLD_API}/slug/${slug}`, {
      headers: {
        Accept: "application/json",
      },
    });

    // Add debugging for response status and details
    console.log("Response status:", marketResponse.status);
    console.log(
      "Response headers:",
      Object.fromEntries(marketResponse.headers.entries()),
    );

    if (!marketResponse.ok) {
      const errorText = await marketResponse.text();
      console.error("Error response body:", errorText);

      return Response.json(
        {
          error: "Failed to fetch Manifold market data",
          status: marketResponse.status,
          details: errorText,
        },
        { status: marketResponse.status },
      );
    }

    const marketData = await marketResponse.json();
    return Response.json(marketData);
  } catch (error) {
    console.error("Error fetching Manifold market data:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
