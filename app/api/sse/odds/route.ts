const BACKEND_SSE_URL = process.env.BACKEND_URL + "/sse/odds";
const KEEPALIVE_INTERVAL_MS = 30_000; // 30 seconds

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

  const backendReader = response.body.getReader();
  const encoder = new TextEncoder();

  // Sends a message to the browser every 30 seconds just to make sure that the SSE connection won't get shut down when idle for too long
  const stream = new ReadableStream({
    async start(controller) {
      // Send keep-alive comments on an interval so Railway doesn't time out
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": keepalive\n\n"));
        } catch {
          clearInterval(keepAlive);
        }
      }, KEEPALIVE_INTERVAL_MS);

      try {
        while (true) {
          const { done, value } = await backendReader.read();
          if (done) break;
          controller.enqueue(value);
        }
        controller.close();
      } catch (err) {
        // Client disconnected or backend dropped — close gracefully
        controller.close();
      } finally {
        clearInterval(keepAlive);
        backendReader.releaseLock();
      }
    },

    cancel() {
      abortController.abort();
      backendReader.cancel();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
