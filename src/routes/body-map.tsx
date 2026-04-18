import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/shared/EmptyState";
import { BodyMap } from "@/features/bodymap/BodyMap";
import { MUSCLES, MUSCLES_BY_ID } from "@/features/bodymap/muscles";
import { ExerciseCard } from "@/features/exercises/ExerciseCard";
import { useExerciseLibrary } from "@/features/exercises/useExerciseLibrary";
import type { BodyView, MuscleId, Sex } from "@/lib/types";

export const Route = createFileRoute("/body-map")({
  head: () => ({
    meta: [
      { title: "Body Map - LiftMap" },
      {
        name: "description",
        content:
          "Interactive body map. Click any muscle on the front or back view to see exercises that train it.",
      },
      { property: "og:title", content: "Body Map - LiftMap" },
      {
        property: "og:description",
        content: "Click a muscle to see the exercises that train it.",
      },
    ],
  }),
  component: BodyMapPage,
});

function BodyMapPage() {
  const { exercises: all, isLoading, error } = useExerciseLibrary();
  const [sex, setSex] = useState<Sex>("male");
  const [view, setView] = useState<BodyView>("front");
  const [hovered, setHovered] = useState<MuscleId | null>(null);
  const [selected, setSelected] = useState<MuscleId | null>(null);

  const exercises = useMemo(() => {
    if (!selected) return [];
    return all.filter(
      (exercise) =>
        exercise.primaryMuscles.includes(selected) || exercise.secondaryMuscles.includes(selected),
    );
  }, [all, selected]);

  const activeLabel =
    (selected && MUSCLES_BY_ID[selected]?.name) ||
    (hovered && MUSCLES_BY_ID[hovered]?.name) ||
    "Hover or click a muscle";

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Body Map</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Click any muscle to see exercises. Switch between front/back and male/female views.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-full border border-border bg-surface p-0.5">
            {(["male", "female"] as Sex[]).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setSex(value)}
                aria-pressed={sex === value}
                className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                  sex === value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
          <div className="flex rounded-full border border-border bg-surface p-0.5">
            {(["front", "back"] as BodyView[]).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setView(value)}
                aria-pressed={view === value}
                className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                  view === value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
        <div className="flex flex-col rounded-2xl border border-border bg-card p-4 shadow-card">
          <div className="relative mx-auto aspect-[2/4.8] w-full max-w-sm">
            <BodyMap
              sex={sex}
              view={view}
              selected={selected}
              hovered={hovered}
              onHover={setHovered}
              onSelect={(muscle) => setSelected((current) => (current === muscle ? null : muscle))}
            />
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-border pt-3">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Selected
            </span>
            <span className="font-display text-sm font-semibold text-foreground">
              {activeLabel}
            </span>
          </div>
        </div>

        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap gap-1.5">
            {MUSCLES.filter((muscle) => muscle.view === view).map((muscle) => (
              <button
                key={muscle.id}
                type="button"
                onClick={() => setSelected((current) => (current === muscle.id ? null : muscle.id))}
                onMouseEnter={() => setHovered(muscle.id)}
                onMouseLeave={() => setHovered(null)}
                aria-pressed={selected === muscle.id}
                className={`rounded-full border px-3 py-1 text-xs transition-all ${
                  selected === muscle.id
                    ? "border-primary/60 bg-primary text-primary-foreground"
                    : "border-border bg-surface text-muted-foreground hover:border-border-strong hover:text-foreground"
                }`}
              >
                {muscle.name}
              </button>
            ))}
          </div>

          {!selected ? (
            <EmptyState
              title="Pick a muscle"
              description="Click any region on the body map or one of the chips above to see matching exercises."
            />
          ) : isLoading ? (
            <EmptyState
              title="Loading exercise matches"
              description="The body map is ready. Exercise results will appear as soon as the library finishes loading."
            />
          ) : error ? (
            <EmptyState
              title="Unable to load exercises"
              description={error}
              action={
                <Link
                  to="/explore"
                  className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                >
                  Browse all
                </Link>
              }
            />
          ) : exercises.length === 0 ? (
            <EmptyState
              title="No exercises yet"
              description={`The library doesn't have exercises tagged for ${MUSCLES_BY_ID[selected]?.name} yet.`}
              action={
                <Link
                  to="/explore"
                  className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                >
                  Browse all
                </Link>
              }
            />
          ) : (
            <>
              <div className="mb-3 flex items-baseline justify-between">
                <h2 className="font-display text-xl font-semibold">
                  {MUSCLES_BY_ID[selected]?.name}
                </h2>
                <span className="font-mono text-xs text-muted-foreground">
                  {exercises.length} exercise{exercises.length === 1 ? "" : "s"}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {exercises.map((exercise) => (
                  <ExerciseCard key={exercise.id} exercise={exercise} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
