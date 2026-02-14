const BACKEND_SSE_URL = process.env.BACKEND_URL + "/sse/odds";

export async function GET() {
  const response = await fetch(BACKEND_SSE_URL, {
    headers: {
      Accept: "text/event-stream",
    },
  });

  if (!response.ok || !response.body) {
    return new Response("Failed to connect to SSE backend", { status: 502 });
  }

  return new Response(response.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
