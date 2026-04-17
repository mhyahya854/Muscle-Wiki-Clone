import { createFileRoute } from "@tanstack/react-router";
import { workoutBuilder } from "@/features/workout/workoutBuilder"; // Correcting import if it's there, but actually WorkoutGenerator component handles logic
import { WorkoutGenerator } from "@/features/workout/WorkoutGenerator";
import { exerciseSource } from "@/features/exercises/exerciseSource";

export const Route = createFileRoute("/workout-generator")({
  loader: () => exerciseSource.list(),
  component: WorkoutGeneratorPage,
});

function WorkoutGeneratorPage() {
  const allExercises = Route.useLoaderData() as import("@/lib/types").Exercise[];
  return (
    <main>
      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl font-bold tracking-tight text-center">Smart Workout Generator</h1>
        <p className="mt-4 text-center text-muted-foreground mx-auto max-w-2xl">
          Build a balanced, professional-grade training session in seconds. 
          Pick your targets, your tools, and your window — we'll handle the programming.
        </p>
      </div>
      <WorkoutGenerator allExercises={allExercises} />
    </main>
  );
}
