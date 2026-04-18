import { useEffect, useState } from "react";
import type { Exercise } from "@/lib/types";
import { loadExerciseLibrary } from "./exerciseLibrary";

export function useExerciseLibrary() {
  const [exercises, setExercises] = useState<Exercise[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    void loadExerciseLibrary()
      .then((nextExercises) => {
        if (isMounted) {
          setExercises(nextExercises);
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
