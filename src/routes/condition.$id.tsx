import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { CONDITIONS_BY_ID } from "@/features/conditions/conditions";
import { ExerciseCard } from "@/features/exercises/ExerciseCard";
import { loadExerciseLibrary } from "@/features/exercises/exerciseLibrary";
import type { ConditionId, ConditionSuitability, Exercise } from "@/lib/types";

type SectionKey = ConditionSuitability;

export const Route = createFileRoute("/condition/$id")({
  loader: async ({ params }) => {
    const condition = CONDITIONS_BY_ID[params.id as ConditionId];
    if (!condition) throw notFound();

    const all = await loadExerciseLibrary();
    const suitable = all.filter((exercise) => {
      const note = exercise.conditionNotes.find((entry) => entry.conditionId === condition.id);
      return note?.suitability === "suitable";
    });
    const caution = all.filter((exercise) => {
      const note = exercise.conditionNotes.find((entry) => entry.conditionId === condition.id);
      return note?.suitability === "caution";
    });
    const avoid = all.filter((exercise) => {
      const note = exercise.conditionNotes.find((entry) => entry.conditionId === condition.id);
      return note?.suitability === "avoid";
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

  const defaultSection: SectionKey = suitable.length
    ? "suitable"
    : caution.length
      ? "caution"
      : "avoid";
  const [activeSection, setActiveSection] = useState<SectionKey>(defaultSection);

  const sections = {
    suitable: {
      title: "Recommended & Suitable",
      description: "Exercises currently marked as suitable in the local library.",
      items: suitable,
      tone: "success",
    },
    caution: {
      title: "Use Caution / Modify",
      description: "Exercises that usually need load, range-of-motion, or setup changes.",
      items: caution,
      tone: "warning",
    },
    avoid: {
      title: "Generally Avoid",
      description: "Exercises currently flagged as poor fits for this condition in the library.",
      items: avoid,
      tone: "danger",
    },
  } as const;

  const active = sections[activeSection];

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
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {condition.description}
          </p>
        </div>

        <div className="shrink-0 rounded-2xl border border-border bg-card p-6 lg:w-80">
          <h2 className="font-display text-sm font-semibold">Library Stats</h2>
          <div className="mt-4 space-y-3">
            <StatRow label="Suitable" count={suitable.length} color="text-success" />
            <StatRow label="Caution" count={caution.length} color="text-warning" />
            <StatRow label="Avoid" count={avoid.length} color="text-danger" />
          </div>
        </div>
      </div>

      <section className="mt-12 rounded-3xl border border-border bg-card p-6 shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold">{active.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{active.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <SectionButton
              label="Suitable"
              count={suitable.length}
              tone="success"
              active={activeSection === "suitable"}
              onClick={() => setActiveSection("suitable")}
            />
            <SectionButton
              label="Caution"
              count={caution.length}
              tone="warning"
              active={activeSection === "caution"}
              onClick={() => setActiveSection("caution")}
            />
            <SectionButton
              label="Avoid"
              count={avoid.length}
              tone="danger"
              active={activeSection === "avoid"}
              onClick={() => setActiveSection("avoid")}
            />
          </div>
        </div>

        {active.items.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
            <h3 className="font-display text-xl font-semibold">No exercises in this section</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              The current library does not have results for this condition bucket yet.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {active.items.map((exercise) => (
              <div key={exercise.id} className="space-y-2">
                <ExerciseCard exercise={exercise} />
                <div
                  className={`rounded-xl border p-3 text-xs leading-relaxed ${
                    active.tone === "success"
                      ? "border-success/10 bg-success/5 text-foreground/80"
                      : active.tone === "warning"
                        ? "border-warning/10 bg-warning/5 text-warning/90"
                        : "border-danger/10 bg-danger/5 text-danger/90"
                  }`}
                >
                  {
                    exercise.conditionNotes.find((entry) => entry.conditionId === condition.id)
                      ?.note
                  }
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function SectionButton({
  label,
  count,
  tone,
  active,
  onClick,
}: {
  label: string;
  count: number;
  tone: "success" | "warning" | "danger";
  active: boolean;
  onClick: () => void;
}) {
  const activeClasses =
    tone === "success"
      ? "border-success/40 bg-success text-background"
      : tone === "warning"
        ? "border-warning/40 bg-warning text-background"
        : "border-danger/40 bg-danger text-background";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? activeClasses
          : "border-border bg-surface text-muted-foreground hover:border-border-strong hover:text-foreground"
      }`}
    >
      {label} ({count})
    </button>
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
