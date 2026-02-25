const BACKEND_SSE_URL = process.env.BACKEND_URL + "/sse/odds";

/**
 * SSE proxy route that forwards the odds event stream from the backend
 * to the client. Acts as a passthrough so the browser connects to the
 * Next.js server instead of directly to the backend.
 *
 * - Forwards the client's abort signal to the backend fetch so the
 *   upstream connection is cleaned up when the client disconnects.
 * - Returns a 502 if the backend connection fails or has no body.
 */
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
