import type { Exercise } from "@/lib/types";

function hash(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

const GRADIENTS = [
  "linear-gradient(135deg, oklch(0.35 0.05 240), oklch(0.22 0.03 200))",
  "linear-gradient(135deg, oklch(0.32 0.08 280), oklch(0.20 0.04 240))",
  "linear-gradient(135deg, oklch(0.30 0.06 160), oklch(0.20 0.03 200))",
  "linear-gradient(135deg, oklch(0.34 0.10 30), oklch(0.20 0.04 350))",
  "linear-gradient(135deg, oklch(0.30 0.08 320), oklch(0.20 0.03 260))",
  "linear-gradient(135deg, oklch(0.35 0.07 200), oklch(0.22 0.04 240))",
];

export function ExerciseThumb({
  exercise,
  className = "",
  showInitials = true,
  preferAnimation = false,
}: {
  exercise: Exercise;
  className?: string;
  showInitials?: boolean;
  preferAnimation?: boolean;
}) {
  const mediaSrc = preferAnimation
    ? (exercise.media.animation ?? exercise.media.hero ?? exercise.media.thumbnail)
    : (exercise.media.thumbnail ?? exercise.media.hero ?? exercise.media.animation);

  if (mediaSrc) {
    return (
      <img
        src={mediaSrc}
        alt={exercise.name}
        className={`h-full w-full object-cover ${className}`}
        loading="lazy"
      />
    );
  }

  const gradient = GRADIENTS[hash(exercise.id) % GRADIENTS.length];
  const initials = exercise.name
    .split(" ")
    .filter((word) => /^[A-Za-z]/.test(word))
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");

  return (
    <div
      className={`relative flex h-full w-full items-center justify-center overflow-hidden ${className}`}
      style={{ background: gradient }}
      aria-label={exercise.name}
    >
      <div className="absolute inset-0 bg-grid opacity-30" />
      {showInitials && (
        <span className="font-display text-3xl font-bold tracking-tight text-foreground/70">
          {initials}
        </span>
      )}
    </div>
  );
}
