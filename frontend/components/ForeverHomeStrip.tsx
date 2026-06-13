"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { assetUrl } from "@/lib/directus";
import { ImageLightbox, LightboxTrigger } from "./ImageLightbox";
import type { ForeverHomePhoto } from "@/lib/types";

interface Props {
  photos: ForeverHomePhoto[];
}

function formatPublishedAt(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function ForeverHomeStrip({ photos }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const lightboxPhotos = useMemo(
    () => photos.map((item) => ({
      id: item.photo.id,
      alt: item.caption ?? (item.cat ? `${item.cat.name} w domu stałym` : "Kot w domu stałym"),
      title: item.cat?.name ?? "Kot w domu stałym",
      href: item.cat ? `/koty/${item.cat.slug}` : null,
    })),
    [photos]
  );

  const repeatCount = photos.length >= 6 ? 2 : photos.length >= 4 ? 3 : 1;
  const shouldAnimate = photos.length > 0 && repeatCount > 1;
  const stripPhotos = shouldAnimate
    ? Array.from({ length: repeatCount }, () => photos).flat()
    : photos;
  const cardStep = 256;

  useEffect(() => {
    if (!shouldAnimate || isPaused) return;
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const resetAt = scroller.scrollWidth / repeatCount;
    let frameId = 0;

    const tick = () => {
      if (!scrollerRef.current) return;
      scrollerRef.current.scrollLeft += 0.35;
      if (scrollerRef.current.scrollLeft >= resetAt) {
        scrollerRef.current.scrollLeft -= resetAt;
      }
      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, [isPaused, repeatCount, shouldAnimate]);

  const renderPhotoCard = (item: ForeverHomePhoto, index: number, key: string, wrapperClassName: string) => {
    const publishedAt = formatPublishedAt(item.published_at);

    return (
      <div key={key} className={wrapperClassName}>
        <div className="aspect-[4/3] relative overflow-hidden rounded-2xl bg-gray-100">
          <LightboxTrigger onOpen={() => setLightboxIndex(index)} className="absolute inset-0">
            <Image
              src={assetUrl(item.photo.id)}
              alt={item.caption ?? (item.cat ? `${item.cat.name} w domu stałym` : "Kot w domu stałym")}
              fill
              className="object-cover transition duration-300 hover:scale-105"
              sizes={wrapperClassName.includes("w-full") ? "(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" : "240px"}
            />
          </LightboxTrigger>

          {publishedAt && (
            <div className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-medium text-gray-700 shadow-sm pointer-events-none">
              {publishedAt}
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 text-white pointer-events-none">
            <p className="text-lg font-semibold leading-tight">{item.cat?.name ?? "Kot w domu stałym"}</p>
            {item.caption && (
              <p className="mt-1 text-sm text-white/80 line-clamp-2">{item.caption}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const scrollByAmount = (direction: 1 | -1) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    scroller.scrollBy({
      left: direction * cardStep,
      behavior: "smooth",
    });
  };

  return (
    <>
      {photos.length > 0 ? (
        <div className="rounded-[2rem] border border-gray-200 bg-white/80 py-4 shadow-sm">
          <div className="mb-3 flex items-center justify-end gap-2 px-4">
            <button
              type="button"
              className="btn-secondary px-4 py-2"
              aria-label="Przewiń zdjęcia w lewo"
              onClick={() => scrollByAmount(-1)}
            >
              ←
            </button>
            <button
              type="button"
              className="btn-secondary px-4 py-2"
              aria-label="Przewiń zdjęcia w prawo"
              onClick={() => scrollByAmount(1)}
            >
              →
            </button>
          </div>

          <div
            ref={scrollerRef}
            className="overflow-x-auto pb-2"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onFocus={() => setIsPaused(true)}
            onBlur={() => setIsPaused(false)}
          >
            <div className="flex gap-4 px-4">
              {stripPhotos.map((item, index) => renderPhotoCard(
                item,
                photos.length > 0 ? index % photos.length : index,
                `${item.id}-${index}`,
                "w-60 shrink-0"
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-[2rem] border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center text-gray-500">
          Brak opublikowanych zdjęć z domów stałych.
        </div>
      )}

      <ImageLightbox
        photos={lightboxPhotos}
        alt="Koty w domach stałych"
        index={lightboxIndex}
        onIndexChange={setLightboxIndex}
        showTitle
      />
    </>
  );
}
