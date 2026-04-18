import { createFileRoute } from "@tanstack/react-router";
import { useExerciseLibrary } from "@/features/exercises/useExerciseLibrary";
import { WorkoutGenerator } from "@/features/workout/WorkoutGenerator";

export const Route = createFileRoute("/workout-generator")({
  component: WorkoutGeneratorPage,
});

function WorkoutGeneratorPage() {
  const { exercises, isLoading, error } = useExerciseLibrary();

  return (
    <main>
      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <h1 className="text-center font-display text-4xl font-bold tracking-tight">
          Workout Generator
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
          Build a balanced training session in seconds. Pick your targets, your tools, and your
          window, then let LiftMap assemble the session.
        </p>
      </div>
      <WorkoutGenerator allExercises={exercises} isLoadingExercises={isLoading} loadError={error} />
    </main>
  );
}
