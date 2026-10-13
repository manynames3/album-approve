"use client";

import { useEffect, useRef, type ReactNode } from "react";

type ScrollcraftInstance = { destroy(): void; layout(): void };
type ScrollcraftEngine = {
  mount(root: HTMLElement): ScrollcraftInstance;
  instances: ScrollcraftInstance[];
};
declare global {
  interface Window {
    ScrollCraft?: ScrollcraftEngine;
  }
}

export function ScrollcraftRuntime({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = root.current;
    if (!node || !("CSSScopeRule" in window)) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let stop = () => {};

    function start() {
      stop();
      if (!node) return;
      node.dataset.motion = motion.matches ? "static" : "active";
      let disposed = false;
      let instance: ScrollcraftInstance | undefined;
      let resize: ResizeObserver | undefined;
      const abort = new AbortController();
      const script = document.createElement("script");
      const style = document.createElement("style");
      style.dataset.albumScrollcraft = "";
      const snapshots = Array.from(
        node.querySelectorAll<HTMLElement>(
          "[data-sc-act], [data-sc-parallax], [data-sc-reveal], [data-sc-in], [data-sc-tilt]",
        ),
      ).map((el) => ({
        el,
        style: el.getAttribute("style"),
        className: el.className,
      }));

      stop = () => {
        disposed = true;
        abort.abort();
        resize?.disconnect();
        instance?.destroy();
        script.remove();
        style.remove();
        for (const snapshot of snapshots) {
          if (snapshot.style === null) snapshot.el.removeAttribute("style");
          else snapshot.el.setAttribute("style", snapshot.style);
          snapshot.el.className = snapshot.className;
        }
        node.dataset.motion = "static";
        node.dataset.scrollcraft = "static";
      };

      // Keep upstream bytes intact and contain its CSS resets inside this route.
      script.src = "/vendor/scrollcraft/scrollcraft.js";
      script.async = true;
      script.onload = async () => {
        if (disposed) return;
        try {
          const response = await fetch("/vendor/scrollcraft/scrollcraft.css", {
            signal: abort.signal,
          });
          if (!response.ok) throw new Error("Scrollcraft CSS unavailable");
          const css = await response.text();
          if (disposed) return;
          style.textContent = `@scope ([data-album-marketing]) { ${css} }`;
          document.head.append(style);
          instance = window.ScrollCraft?.mount(node);
          if (!instance) throw new Error("Scrollcraft engine unavailable");
          node.dataset.scrollcraft = "ready";
          resize = new ResizeObserver(() => instance?.layout());
          resize.observe(node);
        } catch {
          if (!disposed) stop();
        }
      };
      script.onerror = () => stop();
      document.head.append(script);
    }

    start();
    motion.addEventListener("change", start);
    return () => {
      motion.removeEventListener("change", start);
      stop();
    };
  }, []);

  return (
    <div
      ref={root}
      className={className}
      data-album-marketing
      data-motion="static"
      data-scrollcraft="static"
    >
      {children}
    </div>
  );
}
