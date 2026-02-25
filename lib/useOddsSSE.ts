"use client";

import { useEffect, useState } from "react";

/**
 * Custom React hook that establishes a Server-Sent Events (SSE) connection
 * to the odds endpoint. Listens for "odds-update" events and returns
 * the latest array of fixture IDs that have been updated.
 *
 * The SSE connection is created once on mount and cleaned up on unmount
 * to prevent memory leaks.
 *
 * @returns {number[]} The most recently updated fixture IDs from the SSE stream.
 */
export function useOddsSSE() {
  // Store the ids that are sent by the sse to an array
  const [updatedFixtureIds, setUpdatedFixtureIds] = useState<number[]>([]);

  useEffect(() => {
    // Create a new Server-Sent Events connection to this endpoint
    const eventSource = new EventSource("/api/sse/odds");

    eventSource.addEventListener("odds-update", (event) => {
      // Convert the incoming JSON string into a JavaScript object
      const data = JSON.parse(event.data);
      setUpdatedFixtureIds(data.fixtureIds); // we set the lastUpdatedFixtureIds to the fixture that just got updated. Meaning, the fixture that we scraped the odds from
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

  // Return the latest array of fixtureIds so components using this hook can access it
  return updatedFixtureIds;
}