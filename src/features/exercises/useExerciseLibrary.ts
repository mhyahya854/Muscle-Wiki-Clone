import { useEffect, useState } from "react";
import type { ExerciseSummary } from "@/lib/types";
import { exerciseRepository } from "./exerciseRepository";

export function useExerciseLibrary() {
  const [exercises, setExercises] = useState<ExerciseSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    void exerciseRepository
      .getExerciseSummaries()
      .then((nextExercises) => {
        if (isMounted) {
          setExercises(nextExercises as unknown as ExerciseSummary[]);
        }
      })
      .catch((nextError: unknown) => {
        if (isMounted) {
          setError(
            nextError instanceof Error ? nextError.message : "Unable to load the exercise library.",
          );
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    exercises: exercises ?? [],
    isLoading: exercises === null && error === null,
    error,
  };
}
