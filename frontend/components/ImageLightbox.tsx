"use client";

import { useCallback, useEffect, type ReactNode } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { assetUrl } from "@/lib/directus";

interface Photo {
  id: string;
}

interface Props {
  photos: Photo[];
  alt: string;
  index: number | null;
  onIndexChange: (index: number | null) => void;
}

export function ImageLightbox({ photos, alt, index, onIndexChange }: Props) {
  const open = index !== null && photos.length > 0;
  const currentIndex = open ? index! : 0;
  const current = open ? photos[currentIndex] : null;
  const hasMultiple = photos.length > 1;

  const close = useCallback(() => onIndexChange(null), [onIndexChange]);

  const go = useCallback(
    (delta: number) => {
      if (index === null) return;
      onIndexChange((index + delta + photos.length) % photos.length);
    },
    [index, photos.length, onIndexChange]
  );

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, close, go]);

  return (
    <AnimatePresence>
      {open && current && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/90 z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Zdjęcie ${currentIndex + 1} z ${photos.length}: ${alt}`}
            className="fixed inset-0 z-[60] flex flex-col items-center justify-center p-4 pointer-events-none"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2 }}
          >
            <button
              type="button"
              onClick={close}
              className="pointer-events-auto absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition"
              aria-label="Zamknij"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {hasMultiple && (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  className="pointer-events-auto absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition"
                  aria-label="Poprzednie zdjęcie"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  className="pointer-events-auto absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition"
                  aria-label="Następne zdjęcie"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            <div
              className="pointer-events-auto relative w-full max-w-5xl h-[min(85vh,800px)]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                key={current.id}
                src={assetUrl(current.id)}
                alt={alt}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>

            {hasMultiple && (
              <p className="pointer-events-none mt-4 text-sm text-white/70 tabular-nums">
                {currentIndex + 1} / {photos.length}
              </p>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/** Clickable image area - opens lightbox without bubbling to parent handlers. */
export function LightboxTrigger({
  children,
  onOpen,
  className = "",
  disabled = false,
}: {
  children: ReactNode;
  onOpen: () => void;
  className?: string;
  disabled?: boolean;
}) {
  if (disabled) return <>{children}</>;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onOpen();
      }}
      className={`group/lightbox relative block w-full h-full cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${className}`}
      style={{ "--tw-ring-color": "var(--ps-primary)" } as React.CSSProperties}
      aria-label="Powiększ zdjęcie"
    >
      {children}
      <span className="absolute inset-0 bg-black/0 group-hover/lightbox:bg-black/10 transition-colors pointer-events-none" />
      <span className="absolute bottom-2 right-2 p-1.5 rounded-full bg-black/40 text-white opacity-0 group-hover/lightbox:opacity-100 transition-opacity pointer-events-none">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
        </svg>
      </span>
    </button>
  );
}
