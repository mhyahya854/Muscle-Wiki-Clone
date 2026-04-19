import { Link } from "@tanstack/react-router";
import type { Exercise, ExerciseSummary } from "@/lib/types";
import { MUSCLES_BY_ID } from "@/features/bodymap/muscles";
import { ExerciseThumb } from "@/features/exercises/ExerciseThumb";

export function ExerciseCard({ exercise }: { exercise: ExerciseSummary | Exercise }) {
  const primary = exercise.primaryMuscles
    .map((muscle) => MUSCLES_BY_ID[muscle]?.name)
    .filter(Boolean);
  const secondary = exercise.secondaryMuscles
    .map((muscle) => MUSCLES_BY_ID[muscle]?.name)
    .filter(Boolean);

  return (
    <Link
      to="/exercise/$slug"
      params={{ slug: exercise.slug }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:-translate-y-0.5 hover:border-border-strong hover:shadow-glow"
    >
      <div className="relative aspect-[5/3] w-full overflow-hidden">
        <ExerciseThumb
          exercise={exercise}
          className="transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex gap-1.5">
          <span className="rounded-md bg-background/70 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-foreground/80 backdrop-blur">
            {exercise.movementPattern}
          </span>
          <span className="rounded-md bg-background/70 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-foreground/80 backdrop-blur">
            {exercise.difficulty}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="font-display text-base font-semibold leading-tight text-foreground">
          {exercise.name}
        </h3>

        <div className="space-y-1 text-xs">
          <div className="flex flex-wrap gap-1">
            <span className="text-muted-foreground">Primary:</span>
            <span className="text-foreground">{primary.join(", ") || "—"}</span>
          </div>
          {secondary.length > 0 && (
            <div className="flex flex-wrap gap-1">
              <span className="text-muted-foreground">Secondary:</span>
              <span className="text-foreground/70">{secondary.join(", ")}</span>
            </div>
          )}
        </div>

        <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
          {exercise.equipment.map((equipment) => (
            <span
              key={equipment}
              className="rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] capitalize text-muted-foreground"
            >
              {equipment}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
