import { createFileRoute, Link } from "@tanstack/react-router";
import type { ExerciseSummary } from "@/lib/types";
import { useEffect, useMemo, useRef, useState } from "react";
import { EmptyState } from "@/components/shared/EmptyState";
import { ExerciseCard } from "@/features/exercises/ExerciseCard";
import { exerciseRepository } from "@/features/exercises/exerciseRepository";
import { EMPTY_FILTERS, FilterBar, type Filters } from "@/features/exercises/FilterBar";
import { applyFilters } from "@/lib/filter";
import { useVirtualizer } from "@tanstack/react-virtual";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore exercises - LiftMap" },
      {
        name: "description",
        content:
          "Search and filter the LiftMap exercise library by training style, equipment, body region, difficulty, and condition-aware considerations.",
      },
      { property: "og:title", content: "Explore exercises - LiftMap" },
      {
        property: "og:description",
        content: "Search and filter exercises by style, equipment, region, level, and conditions.",
      },
    ],
  }),
  loader: () => exerciseRepository.getExerciseSummaries(),
  component: ExplorePage,
});

function ExplorePage() {
  const all = Route.useLoaderData() as ExerciseSummary[];
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
          <VirtualGrid results={results} />
        )}

        <div className="mt-12 flex flex-col items-start justify-between gap-4 rounded-2xl border border-border bg-card/40 p-6 sm:flex-row sm:items-center">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-primary">
              Pro Feature
            </span>
            <h3 className="mt-1 font-display text-lg font-semibold">Generate a custom session</h3>
            <p className="text-sm text-muted-foreground">
              Build a balanced workout from our library of {all.length} exercises.
            </p>
          </div>
          <Link
            to="/workout-generator"
            className="rounded-full bg-primary px-6 py-2 text-sm font-bold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]"
          >
            Start Generator
          </Link>
        </div>
      </section>
    </main>
  );
}
function VirtualGrid({ results }: { results: ExerciseSummary[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(1);

  useEffect(() => {
    const updateColumns = () => {
      if (window.innerWidth >= 1280) setColumns(4);
      else if (window.innerWidth >= 1024) setColumns(3);
      else if (window.innerWidth >= 640) setColumns(2);
      else setColumns(1);
    };
    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  const rowCount = Math.ceil(results.length / columns);
  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => window as unknown as HTMLElement,
    estimateSize: () => 400, // Estimated height for card + gaps
    overscan: 5,
    scrollMargin: parentRef.current?.offsetTop ?? 0,
  });

  return (
    <div ref={parentRef} className="relative w-full">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const startIndex = virtualRow.index * columns;
          const rowItems = results.slice(startIndex, startIndex + columns);

          return (
            <div
              key={virtualRow.key}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start - virtualizer.options.scrollMargin}px)`,
              }}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {rowItems.map((exercise) => (
                <ExerciseCard key={exercise.id} exercise={exercise} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
