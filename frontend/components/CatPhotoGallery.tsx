"use client";

import { useState } from "react";
import Image from "next/image";
import { assetUrl } from "@/lib/directus";
import { ImageLightbox, LightboxTrigger } from "./ImageLightbox";
import type { DirectusFile } from "@/lib/types";

interface Props {
  photos: DirectusFile[];
  name: string;
}

export function CatPhotoGallery({ photos, name }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const mainPhoto = photos[0];
  const thumbs = photos.slice(1, 5);

  return (
    <>
      <div>
        <div className="aspect-[4/3] relative bg-gray-100 rounded-2xl overflow-hidden mb-3">
          {mainPhoto ? (
            <LightboxTrigger onOpen={() => setLightboxIndex(0)} className="absolute inset-0">
              <Image
                src={assetUrl(mainPhoto.id)}
                alt={name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </LightboxTrigger>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-8xl">🐱</div>
          )}
        </div>
        {thumbs.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {thumbs.map((photo, i) => (
              <div key={photo.id} className="aspect-square relative rounded-lg overflow-hidden bg-gray-100">
                <LightboxTrigger onOpen={() => setLightboxIndex(i + 1)} className="absolute inset-0">
                  <Image
                    src={assetUrl(photo.id)}
                    alt={name}
                    fill
                    className="object-cover"
                    sizes="120px"
                  />
                </LightboxTrigger>
              </div>
            ))}
          </div>
        )}
      </div>

      <ImageLightbox
        photos={photos}
        alt={name}
        index={lightboxIndex}
        onIndexChange={setLightboxIndex}
      />
    </>
  );
}
