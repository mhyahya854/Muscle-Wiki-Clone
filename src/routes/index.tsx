import { createFileRoute, Link } from "@tanstack/react-router";
import { exerciseSource } from "@/features/exercises/exerciseSource";
import type { Exercise } from "@/lib/types";
import { ExerciseCard } from "@/features/exercises/ExerciseCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LiftMap — Train smarter, by muscle" },
      {
        name: "description",
        content:
          "Premium exercise library: browse by muscle map, filter by style, equipment, and condition-aware training considerations.",
      },
      { property: "og:title", content: "LiftMap — Train smarter, by muscle" },
      {
        property: "og:description",
        content: "Browse exercises by muscle, style, equipment, and condition-aware training notes.",
      },
    ],
  }),
  loader: async () => {
    const all = await exerciseSource.list();
    return {
      featured: all.slice(0, 6),
      exerciseCount: all.length,
      muscleCount: new Set(all.flatMap((exercise) => [...exercise.primaryMuscles, ...exercise.secondaryMuscles])).size,
    };
  },
  component: HomePage,
});

function HomePage() {
  const { featured, exerciseCount, muscleCount } = Route.useLoaderData() as {
    featured: Exercise[];
    exerciseCount: number;
    muscleCount: number;
  };
  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              v0 · intelligent exercise library
            </span>
            <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight text-balance sm:text-6xl lg:text-7xl">
              Train smarter,
              <br />
              <span className="gradient-text">by muscle.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground text-balance">
              A premium exercise library with a clickable body map, deep filters, and
              condition-aware training considerations — built for lifters who care about
              the details.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/body-map"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] glow"
              >
                Open the Body Map
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6l6 6-6 6" />
                </svg>
              </Link>
              <Link
                to="/explore"
                className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-surface/60 px-5 py-3 text-sm font-semibold text-foreground backdrop-blur transition-colors hover:bg-surface-elevated"
              >
                Explore exercises
              </Link>
            </div>

            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6">
              {[
                [String(muscleCount), "mapped muscles"],
                [String(exerciseCount), "local exercises"],
                ["2", "condition rules live"],
              ].map(([n, l]) => (
                <div key={l}>
                  <dt className="font-display text-3xl font-bold text-foreground">{n}</dt>
                  <dd className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{l}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight">Featured exercises</h2>
            <p className="mt-1 text-sm text-muted-foreground">A taste of the library — explore the full catalogue.</p>
          </div>
          <Link to="/explore" className="text-sm font-medium text-primary hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((e) => (
            <ExerciseCard key={e.id} exercise={e} />
          ))}
        </div>

        {/* Workout generator placeholder */}
        <div className="mt-12 flex flex-col items-start justify-between gap-4 rounded-2xl border border-dashed border-border bg-card/40 p-6 sm:flex-row sm:items-center">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-primary">Coming soon</span>
            <h3 className="mt-1 font-display text-lg font-semibold">Smart workout generator</h3>
            <p className="text-sm text-muted-foreground">
              Pick muscles, conditions, and equipment — get a session built for you.
            </p>
          </div>
          <button
            disabled
            className="cursor-not-allowed rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-muted-foreground"
          >
            Preview
          </button>
        </div>
      </section>
    </main>
  );
}
