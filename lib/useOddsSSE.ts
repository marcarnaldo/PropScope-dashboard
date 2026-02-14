"use client";

import { useEffect, useState } from "react";

export function useOddsSSE() {
  // Create state to store the latest fixtureId received from SSE
  const [lastUpdate, setLastUpdate] = useState<number | null>(null); // It starts as null

  useEffect(() => {
    // Create a new Server-Sent Events connection to this endpoint
    const eventSource = new EventSource("/api/sse/odds"); // This is how next.js work, any folder under the app becomes a route

    eventSource.addEventListener("odds-update", (event) => {
      // Convert the incoming JSON string into a JavaScript object
      const data = JSON.parse(event.data); // Example of the parsed JSON {data: 19023231}
      setLastUpdate(data.fixtureId); // we set the lastUpdated to the fixture that just got updated. Meaning, the fixture that we scraped the odds from
    });

    // If there is an error with the connection
    eventSource.onerror = () => {
      // Close the SSE connection
      eventSource.close();
    };

    // Cleanup function
    // Runs when the component unmounts
    return () => {
      // Close the SSE connection to prevent memory leaks
      eventSource.close();
    };
  }, []); // Empty dependency array means this effect runs only once (on mount) because useEffect always runs on mount

  // Return the latest fixtureId so components using this hook can access it
  return lastUpdate;
}
