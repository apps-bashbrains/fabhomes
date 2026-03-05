"use client";

import { useState } from "react";
import Image from "next/image";

interface PropertyGalleryProps {
  mainImageUrl: string;
  imageUrls: string[];
  title: string;
}

export function PropertyGallery({ mainImageUrl, imageUrls, title }: PropertyGalleryProps) {
  const [selected, setSelected] = useState(0);
  const images = imageUrls.length > 0 ? imageUrls : [mainImageUrl];
  const currentImage = images[selected] ?? mainImageUrl;

  return (
    <div className="space-y-4">
      <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-gray-100">
        <Image
          src={currentImage}
          alt={title}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, 66vw"
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((url, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSelected(i)}
              className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                selected === i ? "border-primary" : "border-transparent"
              }`}
            >
              <Image src={url} alt={`${title} ${i + 1}`} fill className="object-cover" sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
