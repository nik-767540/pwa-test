"use client";

import { useEffect } from "react";

export default function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    const isVercel = window.location.hostname.endsWith("vercel.app");
    if (process.env.NODE_ENV !== "production" && !isVercel) {
      return;
    }

    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .then((registration) => registration.update())
      .catch((error) => {
        console.error("Service worker registration failed", error);
      });
  }, []);

  return null;
}
