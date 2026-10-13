"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import styles from "./gallery-landing.module.css";

export function RevisionComparison() {
  const frame = useRef<HTMLDivElement>(null);
  const [manual, setManual] = useState(false);
  return (
    <div className={styles.comparison}>
      <div className={styles.compareFrame} ref={frame} data-manual={manual}>
        <div className={styles.before}>
          <Image
            src="/demo/maya-liam/ceremony.webp"
            alt="Draft ceremony spread before the requested image replacement"
            width={1774}
            height={887}
            unoptimized
            loading="lazy"
          />
          <span className={styles.staticLabel}>Draft export</span>
        </div>
        <div
          className={styles.after}
          data-sc-reveal="left"
          data-sc-reveal-at="0.22 0.58"
        >
          <Image
            src="/demo/maya-liam/portraits.webp"
            alt="Portraits spread uploaded as the requested replacement"
            width={1774}
            height={887}
            unoptimized
            loading="lazy"
          />
          <span className={styles.staticLabel}>Replacement export</span>
        </div>
      </div>
      <div className={styles.compareControls}>
        <span>Draft</span>
        <label className={styles.rangeLabel}>
          <span className="sr-only">Compare draft and replacement exports</span>
          <input
            type="range"
            min="0"
            max="100"
            defaultValue="50"
            aria-label="Compare draft and replacement exports"
            onFocus={(event) => {
              setManual(true);
              frame.current?.style.setProperty(
                "--manual-reveal",
                `${event.currentTarget.value}%`,
              );
            }}
            onChange={(event) => {
              setManual(true);
              frame.current?.style.setProperty(
                "--manual-reveal",
                `${event.target.value}%`,
              );
            }}
          />
        </label>
        <span>Replacement</span>
      </div>
    </div>
  );
}
