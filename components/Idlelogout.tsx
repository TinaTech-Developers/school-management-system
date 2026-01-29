"use client";

import { signOut } from "next-auth/react";
import { useEffect, useRef } from "react";

const IDLE_TIME = 30 * 60 * 1000; // 30 minutes

export default function IdleLogout() {
  const timer = useRef<number | null>(null);

  const resetTimer = () => {
    if (timer.current) {
      window.clearTimeout(timer.current);
    }

    timer.current = window.setTimeout(() => {
      signOut({ callbackUrl: "/login" });
    }, IDLE_TIME);
  };

  useEffect(() => {
    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
    ];

    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer(); // start timer immediately

    return () => {
      if (timer.current) {
        window.clearTimeout(timer.current);
      }

      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, []);

  return null;
}
