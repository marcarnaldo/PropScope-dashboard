const BACKEND_SSE_URL = process.env.BACKEND_URL + "/sse/odds";

export async function GET(request: Request) {
  const abortController = new AbortController();

  // When the client disconnects, abort the backend fetch
  request.signal.addEventListener("abort", () => {
    abortController.abort();
  });

  const response = await fetch(BACKEND_SSE_URL, {
    headers: {
      Accept: "text/event-stream",
    },
    signal: abortController.signal,
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
