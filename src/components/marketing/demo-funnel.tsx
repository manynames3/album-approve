"use client";

import { useEffect, useRef } from "react";
import { recordDemoProofVisitAction } from "@/app/actions/demo-funnel";

export function DemoFunnel() {
  const recorded = useRef(false);

  useEffect(() => {
    if (
      navigator.doNotTrack === "1" ||
      (navigator as Navigator & { globalPrivacyControl?: boolean })
        .globalPrivacyControl
    )
      return;
    function record() {
      if (document.visibilityState !== "visible" || recorded.current) return;
      recorded.current = true;
      void recordDemoProofVisitAction().catch(() => {});
    }
    record();
    document.addEventListener("visibilitychange", record);
    return () => document.removeEventListener("visibilitychange", record);
  }, []);

  return null;
}
