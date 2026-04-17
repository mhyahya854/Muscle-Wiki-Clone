import { createFileRoute, Link } from "@tanstack/react-router";
import { CONDITIONS } from "@/features/conditions/conditions";
import { exerciseSource } from "@/features/exercises/exerciseSource";
import type { Exercise } from "@/lib/types";

export const Route = createFileRoute("/conditions")({
  loader: async () => {
    const all = await exerciseSource.list();
    return { all };
  },
  component: ConditionsPage,
});

function ConditionsPage() {
  const { all } = Route.useLoaderData() as { all: Exercise[] };

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Condition Library
        </h1>
        <p className="mt-4 mx-auto max-w-2xl text-lg text-muted-foreground">
          Evidence-based training considerations for various health conditions. Browse each
          condition to find suitable exercises and specific modification notes.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {CONDITIONS.map((condition) => {
          const suitableCount = all.filter((e) => {
            const note = e.conditionNotes.find((n) => n.conditionId === condition.id);
            return note && note.suitability === "suitable";
          }).length;

          return (
            <Link
              key={condition.id}
              to="/condition/$id"
              params={{ id: condition.id }}
              className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-1 hover:border-border-strong hover:shadow-glow"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-primary">
                    {suitableCount} suitable exercises
                  </span>
                  <svg
                    className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </div>
                <h2 className="mt-4 font-display text-2xl font-bold">{condition.label}</h2>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {condition.description}
                </p>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-full bg-surface-elevated px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
                  Browse modifications
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      <section className="mt-16 rounded-3xl border border-dashed border-border bg-card/40 p-8 text-center sm:p-12">
        <h2 className="font-display text-2xl font-semibold">Important Disclaimer</h2>
        <p className="mt-4 mx-auto max-w-3xl text-sm text-muted-foreground leading-relaxed">
          These guidelines are for educational purposes and informational intent only. LiftMap does
          not provide medical advice, diagnosis, or treatment. Always seek the advice of your
          physician or other qualified health provider with any questions you may have regarding a
          medical condition. Never disregard professional medical advice or delay in seeking it
          because of something you have read in the LiftMap library.
        </p>
      </section>
    </main>
  );
}
