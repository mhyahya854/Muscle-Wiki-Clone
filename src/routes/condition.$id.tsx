import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CONDITIONS_BY_ID } from "@/features/conditions/conditions";
import { exerciseSource } from "@/features/exercises/exerciseSource";
import { ExerciseCard } from "@/features/exercises/ExerciseCard";
import type { ConditionId, Exercise } from "@/lib/types";

export const Route = createFileRoute("/condition/$id")({
  loader: async ({ params }) => {
    const condition = CONDITIONS_BY_ID[params.id as ConditionId];
    if (!condition) throw notFound();

    const all = await exerciseSource.list();
    const suitable = all.filter((e) => {
      const note = e.conditionNotes.find((n) => n.conditionId === condition.id);
      return note && note.suitability === "suitable";
    });
    const caution = all.filter((e) => {
      const note = e.conditionNotes.find((n) => n.conditionId === condition.id);
      return note && note.suitability === "caution";
    });
    const avoid = all.filter((e) => {
      const note = e.conditionNotes.find((n) => n.conditionId === condition.id);
      return note && note.suitability === "avoid";
    });

    return { condition, suitable, caution, avoid };
  },
  component: ConditionDetailPage,
});

function ConditionDetailPage() {
  const { condition, suitable, caution, avoid } = Route.useLoaderData() as {
    condition: import("@/lib/types").Condition;
    suitable: Exercise[];
    caution: Exercise[];
    avoid: Exercise[];
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        to="/conditions"
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
        Back to Conditions
      </Link>

      <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="flex-1">
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
            {condition.label}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl leading-relaxed">
            {condition.description}
          </p>
        </div>

        <div className="shrink-0 rounded-2xl border border-border bg-card p-6 lg:w-80">
          <h3 className="font-display text-sm font-semibold">Library Stats</h3>
          <div className="mt-4 space-y-3">
            <StatRow label="Suitable" count={suitable.length} color="text-success" />
            <StatRow label="Caution" count={caution.length} color="text-warning" />
            <StatRow label="Generally Avoid" count={avoid.length} color="text-danger" />
          </div>
        </div>
      </div>

      <div className="mt-16 space-y-16">
        {/* Suitable */}
        {suitable.length > 0 && (
          <section>
            <div className="mb-6 flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-success" />
              <h2 className="font-display text-2xl font-bold">Recommended & Suitable</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {suitable.map((e) => (
                <div key={e.id} className="relative">
                  <ExerciseCard exercise={e} />
                  <div className="mt-2 text-[10px] text-muted-foreground px-1 leading-tight italic">
                    {e.conditionNotes.find((n) => n.conditionId === condition.id)?.note}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Caution */}
        {caution.length > 0 && (
          <section>
            <div className="mb-6 flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-warning" />
              <h2 className="font-display text-2xl font-bold">Use Caution / Modify</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 opacity-80 transition-opacity hover:opacity-100">
              {caution.map((e) => (
                <div key={e.id} className="relative">
                  <ExerciseCard exercise={e} />
                  <div className="mt-2 text-[10px] text-warning px-1 leading-tight bg-warning/5 rounded-md p-2 border border-warning/10">
                    <strong>Modification:</strong>{" "}
                    {e.conditionNotes.find((n) => n.conditionId === condition.id)?.note}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Avoid */}
        {avoid.length > 0 && (
          <section className="rounded-3xl border border-danger/10 bg-danger/5 p-8">
            <div className="mb-6 flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-danger" />
              <h2 className="font-display text-xl font-bold text-danger">Generally Avoid</h2>
            </div>
            <p className="mb-6 text-sm text-danger/80">
              These exercises are typically contraindicated for {condition.label.toLowerCase()} due
              to biochemical stressors or mechanics. If performing these, extreme caution and
              professional supervision is advised.
            </p>
            <div className="flex flex-wrap gap-2">
              {avoid.map((e) => (
                <Link
                  key={e.id}
                  to="/exercise/$slug"
                  params={{ slug: e.slug }}
                  className="rounded-full border border-danger/20 bg-card px-3 py-1.5 text-xs font-medium text-danger/70 hover:bg-danger/20 transition-colors"
                >
                  {e.name}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function StatRow({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`font-mono text-sm font-bold ${color}`}>{count}</span>
    </div>
  );
}
