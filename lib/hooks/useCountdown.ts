"use client";

import { useEffect, useState } from "react";
import { getTimeRemaining } from "@/lib/utils";

export function useCountdown(expiresAt: Date) {
  const [timeRemaining, setTimeRemaining] = useState(
    getTimeRemaining(expiresAt)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(getTimeRemaining(expiresAt));
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  return timeRemaining;
}
