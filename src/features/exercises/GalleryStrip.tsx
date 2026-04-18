import { useEffect, useState } from "react";
import { MediaImage } from "@/features/exercises/MediaImage";

function GalleryFallback({ label }: { label: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-surface text-center">
      <span className="rounded-full border border-border bg-card px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

export function GalleryStrip({ images, name }: { images: string[]; name: string }) {
  const sanitizedImages = [...new Set(images.filter(Boolean))];
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (active >= sanitizedImages.length) {
      setActive(0);
    }
  }, [active, sanitizedImages.length]);

  if (sanitizedImages.length === 0) return null;

  const activeFirst = [
    sanitizedImages[active],
    ...sanitizedImages.filter((_, index) => index !== active),
  ];

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Gallery
        </h3>
        <span className="text-xs text-muted-foreground">
          {sanitizedImages.length} view{sanitizedImages.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <MediaImage
          sources={activeFirst}
          alt={`${name} view ${active + 1}`}
          className="h-full w-full object-cover"
          fallback={<GalleryFallback label="No Media" />}
        />
      </div>

      {sanitizedImages.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {sanitizedImages.map((src, index) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(index)}
              className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border transition-all ${
                index === active
                  ? "border-primary/60 ring-2 ring-primary/30"
                  : "border-border opacity-70 hover:opacity-100"
              }`}
              aria-label={`View image ${index + 1}`}
            >
              <MediaImage
                sources={[src]}
                alt={`${name} thumbnail ${index + 1}`}
                className="h-full w-full object-cover"
                fallback={<GalleryFallback label={`View ${index + 1}`} />}
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
