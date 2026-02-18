"use client";

import { useEffect, useState } from "react";

// Returns a counter that increments every interval, triggering refetches
export function useOddsPolling(intervalMs: number = 60000) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setTick((prev) => prev + 1);
    }, intervalMs);

    return () => clearInterval(id);
  }, [intervalMs]);

  return tick;
}