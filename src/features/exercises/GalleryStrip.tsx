import { useState } from "react";

export function GalleryStrip({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);

  if (images.length === 0) return null;

  return (
    <section className="mt-6">
      <h3 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
        Gallery
      </h3>
      {/* Main viewer */}
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <img
          src={images[active]}
          alt={`${name} — view ${active + 1}`}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={src}
              onClick={() => setActive(i)}
              className={`relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg border transition-all ${
                i === active
                  ? "border-primary/60 ring-2 ring-primary/30"
                  : "border-border opacity-60 hover:opacity-100"
              }`}
              aria-label={`View image ${i + 1}`}
            >
              <img
                src={src}
                alt={`${name} thumbnail ${i + 1}`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
