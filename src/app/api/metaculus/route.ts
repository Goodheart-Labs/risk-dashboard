const METACULUS_API = "https://www.metaculus.com/api2";

export async function GET(request: Request) {
  try {
    // Get questionId from URL params
    const { searchParams } = new URL(request.url);
    const questionId = searchParams.get("questionId");

    if (!questionId) {
      return Response.json(
        { error: "Question ID is required" },
        { status: 400 },
      );
    }

    const questionResponse = await fetch(
      `${METACULUS_API}/questions/${questionId}`,
      {
        headers: {
          Accept: "application/json",
        },
      },
    );

    // Add debugging for response status and details
    console.log("Response status:", questionResponse.status);
    console.log(
      "Response headers:",
      Object.fromEntries(questionResponse.headers.entries()),
    );

    if (!questionResponse.ok) {
      const errorText = await questionResponse.text();
      console.error("Error response body:", errorText);

      return Response.json(
        {
          error: "Failed to fetch Metaculus data",
          status: questionResponse.status,
          details: errorText,
        },
        { status: questionResponse.status },
      );
    }

    const questionData = await questionResponse.json();
    return Response.json(questionData);
  } catch (error) {
    console.error("Error fetching Metaculus data:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
