import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BodyMap } from "@/features/bodymap/BodyMap";
import { exerciseSource } from "@/features/exercises/exerciseSource";
import { MUSCLES, MUSCLES_BY_ID } from "@/features/bodymap/muscles";
import type { BodyView, MuscleId, Sex } from "@/lib/types";
import { ExerciseCard } from "@/features/exercises/ExerciseCard";
import { EmptyState } from "@/components/shared/EmptyState";

export const Route = createFileRoute("/body-map")({
  head: () => ({
    meta: [
      { title: "Body Map — LiftMap" },
      {
        name: "description",
        content:
          "Interactive body map. Click any muscle on the front or back view to see exercises that train it.",
      },
      { property: "og:title", content: "Body Map — LiftMap" },
      {
        property: "og:description",
        content: "Click a muscle to see the exercises that train it.",
      },
    ],
  }),
  loader: () => exerciseSource.list(),
  component: BodyMapPage,
});

function BodyMapPage() {
  const all = Route.useLoaderData() as import("@/lib/types").Exercise[];
  const [sex, setSex] = useState<Sex>("male");
  const [view, setView] = useState<BodyView>("front");
  const [hovered, setHovered] = useState<MuscleId | null>(null);
  const [selected, setSelected] = useState<MuscleId | null>(null);

  const exercises = useMemo(() => {
    if (!selected) return [];
    return all.filter(
      (e) => e.primaryMuscles.includes(selected) || e.secondaryMuscles.includes(selected),
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
            {(["male", "female"] as Sex[]).map((s) => (
              <button
                key={s}
                onClick={() => setSex(s)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                  sex === s
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex rounded-full border border-border bg-surface p-0.5">
            {(["front", "back"] as BodyView[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                  view === v
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
        {/* Map column */}
        <div className="flex flex-col rounded-2xl border border-border bg-card p-4 shadow-card">
          <div className="relative mx-auto aspect-[2/4.8] w-full max-w-sm">
            <BodyMap
              sex={sex}
              view={view}
              selected={selected}
              hovered={hovered}
              onHover={setHovered}
              onSelect={(m) => setSelected((cur) => (cur === m ? null : m))}
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

        {/* Results column */}
        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap gap-1.5">
            {MUSCLES.filter((m) => m.view === view).map((m) => (
              <button
                key={m.id}
                onClick={() => setSelected((cur) => (cur === m.id ? null : m.id))}
                onMouseEnter={() => setHovered(m.id)}
                onMouseLeave={() => setHovered(null)}
                className={`rounded-full border px-3 py-1 text-xs transition-all ${
                  selected === m.id
                    ? "border-primary/60 bg-primary text-primary-foreground"
                    : "border-border bg-surface text-muted-foreground hover:border-border-strong hover:text-foreground"
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>

          {!selected ? (
            <EmptyState
              title="Pick a muscle"
              description="Click any region on the body map or one of the chips above to see matching exercises."
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
                {exercises.map((e) => (
                  <ExerciseCard key={e.id} exercise={e} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
