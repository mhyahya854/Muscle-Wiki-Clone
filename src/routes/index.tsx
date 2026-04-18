import { createFileRoute, Link } from "@tanstack/react-router";
import { loadExerciseLibrary } from "@/features/exercises/exerciseLibrary";
import { CONDITIONS } from "@/features/conditions/conditions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LiftMap - Train smarter, by muscle" },
      {
        name: "description",
        content:
          "Premium exercise library: browse by muscle map, filter by style, equipment, and condition-aware training considerations.",
      },
      { property: "og:title", content: "LiftMap - Train smarter, by muscle" },
      {
        property: "og:description",
        content:
          "Browse exercises by muscle, style, equipment, and condition-aware training notes.",
      },
    ],
  }),
  loader: async () => {
    const all = await loadExerciseLibrary();
    return {
      exerciseCount: all.length,
      muscleCount: new Set(
        all.flatMap((exercise) => [...exercise.primaryMuscles, ...exercise.secondaryMuscles]),
      ).size,
      conditionCount: CONDITIONS.length,
    };
  },
  component: HomePage,
});

function HomePage() {
  const { exerciseCount, muscleCount, conditionCount } = Route.useLoaderData() as {
    exerciseCount: number;
    muscleCount: number;
    conditionCount: number;
  };

  return (
    <main>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground backdrop-blur">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              v1 · local exercise library
            </span>
            <h1 className="mt-6 text-balance font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Train smarter,
              <br />
              <span className="gradient-text">by muscle.</span>
            </h1>
            <p className="mt-6 max-w-xl text-balance text-lg text-muted-foreground">
              A focused exercise library with a clickable body map, deep filters, and condition
              notes built for lifters who want clean search, fast navigation, and useful detail.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/body-map"
                className="glow inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
              >
                Open the Body Map
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
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
                [String(conditionCount), "condition rules"],
              ].map(([count, label]) => (
                <div key={label}>
                  <dt className="font-display text-3xl font-bold text-foreground">{count}</dt>
                  <dd className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border bg-card/40 p-6 shadow-card">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-primary">
                Tool
              </span>
              <h2 className="mt-1 font-display text-2xl font-semibold">Workout Generator</h2>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                Pick muscles, conditions, and equipment to generate a clean session from the local
                library.
              </p>
            </div>
            <Link
              to="/workout-generator"
              className="rounded-full bg-primary px-6 py-2 text-sm font-bold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]"
            >
              Open Generator
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
