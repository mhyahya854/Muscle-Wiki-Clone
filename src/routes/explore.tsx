import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { exerciseSource } from "@/features/exercises/exerciseSource";
import { ExerciseCard } from "@/features/exercises/ExerciseCard";
import { EMPTY_FILTERS, FilterBar, type Filters } from "@/features/exercises/FilterBar";
import { applyFilters } from "@/lib/filter";
import { EmptyState } from "@/components/shared/EmptyState";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore exercises — LiftMap" },
      {
        name: "description",
        content:
          "Search and filter the LiftMap exercise library by training style, equipment, body region, difficulty, and condition-aware considerations.",
      },
      { property: "og:title", content: "Explore exercises — LiftMap" },
      {
        property: "og:description",
        content: "Search and filter exercises by style, equipment, region, level, and conditions.",
      },
    ],
  }),
  loader: () => exerciseSource.list(),
  component: ExplorePage,
});

function ExplorePage() {
  const all = Route.useLoaderData() as import("@/lib/types").Exercise[];
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const results = useMemo(() => applyFilters(all, filters), [all, filters]);

  return (
    <main>
      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Explore</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Filter the library across training styles, equipment, regions, and condition-aware
          training considerations. <span className="text-foreground/80">Not medical advice.</span>
        </p>
      </div>

      <div className="mt-6">
        <FilterBar filters={filters} onChange={setFilters} resultCount={results.length} />
      </div>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {results.length === 0 ? (
          <EmptyState
            title="No exercises match"
            description="Try removing a filter or clearing your search."
            action={
              <button
                onClick={() => setFilters(EMPTY_FILTERS)}
                className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                Reset filters
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {results.map((e) => (
              <ExerciseCard key={e.id} exercise={e} />
            ))}
          </div>
        )}

        {/* Workout generator placeholder */}
        <div className="mt-12 flex flex-col items-start justify-between gap-4 rounded-2xl border border-dashed border-border bg-card/40 p-6 sm:flex-row sm:items-center">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-primary">Coming soon</span>
            <h3 className="mt-1 font-display text-lg font-semibold">Generate a session from these filters</h3>
            <p className="text-sm text-muted-foreground">
              We'll build a balanced workout from {results.length} matching exercises.
            </p>
          </div>
          <button disabled className="cursor-not-allowed rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-muted-foreground">
            Preview
          </button>
        </div>
      </section>
    </main>
  );
}
