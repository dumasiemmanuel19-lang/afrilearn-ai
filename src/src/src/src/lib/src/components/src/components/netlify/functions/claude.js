// Netlify serverless function.
// Keeps the real Anthropic API key on the server — it is never sent to
// the browser. The frontend calls /.netlify/functions/claude instead of
// api.anthropic.com directly.

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: "Server is missing ANTHROPIC_API_KEY. Set it in your Netlify site's environment variables.",
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: "Invalid JSON body" };
  }

  const { messages, system, max_tokens } = payload;
  if (!Array.isArray(messages) || messages.length === 0) {
    return { statusCode: 400, body: "messages array is required" };
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        // Pick whichever current model fits your budget/quality needs.
        model: "claude-sonnet-5",
        max_tokens: Math.min(max_tokens || 1024, 4096),
        system,
        messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify(data),
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}
