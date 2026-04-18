import { useEffect, useMemo, useState } from "react";

export function MediaImage({
  sources,
  alt,
  className = "",
  loading = "lazy",
  fallback = null,
}: {
  sources: Array<string | undefined | null>;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
  fallback?: React.ReactNode;
}) {
  const candidates = useMemo(
    () => [...new Set(sources.filter((source): source is string => Boolean(source)))],
    [sources],
  );
  const sourceKey = candidates.join("|");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [sourceKey]);

  const src = candidates[index];
  if (!src) return <>{fallback}</>;

  return (
    <img
      key={src}
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      draggable={false}
      onError={() => setIndex((current) => current + 1)}
    />
  );
}
