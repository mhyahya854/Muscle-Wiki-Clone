import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { exerciseSource } from "@/features/exercises/exerciseSource";
import { MUSCLES_BY_ID } from "@/features/bodymap/muscles";
import { CONDITIONS_BY_ID } from "@/features/conditions/conditions";
import { ExerciseThumb } from "@/features/exercises/ExerciseThumb";
import { ExerciseCard } from "@/features/exercises/ExerciseCard";
import { ConditionBadge } from "@/features/conditions/ConditionBadge";
import type { ConditionNote } from "@/lib/types";

export const Route = createFileRoute("/exercise/$slug")({
  loader: async ({ params }) => {
    const exercise = await exerciseSource.bySlug(params.slug);
    if (!exercise) throw notFound();
    const all = await exerciseSource.list();
    const related = exercise.related
      .map((id) => all.find((e) => e.id === id))
      .filter((e): e is NonNullable<typeof e> => Boolean(e));
    return { exercise, related };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.exercise.name} — LiftMap` },
          { name: "description", content: loaderData.exercise.instructions[0] ?? "" },
          { property: "og:title", content: `${loaderData.exercise.name} — LiftMap` },
          { property: "og:description", content: loaderData.exercise.instructions[0] ?? "" },
        ]
      : [],
  }),
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="font-display text-2xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      <Link to="/explore" className="mt-6 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
        Back to Explore
      </Link>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="font-display text-3xl font-bold">Exercise not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">It may have moved or been removed.</p>
      <Link to="/explore" className="mt-6 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
        Browse exercises
      </Link>
    </div>
  ),
  component: ExercisePage,
});

const SUIT_RANK: Record<ConditionNote["suitability"], number> = { avoid: 0, caution: 1, suitable: 2 };

function ExercisePage() {
  const { exercise, related } = Route.useLoaderData() as {
    exercise: import("@/lib/types").Exercise;
    related: import("@/lib/types").Exercise[];
  };
  const primary = exercise.primaryMuscles.map((m) => MUSCLES_BY_ID[m]).filter(Boolean);
  const secondary = exercise.secondaryMuscles.map((m) => MUSCLES_BY_ID[m]).filter(Boolean);
  const conditions = [...exercise.conditionNotes].sort(
    (a, b) => SUIT_RANK[a.suitability] - SUIT_RANK[b.suitability],
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link to="/explore" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
        </svg>
        Back to Explore
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        {/* Main column */}
        <div className="min-w-0">
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-border shadow-card">
            <ExerciseThumb exercise={exercise} showInitials={false} preferAnimation />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/60 to-transparent p-6">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-background/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-foreground/80 backdrop-blur">
                  {exercise.movementPattern}
                </span>
                <span className="rounded-full bg-background/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-foreground/80 backdrop-blur">
                  {exercise.difficulty}
                </span>
                {exercise.trainingStyles.map((s) => (
                  <span key={s} className="rounded-full bg-background/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-foreground/80 backdrop-blur">
                    {s}
                  </span>
                ))}
              </div>
              <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                {exercise.name}
              </h1>
            </div>
          </div>

          {/* Quick facts */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Fact label="Primary" value={primary.map((m) => m.name).join(", ")} />
            <Fact label="Secondary" value={secondary.map((m) => m.name).join(", ") || "—"} />
            <Fact label="Equipment" value={exercise.equipment.join(", ")} />
            <Fact label="Movement" value={exercise.movementPattern} />
          </div>

          {/* Instructions */}
          <section className="mt-10">
            <h2 className="font-display text-xl font-semibold">Instructions</h2>
            <ol className="mt-4 space-y-3">
              {exercise.instructions.map((step, i) => (
                <li key={i} className="flex gap-3 rounded-xl border border-border bg-card p-4">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary font-mono text-xs font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <span className="text-sm text-foreground/90">{step}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* Tags */}
          {exercise.tags.length > 0 && (
            <section className="mt-8">
              <h3 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Tags</h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {exercise.tags.map((t) => (
                  <span key={t} className="rounded-full border border-border bg-surface px-2.5 py-1 text-xs text-muted-foreground">
                    {t}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Regressions / Progressions */}
          <section className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ProgressionList title="Regressions" slugs={exercise.regressions} />
            <ProgressionList title="Progressions" slugs={exercise.progressions} />
          </section>

          {/* Related */}
          {related.length > 0 && (
            <section className="mt-12">
              <h2 className="font-display text-xl font-semibold">Related exercises</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {related.map((e) => (
                  <ExerciseCard key={e.id} exercise={e} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Side panel — conditions */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-semibold">Condition considerations</h3>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Training considerations only — <span className="text-foreground/80">not medical diagnosis</span>.
            </p>

            <ul className="mt-4 space-y-3">
              {conditions.map((n) => {
                const c = CONDITIONS_BY_ID[n.conditionId];
                return (
                  <li key={n.conditionId} className="rounded-xl border border-border bg-surface p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-foreground">{c?.label ?? n.conditionId}</span>
                      <ConditionBadge note={n} compact />
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{n.note}</p>
                  </li>
                );
              })}
            </ul>

            <div className="mt-5 rounded-xl border border-dashed border-border p-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-primary">Coming soon</span>
              <p className="mt-1 text-xs text-muted-foreground">
                Generate a tailored variation from this exercise.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-medium capitalize text-foreground">{value}</div>
    </div>
  );
}

function ProgressionList({ title, slugs }: { title: string; slugs: string[] }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="font-display text-sm font-semibold">{title}</h3>
      {slugs.length === 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">None listed.</p>
      ) : (
        <ul className="mt-2 space-y-1">
          {slugs.map((s) => (
            <li key={s}>
              <Link
                to="/exercise/$slug"
                params={{ slug: s }}
                className="text-sm text-foreground/90 hover:text-primary hover:underline"
              >
                {s.replace(/-/g, " ")}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
