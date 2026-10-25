"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Photograph } from "@/lib/photographs";
import { usePhotoStrip, wrap } from "./usePhotoStrip";

function Arrow({ direction }: { direction: "previous" | "next" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={
        direction === "previous" ? { transform: "rotate(180deg)" } : undefined
      }
    >
      <path
        d="M4 12h15m-6-6 6 6-6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  );
}
const number = (value: number) => String(value).padStart(2, "0");

export function PhotoGallery({ photos }: { photos: readonly Photograph[] }) {
  const strip = usePhotoStrip(photos);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [backdrop, setBackdrop] = useState<{
    current: number;
    previous: number | null;
  }>({ current: 0, previous: null });
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const open = lightbox !== null;
  const activePhoto = photos[strip.active];
  const lightboxPhoto = lightbox === null ? null : photos[lightbox];

  useEffect(() => {
    setBackdrop((previous) =>
      previous.current === strip.active
        ? previous
        : { current: strip.active, previous: previous.current },
    );
    const timer = setTimeout(
      () => setBackdrop((previous) => ({ ...previous, previous: null })),
      750,
    );
    return () => clearTimeout(timer);
  }, [strip.active]);

  useEffect(() => {
    if (!open || !dialog.current) return;
    const element = dialog.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    element.showModal();
    return () => {
      element.close();
      document.body.style.overflow = previousOverflow;
      const activeCard =
        strip.viewport.current?.querySelector<HTMLButtonElement>(
          '.gallery-card[aria-current="true"]',
        );
      if (opener.current?.matches(".gallery-card") && activeCard)
        activeCard.focus({ preventScroll: true });
      else if (opener.current?.isConnected)
        opener.current.focus({ preventScroll: true });
      else strip.viewport.current?.focus({ preventScroll: true });
    };
  }, [open, strip.viewport]);

  useEffect(() => {
    // Rove keyboard focus with the selected card. Enter must open the photo
    // the user just navigated to, rather than the now-adjacent old button.
    if (!open && document.activeElement?.matches(".gallery-card")) {
      strip.viewport.current
        ?.querySelector<HTMLButtonElement>('.gallery-card[aria-current="true"]')
        ?.focus({ preventScroll: true });
    }
  }, [strip.active, open, strip.viewport]);

  function openPhoto(index: number) {
    opener.current = document.activeElement as HTMLElement | null;
    strip.select(index);
    setLightbox(index);
  }
  function lightboxStep(direction: number) {
    const next = wrap((lightbox ?? strip.active) + direction, photos.length);
    strip.select(next);
    setLightbox(next);
  }

  if (!activePhoto)
    return (
      <div className="image-gallery-page">
        <p>No photographs in this collection yet.</p>
      </div>
    );
  // Only nearby cards mount for larger collections; there are no duplicate
  // accessible slides, cloned Framer assets, or up-front full-library loads.
  const visible =
    photos.length <= 7
      ? photos.map((photo, index) => ({ photo, index }))
      : Array.from({ length: 7 }, (_, offset) => {
          const index = wrap(strip.active + offset - 3, photos.length);
          return { photo: photos[index], index };
        });

  return (
    <div className="image-gallery-page">
      <div className="gallery-atmosphere" aria-hidden="true">
        {[backdrop.previous, backdrop.current].map(
          (index, layer) =>
            index !== null &&
            photos[index] && (
              <Image
                key={photos[index].id}
                src={photos[index].src}
                alt=""
                fill
                sizes="100vw"
                quality={60}
                className={
                  layer === 1 ? "atmosphere-current" : "atmosphere-previous"
                }
                priority
              />
            ),
        )}
        <div className="atmosphere-shade" />
      </div>
      <div className="gallery-kicker">
        <span className="eyebrow">FROM THE CAMERA</span>
        <span className="gallery-collection">
          A collection of light, texture, and place
        </span>
      </div>
      <div
        className="photo-carousel"
        role="region"
        aria-roledescription="carousel"
        aria-label="Photographs"
      >
        <div
          ref={strip.viewport}
          className="gallery-viewport"
          tabIndex={0}
          role="group"
          aria-label="Curved photo gallery"
          aria-describedby="gallery-help"
          onPointerDown={strip.onPointerDown}
          onPointerMove={strip.onPointerMove}
          onPointerUp={strip.finishPointer}
          onPointerCancel={strip.finishPointer}
          onClickCapture={strip.onClickCapture}
          onDragStart={(event) => event.preventDefault()}
          onKeyDown={(event) => {
            if (event.altKey || event.ctrlKey || event.metaKey) return;
            if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
              event.preventDefault();
              strip.step(event.key === "ArrowRight" ? 1 : -1);
            } else if (event.key === "Home" || event.key === "End") {
              event.preventDefault();
              strip.select(event.key === "Home" ? 0 : photos.length - 1);
            } else if (
              (event.key === "Enter" || event.key === " ") &&
              event.target === event.currentTarget
            ) {
              event.preventDefault();
              openPhoto(strip.active);
            }
          }}
        >
          <div className="gallery-track">
            {visible.map(({ photo, index }) => {
              const offset =
                wrap(index - strip.active + photos.length / 2, photos.length) -
                photos.length / 2;
              return (
                <button
                  key={photo.id}
                  type="button"
                  className="gallery-card"
                  ref={(element) => {
                    if (element) strip.cards.current.set(index, element);
                    else strip.cards.current.delete(index);
                    strip.refresh();
                  }}
                  style={{ "--offset": offset } as CSSProperties}
                  tabIndex={index === strip.active ? 0 : -1}
                  aria-label={`Open ${photo.title}, image ${index + 1} of ${photos.length}`}
                  aria-current={index === strip.active ? "true" : undefined}
                  onClick={() => openPhoto(index)}
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(max-width: 700px) 82vw, 53vw"
                    quality={90}
                    priority={index === strip.active}
                    draggable={false}
                  />
                  <span className="gallery-open-mark" aria-hidden="true">
                    ↗
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="gallery-caption-bar">
          <div className="gallery-caption-copy" key={activePhoto.id}>
            <h1>{activePhoto.title}</h1>
            {(activePhoto.location || activePhoto.date) && (
              <p>
                {[activePhoto.location, activePhoto.date]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
          </div>
          <div className="gallery-controls">
            <button
              className="photo-control"
              aria-label="Previous photograph"
              disabled={photos.length < 2}
              onClick={() => strip.step(-1)}
            >
              <Arrow direction="previous" />
            </button>
            <p
              className="gallery-count"
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              <span className="gallery-sr-only">Image </span>
              {number(strip.active + 1)}{" "}
              <span className="count-divider">/</span> {number(photos.length)}
            </p>
            <button
              className="photo-control"
              aria-label="Next photograph"
              disabled={photos.length < 2}
              onClick={() => strip.step(1)}
            >
              <Arrow direction="next" />
            </button>
          </div>
        </div>
      </div>
      <p className="gallery-help" id="gallery-help">
        <span>Drag or swipe to wander</span>
        <span>← → to explore · select a photo to open</span>
      </p>

      <dialog
        ref={dialog}
        className="photo-lightbox"
        aria-labelledby="lightbox-title"
        aria-describedby="lightbox-description"
        onCancel={() => setLightbox(null)}
        onClose={() => setLightbox(null)}
        onKeyDown={(event) => {
          if (event.key === "Tab") {
            const controls = Array.from(
              event.currentTarget.querySelectorAll<HTMLElement>(
                "button:not([disabled]), a[href]",
              ),
            );
            const first = controls[0];
            const last = controls[controls.length - 1];
            if (event.shiftKey && document.activeElement === first) {
              event.preventDefault();
              last?.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault();
              first?.focus();
            }
          } else if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
            event.preventDefault();
            lightboxStep(event.key === "ArrowRight" ? 1 : -1);
          }
        }}
      >
        {lightboxPhoto && (
          <>
            <div className="lightbox-toolbar">
              <span className="eyebrow">FROM THE CAMERA</span>
              <button
                className="lightbox-close"
                onClick={() => setLightbox(null)}
                autoFocus
                aria-label="Close photograph"
              >
                Close <span aria-hidden="true">×</span>
              </button>
            </div>
            <div
              className="lightbox-image"
              onClick={(event) => {
                if (event.target === event.currentTarget) setLightbox(null);
              }}
            >
              <Image
                key={lightboxPhoto.id}
                src={lightboxPhoto.src}
                alt={lightboxPhoto.alt}
                fill
                sizes="100vw"
                quality={95}
                priority
                draggable={false}
              />
            </div>
            <div className="lightbox-bottom">
              <div className="lightbox-copy" key={lightboxPhoto.id}>
                <h2 id="lightbox-title">{lightboxPhoto.title}</h2>
                <p id="lightbox-description">
                  {[
                    lightboxPhoto.location,
                    lightboxPhoto.date,
                    lightboxPhoto.description,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {lightboxPhoto.relatedFieldNote && (
                  <Link
                    href={lightboxPhoto.relatedFieldNote.href}
                    onClick={() => setLightbox(null)}
                  >
                    Related Field Note ↗
                    <span className="gallery-sr-only">
                      : {lightboxPhoto.relatedFieldNote.title}
                    </span>
                  </Link>
                )}
              </div>
              <div className="gallery-controls">
                <button
                  className="photo-control"
                  aria-label="Previous photograph in lightbox"
                  disabled={photos.length < 2}
                  onClick={() => lightboxStep(-1)}
                >
                  <Arrow direction="previous" />
                </button>
                <span
                  className="gallery-count"
                  role="status"
                  aria-live="polite"
                >
                  {number((lightbox ?? 0) + 1)}{" "}
                  <span className="count-divider">/</span>{" "}
                  {number(photos.length)}
                </span>
                <button
                  className="photo-control"
                  aria-label="Next photograph in lightbox"
                  disabled={photos.length < 2}
                  onClick={() => lightboxStep(1)}
                >
                  <Arrow direction="next" />
                </button>
              </div>
            </div>
          </>
        )}
      </dialog>
    </div>
  );
}
