import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ConditionBadge } from "@/features/conditions/ConditionBadge";
import { CONDITIONS_BY_ID } from "@/features/conditions/conditions";
import { MUSCLES_BY_ID } from "@/features/bodymap/muscles";
import { ExerciseCard } from "@/features/exercises/ExerciseCard";
import { exerciseRepository } from "@/features/exercises/exerciseRepository";
import { ExerciseThumb } from "@/features/exercises/ExerciseThumb";
import { GalleryStrip } from "@/features/exercises/GalleryStrip";
import type { ConditionNote, Exercise } from "@/lib/types";

export const Route = createFileRoute("/exercise/$slug")({
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { exercise } = loaderData as { exercise: Exercise };
    return {
      meta: [
        { title: `${exercise.name} - LiftMap Exercise Guide` },
        {
          name: "description",
          content: `Master the ${exercise.name} with our detailed guide. Target muscles: ${exercise.primaryMuscles.join(", ")}. Difficulty: ${exercise.difficulty}.`,
        },
        { property: "og:title", content: `${exercise.name} - LiftMap` },
        {
          property: "og:description",
          content: `Expert guide for ${exercise.name}. Learn proper form, variations, and more.`,
        },
      ],
    };
  },
  loader: async ({ params }) => {
    // Batch 1: Core exercise data and relations
    const [exercise, relations] = await Promise.all([
      exerciseRepository.getExerciseBySlug(params.slug),
      exerciseRepository.getExerciseRelations(params.slug),
    ]);

    if (!exercise) throw notFound();

    const relatedSlugs = relations.related || [];
    const regressionSlugs = relations.regressions || [];
    const progressionSlugs = relations.progressions || [];
    const relationsSlugs = [...new Set([...relatedSlugs, ...regressionSlugs, ...progressionSlugs])];

    // Batch 2: Start resolving relations objects while fetching muscle-similarity lists
    // This allows related/regression/progression images to start loading while we compute "similar" exercises.
    const [muscleSlugLists, relationsMap] = await Promise.all([
      Promise.all(exercise.primaryMuscles.map((m) => exerciseRepository.getExercisesByMuscle(m))),
      (async () => {
        const fetched = await Promise.all(
          relationsSlugs.map((s) => exerciseRepository.getExerciseBySlug(s)),
        );
        const map = new Map<string, Exercise>();
        fetched.forEach((e) => {
          if (e) map.set(e.slug, e);
        });
        return map;
      })(),
    ]);

    // Batch 3: Resolve any missing slugs from muscle (similarity) lists
    const muscleOrder = muscleSlugLists.flat();
    const muscleSlugsToResolve = [...new Set(muscleOrder)].filter(
      (s) => s !== exercise.slug && !relationsMap.has(s),
    );

    const fetchedMuscles = await Promise.all(
      muscleSlugsToResolve.map((s) => exerciseRepository.getExerciseBySlug(s)),
    );

    // Merge into final slug map
    const slugMap = new Map<string, Exercise>(relationsMap);
    fetchedMuscles.forEach((e) => {
      if (e) slugMap.set(e.slug, e);
    });

    const related = relatedSlugs.map((s) => slugMap.get(s)).filter(Boolean) as Exercise[];
    const regressionExercises = regressionSlugs
      .map((s) => slugMap.get(s))
      .filter(Boolean) as Exercise[];
    const progressionExercises = progressionSlugs
      .map((s) => slugMap.get(s))
      .filter(Boolean) as Exercise[];

    // Preserve muscle-order preference when selecting similar exercises
    const similarSlugsOrdered = [...new Set(muscleOrder)].filter((s) => s !== exercise.slug);
    const similarExercises = similarSlugsOrdered
      .slice(0, 4)
      .map((s) => slugMap.get(s))
      .filter(Boolean) as Exercise[];

    return { exercise, related, regressionExercises, progressionExercises, similarExercises };
  },
  component: ExercisePage,
});

const SUIT_RANK: Record<ConditionNote["suitability"], number> = {
  avoid: 0,
  caution: 1,
  suitable: 2,
};

function ExercisePage() {
  const { exercise, related, regressionExercises, progressionExercises, similarExercises } =
    Route.useLoaderData() as {
      exercise: Exercise;
      related: Exercise[];
      regressionExercises: Exercise[];
      progressionExercises: Exercise[];
      similarExercises: Exercise[];
    };

  const primary = exercise.primaryMuscles.map((muscle) => MUSCLES_BY_ID[muscle]).filter(Boolean);
  const secondary = exercise.secondaryMuscles
    .map((muscle) => MUSCLES_BY_ID[muscle])
    .filter(Boolean);
  const conditions = [...exercise.conditionNotes].sort(
    (a, b) => SUIT_RANK[a.suitability] - SUIT_RANK[b.suitability],
  );
  const galleryImages = [
    ...new Set(
      [
        ...(exercise.media.animation ? [exercise.media.animation] : []),
        ...(exercise.media.hero ? [exercise.media.hero] : []),
        ...(exercise.media.thumbnail ? [exercise.media.thumbnail] : []),
        ...exercise.media.gallery,
      ].filter(Boolean),
    ),
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        to="/explore"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
        </svg>
        Back to Explore
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-card">
            <div className="relative aspect-[16/9] overflow-hidden">
              <ExerciseThumb exercise={exercise} showInitials={false} preferAnimation />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/70 to-transparent p-6">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-background/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-foreground/80 backdrop-blur">
                    {exercise.movementPattern}
                  </span>
                  <span className="rounded-full bg-background/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-foreground/80 backdrop-blur">
                    {exercise.difficulty}
                  </span>
                  {exercise.trainingStyles.map((style) => (
                    <span
                      key={style}
                      className="rounded-full bg-background/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-foreground/80 backdrop-blur"
                    >
                      {style}
                    </span>
                  ))}
                </div>
                <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                  {exercise.name}
                </h1>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-border p-4 sm:grid-cols-4">
              <Fact label="Primary" value={primary.map((muscle) => muscle.name).join(", ")} />
              <Fact
                label="Secondary"
                value={secondary.map((muscle) => muscle.name).join(", ") || "-"}
              />
              <Fact label="Equipment" value={exercise.equipment.join(", ")} />
              <Fact label="Movement" value={exercise.movementPattern} />
            </div>
          </div>

          <GalleryStrip images={galleryImages} name={exercise.name} />

          <section className="mt-10 rounded-2xl border border-border bg-card p-6 shadow-card">
            <h2 className="font-display text-xl font-semibold">Instructions</h2>
            <ol className="mt-4 space-y-3">
              {exercise.instructions.map((step, index) => (
                <li
                  key={index}
                  className="flex gap-3 rounded-xl border border-border bg-surface p-4"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary font-mono text-xs font-bold text-primary-foreground">
                    {index + 1}
                  </span>
                  <span className="text-sm text-foreground/90">{step}</span>
                </li>
              ))}
            </ol>
          </section>

          {exercise.tags.length > 0 && (
            <section className="mt-8">
              <h2 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Tags
              </h2>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {exercise.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border bg-surface px-2.5 py-1 text-xs text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          )}

          <section className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ProgressionList
              title="Regressions"
              items={regressionExercises}
              slugFallbacks={exercise.regressions}
            />
            <ProgressionList
              title="Progressions"
              items={progressionExercises}
              slugFallbacks={exercise.progressions}
            />
          </section>

          {related.length > 0 && (
            <section className="mt-12">
              <h2 className="font-display text-xl font-semibold">Related exercises</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {related.map((entry) => (
                  <ExerciseCard key={entry.id} exercise={entry} />
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h2 className="font-display text-base font-semibold">Variation suggestion</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Based on the current difficulty level, try one of these next:
            </p>
            <div className="mt-3 space-y-2">
              {exercise.difficulty === "advanced" && regressionExercises.length > 0 && (
                <VariationSuggestion
                  label="Easier variation"
                  exercise={regressionExercises[0]}
                  color="text-success"
                />
              )}
              {exercise.difficulty === "beginner" && progressionExercises.length > 0 && (
                <VariationSuggestion
                  label="Next step up"
                  exercise={progressionExercises[0]}
                  color="text-primary"
                />
              )}
              {exercise.difficulty === "intermediate" && (
                <>
                  {regressionExercises.length > 0 && (
                    <VariationSuggestion
                      label="Easier option"
                      exercise={regressionExercises[0]}
                      color="text-success"
                    />
                  )}
                  {progressionExercises.length > 0 && (
                    <VariationSuggestion
                      label="Harder option"
                      exercise={progressionExercises[0]}
                      color="text-primary"
                    />
                  )}
                </>
              )}
              {regressionExercises.length === 0 &&
                progressionExercises.length === 0 &&
                similarExercises
                  .slice(0, 2)
                  .map((entry) => (
                    <VariationSuggestion
                      key={entry.id}
                      label="Similar target"
                      exercise={entry}
                      color="text-muted-foreground"
                    />
                  ))}
              {regressionExercises.length === 0 &&
                progressionExercises.length === 0 &&
                similarExercises.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No direct progressions or regressions are catalogued yet.
                  </p>
                )}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-semibold">Condition considerations</h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Exercise-specific notes from the current LiftMap library.
            </p>

            <ul className="mt-4 space-y-3">
              {conditions.map((note) => {
                const condition = CONDITIONS_BY_ID[note.conditionId];
                return (
                  <li
                    key={note.conditionId}
                    className="rounded-xl border border-border bg-surface p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-foreground">
                        {condition?.label ?? note.conditionId}
                      </span>
                      <ConditionBadge note={note} compact />
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      {note.note}
                    </p>
                  </li>
                );
              })}
            </ul>

            <div className="mt-4">
              <Link to="/conditions" className="text-xs text-primary hover:underline">
                Browse all conditions →
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-3">
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm font-medium capitalize text-foreground">{value}</div>
    </div>
  );
}

function VariationSuggestion({
  label,
  exercise,
  color,
}: {
  label: string;
  exercise: Exercise;
  color: string;
}) {
  return (
    <Link
      to="/exercise/$slug"
      params={{ slug: exercise.slug }}
      className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2 text-sm transition-colors hover:border-border-strong hover:bg-surface-elevated"
    >
      <div>
        <div className={`font-mono text-[10px] uppercase tracking-widest ${color}`}>{label}</div>
        <div className="mt-0.5 font-medium text-foreground">{exercise.name}</div>
      </div>
      <svg
        className="h-4 w-4 text-muted-foreground"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6l6 6-6 6" />
      </svg>
    </Link>
  );
}

function ProgressionList({
  title,
  items,
  slugFallbacks,
}: {
  title: string;
  items: Exercise[];
  slugFallbacks: string[];
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h2 className="font-display text-sm font-semibold">{title}</h2>
      {items.length === 0 && slugFallbacks.length === 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">None listed.</p>
      ) : items.length > 0 ? (
        <ul className="mt-2 space-y-1">
          {items.map((exercise) => (
            <li key={exercise.id}>
              <Link
                to="/exercise/$slug"
                params={{ slug: exercise.slug }}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-foreground/90 transition-colors hover:bg-surface hover:text-primary"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                {exercise.name}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="mt-2 space-y-1">
          {slugFallbacks.map((slug) => (
            <li key={slug} className="px-2 py-1 text-sm capitalize text-muted-foreground">
              {slug.replace(/-/g, " ")}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
