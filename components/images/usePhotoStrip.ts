"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent, MouseEvent } from "react";
import type { Photograph } from "@/lib/photographs";

export const wrap = (value: number, length: number) =>
  ((value % Math.max(1, length)) + Math.max(1, length)) % Math.max(1, length);
const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export function usePhotoStrip(photos: readonly Photograph[]) {
  const [active, setActive] = useState(0);
  const viewport = useRef<HTMLDivElement>(null);
  const cards = useRef(new Map<number, HTMLButtonElement>());
  const tick = useRef<() => void>(() => {});
  const motion = useRef({ position: 0, target: 0, direct: false, step: 500 });
  const ignoreClickUntil = useRef(0);
  const pointer = useRef<{
    id: number;
    x: number;
    y: number;
    lastPosition: number;
    time: number;
    origin: number;
    velocity: number;
    dragging: boolean;
  } | null>(null);
  const count = photos.length;

  const select = useCallback(
    (index: number, immediate = false) => {
      const state = motion.current;
      const distance =
        wrap(index - state.position + count / 2, count) - count / 2;
      state.target = state.position + distance;
      state.direct = false;
      // Large collection jumps (Home/End) crossfade rather than spinning past
      // dozens of photographs. Ordinary movement is always a bounded step.
      if (immediate || Math.abs(distance) > 2) state.position = state.target;
      setActive(wrap(index, count));
      tick.current();
    },
    [count],
  );

  const step = useCallback(
    (direction: number) => {
      select(Math.round(motion.current.position) + direction);
    },
    [select],
  );

  useEffect(() => {
    const root = viewport.current;
    if (!root) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let lastTime = 0;
    let wheelTimer: ReturnType<typeof setTimeout> | undefined;
    let width = root.clientWidth;
    let height = root.clientHeight;

    function paint(time: number) {
      frame = 0;
      const state = motion.current;
      const dt = Math.min(40, time - (lastTime || time - 16));
      lastTime = time;
      if (reduced.matches || state.direct) state.position = state.target;
      else
        state.position +=
          (state.target - state.position) * (1 - Math.exp(-dt / 82));
      const settled = Math.abs(state.target - state.position) < 0.001;
      if (settled) state.position = state.target;
      const mobile = width <= 700;
      const maxWidth = mobile ? width * 0.82 : Math.min(width * 0.53, 860);
      const maxHeight = mobile ? height * 0.82 : Math.min(height * 0.88, 680);
      state.step = mobile ? width * 0.78 : maxWidth * 0.82;
      for (const [index, element] of cards.current) {
        const photo = photos[index];
        const offset =
          wrap(index - state.position + count / 2, count) - count / 2;
        const distance = Math.abs(offset);
        const photoHeight = Math.min(
          maxHeight,
          (maxWidth * photo.height) / photo.width,
        );
        element.style.width = `${(photoHeight * photo.width) / photo.height}px`;
        element.style.height = `${photoHeight}px`;
        element.style.transform = `translate(-50%, -50%) translate3d(${offset * state.step}px, ${mobile ? 0 : distance ** 1.6 * 26}px, ${mobile ? 0 : -distance * 160 - distance ** 2 * 40}px) rotateY(${mobile ? 0 : clamp(-offset * 30, -65, 65)}deg) scale(${mobile ? 1 - Math.min(distance, 1) * 0.055 : 1})`;
        element.style.opacity = `${clamp((2.25 - distance) / 0.6, 0, 1)}`;
        element.style.filter = `brightness(${1 - Math.min(distance, 1.5) * (mobile ? 0.1 : 0.19)})`;
        element.style.zIndex = `${Math.round(100 - distance * 10)}`;
        element.style.pointerEvents = distance < 2 ? "auto" : "none";
      }
      if (!settled) frame = requestAnimationFrame(paint);
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(paint);
    }
    tick.current = schedule;
    function resize() {
      width = root!.clientWidth;
      height = root!.clientHeight;
      schedule();
    }
    function wheel(event: WheelEvent) {
      const horizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY);
      if (
        (!horizontal && !event.shiftKey) ||
        count < 2 ||
        document.querySelector(".photo-lightbox[open]")
      )
        return;
      const delta = horizontal ? event.deltaX : event.deltaY;
      if (!delta) return;
      event.preventDefault();
      const state = motion.current;
      const unit =
        event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? width : 1;
      state.direct = true;
      // Cap each wheel packet so a mouse/trackpad cannot launch a long spin.
      state.target += clamp(delta * unit, -160, 160) / state.step;
      setActive(wrap(Math.round(state.target), count));
      schedule();
      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => {
        state.direct = false;
        state.target = Math.round(state.target);
        setActive(wrap(state.target, count));
        schedule();
      }, 130);
    }
    const observer = new ResizeObserver(resize);
    observer.observe(root);
    root.addEventListener("wheel", wheel, { passive: false });
    reduced.addEventListener("change", schedule);
    resize();
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(wheelTimer);
      observer.disconnect();
      root.removeEventListener("wheel", wheel);
      reduced.removeEventListener("change", schedule);
      tick.current = () => {};
    };
  }, [count, photos]);

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || count < 2) return;
    pointer.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      origin: motion.current.position,
      lastPosition: motion.current.position,
      time: performance.now(),
      velocity: 0,
      dragging: false,
    };
  }
  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = pointer.current;
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!drag.dragging) {
      if (Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)) {
        pointer.current = null;
        return;
      }
      if (Math.abs(dx) < 7 || Math.abs(dx) < Math.abs(dy) * 1.15) return;
      drag.dragging = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      event.currentTarget.dataset.dragging = "true";
    }
    event.preventDefault();
    const state = motion.current;
    state.direct = true;
    state.target = drag.origin + clamp(-dx / state.step, -1.8, 1.8);
    const now = performance.now();
    drag.velocity =
      ((state.target - drag.lastPosition) / Math.max(16, now - drag.time)) *
      1000;
    drag.lastPosition = state.target;
    drag.time = now;
    setActive(wrap(Math.round(state.target), count));
    tick.current();
  }
  function finishPointer(event: PointerEvent<HTMLDivElement>) {
    const drag = pointer.current;
    if (!drag || event.pointerId !== drag.id) return;
    if (drag.dragging) {
      const state = motion.current;
      const freshVelocity =
        performance.now() - drag.time < 100 ? drag.velocity : 0;
      const projected = state.target + clamp(freshVelocity * 0.12, -0.35, 0.35);
      state.target = Math.round(
        clamp(projected, drag.origin - 2, drag.origin + 2),
      );
      state.direct = false;
      setActive(wrap(state.target, count));
      ignoreClickUntil.current = performance.now() + 300;
      delete event.currentTarget.dataset.dragging;
      tick.current();
      if (event.currentTarget.hasPointerCapture(event.pointerId))
        event.currentTarget.releasePointerCapture(event.pointerId);
    }
    pointer.current = null;
  }
  function onClickCapture(event: MouseEvent<HTMLDivElement>) {
    if (performance.now() < ignoreClickUntil.current) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  return {
    active,
    viewport,
    cards,
    select,
    step,
    refresh: () => tick.current(),
    onPointerDown,
    onPointerMove,
    finishPointer,
    onClickCapture,
  };
}
