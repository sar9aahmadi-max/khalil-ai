
export default async (request) => {
  if (request.method !== "POST") {
    return Response.json(
      { error: "Method not allowed" },
      { status: 405 }
    );
  }

  try {
    const { message } = await request.json();

    if (
      typeof message !== "string" ||
      !message.trim() ||
      message.length > 4000
    ) {
      return Response.json(
        { error: "Message is required (max 4000 characters)." },
        { status: 400 }
      );
    }

    const key = process.env.GEMINI_API_KEY;

    if (!key) {
      return Response.json(
        { error: "AI service is not configured." },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": key
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: message.trim()
            }]
          }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return Response.json(
        { error: "AI provider error. Check model access and API limits." },
        { status: 502 }
      );
    }

    const answer =
      data.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("") || "ما نجمتش نولّد إجابة.";

    return Response.json({ answer });

  } catch {
    return Response.json(
      { error: "Invalid request or server error." },
      { status: 500 }
    );
  }
};
