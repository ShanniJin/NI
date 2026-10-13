"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Scene = "hero" | "recent" | "camera" | "practice" | "wall" | "ending";
type Reveal = readonly [selector: string, start: number, end: number];

// Small offsets preserve the final collage; only the order of arrival changes.
const reveals: Record<Scene, readonly Reveal[]> = {
  hero: [],
  recent: [
    [".note-feature", 0, 0.2],
    [".note-photo", 0.2, 0.45],
    [".note-text", 0.42, 0.68],
    [".note-fragment", 0.62, 0.86],
  ],
  camera: [
    [".camera-aside .photo:first-child", 0.3, 0.58],
    [".camera-aside .photo:last-child", 0.52, 0.8],
  ],
  practice: [
    [".practice-grid > div:last-child > .eyebrow", 0.12, 0.32],
    [".practice-grid h3", 0.22, 0.46],
    [".practice-grid p", 0.36, 0.62],
    [".practice-grid .annotation", 0.58, 0.82],
    [".practice-grid .tree", 0.64, 0.86],
  ],
  wall: [
    [".visitor", 0.08, 0.3],
    [".wall-photo", 0.24, 0.48],
    [".wall-tree", 0.4, 0.64],
    [".wall-sun", 0.54, 0.76],
    [".craving", 0.66, 0.9],
  ],
  ending: [],
};

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const ease = (value: number) => value * value * (3 - 2 * value);

export function HomeScene({
  scene,
  label,
  id,
  children,
}: {
  scene: Scene;
  label: string;
  id?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = ref.current;
    if (!section || scene === "ending") return;
    const stage = section.querySelector<HTMLElement>(".scene-stage")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = window.matchMedia(
      "(min-width: 1001px) and (min-height: 700px)",
    );
    const items = reveals[scene].flatMap(([selector, start, end]) =>
      Array.from(section.querySelectorAll<HTMLElement>(selector)).map(
        (element) => ({ element, start, end }),
      ),
    );
    let frame = 0;
    let observer: IntersectionObserver | undefined;
    let mode: "desktop" | "mobile" | "still" = "still";

    function clear() {
      observer?.disconnect();
      section!.style.removeProperty("--chapter-exit");
      section!.style.removeProperty("--chapter-crop");
      for (const { element } of items) {
        element.style.removeProperty("--chapter-reveal");
        delete element.dataset.sceneItem;
        delete element.dataset.entered;
      }
    }

    function update() {
      frame = 0;
      if (mode !== "desktop") return;
      const rect = section!.getBoundingClientRect();
      // The progress range is precisely the native sticky hold, with a pause
      // at its end before the composition leaves with the document flow.
      const progress = clamp(
        -rect.top / Math.max(1, rect.height - stage.offsetHeight),
      );
      const exit = ease(clamp((progress - 0.28) / 0.66));
      section!.style.setProperty("--chapter-exit", exit.toFixed(4));
      section!.style.setProperty(
        "--chapter-crop",
        (1 - ease(progress)).toFixed(4),
      );
      for (const { element, start, end } of items) {
        const value = ease(clamp((progress - start) / (end - start)));
        element.style.setProperty("--chapter-reveal", value.toFixed(4));
      }
    }

    function schedule() {
      if (!frame && mode === "desktop")
        frame = window.requestAnimationFrame(update);
    }

    function configure() {
      clear();
      mode = reduced.matches ? "still" : desktop.matches ? "desktop" : "mobile";
      section!.dataset.motion = mode;
      // At zoomed/short viewport sizes, allow the full composition to flow
      // rather than pinning content taller than the visible screen.
      if (mode === "desktop" && stage.offsetHeight > window.innerHeight + 2) {
        mode = "still";
        section!.dataset.motion = mode;
      }
      if (mode === "still") return;
      for (const { element } of items) element.dataset.sceneItem = "";
      if (mode === "desktop") {
        update();
      } else {
        observer = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (entry.isIntersecting) {
                (entry.target as HTMLElement).dataset.entered = "true";
                observer?.unobserve(entry.target);
              }
            }
          },
          { threshold: 0.08 },
        );
        for (const { element } of items) {
          element.dataset.entered = "false";
          observer.observe(element);
        }
      }
    }

    configure();
    const resize = new ResizeObserver(configure);
    resize.observe(stage);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", configure);
    reduced.addEventListener("change", configure);
    desktop.addEventListener("change", configure);
    return () => {
      window.cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", configure);
      reduced.removeEventListener("change", configure);
      desktop.removeEventListener("change", configure);
      clear();
      delete section.dataset.motion;
    };
  }, [scene]);

  return (
    <section
      ref={ref}
      id={id}
      className={`home-scene home-scene--${scene}`}
      aria-label={label}
    >
      <div className="scene-stage">{children}</div>
    </section>
  );
}
