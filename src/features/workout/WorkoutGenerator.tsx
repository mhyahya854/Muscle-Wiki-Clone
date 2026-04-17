import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import type { Exercise, MuscleId, Equipment, ConditionId } from "@/lib/types";
import { MUSCLES } from "@/features/bodymap/muscles";
import { CONDITIONS } from "@/features/conditions/conditions";
import { buildWorkout, workoutToText, type WorkoutInput, type GeneratedWorkout } from "./workoutBuilder";
import { ExerciseThumb } from "../exercises/ExerciseThumb";
import { ExerciseCard } from "../exercises/ExerciseCard";

const EQUIP_OPTIONS: { id: Equipment; label: string }[] = [
  { id: "barbell", label: "Barbell" },
  { id: "dumbbell", label: "Dumbbells" },
  { id: "kettlebell", label: "Kettlebell" },
  { id: "cable", label: "Cables" },
  { id: "machine", label: "Machines" },
  { id: "bodyweight", label: "Bodyweight" },
  { id: "bands", label: "Bands" },
  { id: "rings", label: "Rings" },
];

export function WorkoutGenerator({ allExercises }: { allExercises: Exercise[] }) {
  const [step, setStep] = useState(1);
  const [sex, setSex] = useState<import("@/lib/types").Sex>("male");
  const [muscles, setMuscles] = useState<MuscleId[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [conditions, setConditions] = useState<ConditionId[]>([]);
  const [duration, setDuration] = useState<20 | 35 | 50>(35);
  const [workout, setWorkout] = useState<GeneratedWorkout | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const toggle = <T,>(list: T[], item: T) =>
    list.includes(item) ? list.filter((i) => i !== item) : [...list, item];

  const handleGenerate = () => {
    const input: WorkoutInput = { sex, muscles, equipment, conditions, duration };
    const result = buildWorkout(allExercises, input);
    setWorkout(result);
    setStep(6); // Result step
  };

  const handleCopy = () => {
    if (!workout) return;
    navigator.clipboard.writeText(workoutToText(workout));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const reset = () => {
    setStep(1);
    setWorkout(null);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Progress Bar */}
      {step < 6 && (
        <div className="mb-12">
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <span
                key={s}
                className={`font-mono text-[10px] uppercase tracking-widest ${step >= s ? "text-primary" : "text-muted-foreground"}`}
              >
                Step {s}
              </span>
            ))}
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-border">
            <div
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Step 1: Sex / Profile */}
      {step === 1 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
          <h2 className="mb-2 font-display text-3xl font-bold">Build your profile</h2>
          <p className="mb-12 text-muted-foreground">Tailored for your anatomical starting point.</p>

          <div className="flex justify-center gap-6 mb-12">
            {(["male", "female"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSex(s)}
                className={`relative flex h-32 w-32 flex-col items-center justify-center rounded-2xl border transition-all ${
                  sex === s
                    ? "border-primary bg-primary/10 scale-105 shadow-glow"
                    : "border-border bg-card hover:border-border-strong opacity-60"
                }`}
              >
                <span className="text-xl font-bold capitalize">{s}</span>
                {sex === s && (
                  <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                    <svg className="h-4 w-4 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>

          <button
            onClick={() => setStep(2)}
            className="w-full max-w-xs rounded-full bg-primary py-4 font-bold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]"
          >
            Start: Pick Muscles
          </button>
        </div>
      )}

      {/* Step 2: Muscles */}
      {step === 2 && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
          <h2 className="mb-2 font-display text-3xl font-bold">Target Muscles</h2>
          <p className="mb-8 text-muted-foreground">Select the muscles you want to focus on today.</p>

          <div className="grid grid-cols-2 gap-2 mb-10 sm:grid-cols-4">
            {MUSCLES.map((m) => (
              <button
                key={m.id}
                onClick={() => setMuscles(toggle(muscles, m.id))}
                className={`flex flex-col items-start p-3 rounded-xl border transition-all ${
                  muscles.includes(m.id)
                    ? "border-primary/60 bg-primary/10 ring-1 ring-primary/30"
                    : "border-border bg-card hover:border-border-strong"
                }`}
              >
                <span className="text-sm font-medium">{m.name}</span>
                <span className="font-mono text-[10px] uppercase text-muted-foreground">
                  {m.region}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep(1)}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]"
            >
              Next: Equipment
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Equipment */}
      {step === 3 && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
          <h2 className="mb-2 font-display text-3xl font-bold">What handles are available?</h2>
          <p className="mb-8 text-muted-foreground">We'll filter the library to match your gym setup.</p>

          <div className="grid grid-cols-2 gap-3 mb-10 sm:grid-cols-4">
            {EQUIP_OPTIONS.map((e) => (
              <button
                key={e.id}
                onClick={() => setEquipment(toggle(equipment, e.id))}
                className={`p-4 rounded-xl border text-center transition-all ${
                  equipment.includes(e.id)
                    ? "border-primary/60 bg-primary/10 ring-1 ring-primary/30"
                    : "border-border bg-card hover:border-border-strong"
                }`}
              >
                <div className="text-sm font-semibold">{e.label}</div>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep(2)}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Back
            </button>
            <button
              onClick={() => setStep(4)}
              className="rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]"
            >
              Next: Conditions
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Conditions */}
      {step === 4 && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
          <h2 className="mb-2 font-display text-3xl font-bold">Any health considerations?</h2>
          <p className="mb-8 text-muted-foreground">We'll prioritize safe variations for your profile.</p>

          <div className="mb-10 space-y-3">
            {CONDITIONS.map((c) => (
              <button
                key={c.id}
                onClick={() => setConditions(toggle(conditions, c.id))}
                className={`w-full flex items-start gap-4 p-4 rounded-xl border text-left transition-all ${
                  conditions.includes(c.id)
                    ? "border-primary/60 bg-primary/10 ring-1 ring-primary/30"
                    : "border-border bg-card hover:border-border-strong"
                }`}
              >
                <div
                  className={`mt-1 h-2 w-2 shrink-0 rounded-full ${conditions.includes(c.id) ? "bg-primary" : "bg-muted"}`}
                />
                <div>
                  <div className="text-sm font-semibold">{c.label}</div>
                  <div className="text-xs leading-relaxed text-muted-foreground">{c.description}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep(3)}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Back
            </button>
            <button
              onClick={() => setStep(5)}
              className="rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]"
            >
              Next: Duration
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Duration */}
      {step === 5 && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500 text-center">
          <h2 className="mb-2 font-display text-3xl font-bold">How much time do you have?</h2>
          <p className="mb-12 text-muted-foreground">Balanced sessions tailored for your window.</p>

          <div className="mb-12 flex flex-wrap justify-center gap-4">
            {[20, 35, 50].map((d) => (
              <button
                key={d}
                onClick={() => setDuration(d as 20 | 35 | 50)}
                className={`relative flex h-32 w-32 flex-col items-center justify-center rounded-full border transition-all ${
                  duration === d
                    ? "border-primary bg-primary/10 scale-110 shadow-glow"
                    : "border-border bg-card hover:border-border-strong"
                }`}
              >
                <span className="text-2xl font-bold">{d}</span>
                <span className="font-mono text-[10px] uppercase text-muted-foreground">Minutes</span>
                {duration === d && (
                  <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                    <svg className="h-4 w-4 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <button
              onClick={handleGenerate}
              className="w-full rounded-full bg-primary py-4 text-lg font-bold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]"
            >
              Generate My Session
            </button>
            <button
              onClick={() => setStep(4)}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Back
            </button>
          </div>
        </div>
      )}

      {/* Step 6: Results */}
      {step === 6 && workout && (
        <div className="animate-in fade-in zoom-in-95 duration-500">
          <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="font-display text-4xl font-bold tracking-tight">{workout.title}</h2>
              <p className="mt-2 text-muted-foreground">{workout.summary}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-elevated"
              >
                {isCopied ? "Copied!" : "Share/Copy"}
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
              </button>
              <button
                onClick={reset}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]"
              >
                New Plan
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {workout.exercises.map((item, i) => (
              <div
                key={`${item.exercise.id}-${i}`}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:border-border-strong"
              >
                <div className="flex flex-col sm:flex-row">
                  <div className="relative h-32 shrink-0 overflow-hidden sm:h-auto sm:w-48">
                    <ExerciseThumb
                      exercise={item.exercise}
                      className="transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute left-2 top-2 rounded bg-background/80 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-foreground/80 backdrop-blur">
                      {item.phase}
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <Link
                          to="/exercise/$slug"
                          params={{ slug: item.exercise.slug }}
                          className="font-display text-xl font-bold transition-colors hover:text-primary"
                        >
                          {item.exercise.name}
                        </Link>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold text-primary">{item.sets}</span>
                          <span className="font-mono text-[10px] uppercase text-muted-foreground">Sets</span>
                        </div>
                      </div>
                      <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-foreground">{item.reps}</span> reps
                        </div>
                        <div className="h-1 w-1 rounded-full bg-border" />
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-foreground">{item.rest}</span> rest
                        </div>
                      </div>
                    </div>

                    {item.note && (
                      <div className="mt-4 flex gap-2 items-start rounded-lg border border-warning/10 bg-warning/5 p-3 text-xs text-warning/90">
                        <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span>
                          <strong>Condition Note:</strong> {item.note}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-3xl border border-border bg-surface p-8 text-center">
            <h3 className="mb-2 font-display text-xl font-bold">Ready to start?</h3>
            <p className="mb-6 text-sm text-muted-foreground">
              You can save this workout by copying the summary, or just follow along here.
            </p>
            <button
              onClick={handleCopy}
              className="rounded-full border border-border bg-card px-8 py-3 font-semibold text-foreground transition-colors hover:bg-surface-elevated"
            >
              Copy Text Summary
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
