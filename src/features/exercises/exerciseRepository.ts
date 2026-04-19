import type { ExerciseSummary, LiftMapExercise, MuscleId } from "@/lib/types";

// Dynamic imports are used to avoid bundling massive JSON files into the initial payload
// Vite will code-split these files naturally.

export const exerciseRepository = {
  async getExerciseSummaries(): Promise<ExerciseSummary[]> {
    const data = await import("@/data/generated/exerciseIndex.json");
    return (data.default || data) as unknown as ExerciseSummary[];
  },

  async getCounts() {
    const data = await import("@/data/generated/exerciseCounts.json");
    return data.default || data;
  },

  async getExerciseBySlug(slug: string): Promise<LiftMapExercise | undefined> {
    try {
      // Load only the individual exercise file (~5-10KB) instead of the 8MB monolith.
      // Vite code-splits these automatically since the path prefix is static.
      const data = await import(`@/data/generated/exercises/${slug}.json`);
      return (data.default || data) as LiftMapExercise;
    } catch {
      return undefined;
    }
  },

  async getExercisesByMuscle(muscleId: string): Promise<string[]> {
    const data = await import("@/data/generated/exercisesByMuscle.json");
    const map = data.default || data;
    return (map as Record<string, string[]>)[muscleId] || [];
  },

  async getExercisesByCondition(
    conditionId: string,
  ): Promise<{ suitable: string[]; caution: string[]; avoid: string[] }> {
    const data = await import("@/data/generated/exercisesByCondition.json");
    const map = data.default || data;
    return (
      (map as Record<string, { suitable: string[]; caution: string[]; avoid: string[] }>)[
        conditionId
      ] || { suitable: [], caution: [], avoid: [] }
    );
  },

  async getExerciseRelations(
    slug: string,
  ): Promise<{ progressions: string[]; regressions: string[]; related: string[] }> {
    const data = await import("@/data/generated/exerciseRelations.json");
    const relations = data.default || data;
    return (
      (
        relations as Record<
          string,
          { progressions: string[]; regressions: string[]; related: string[] }
        >
      )[slug] || {
        progressions: [],
        regressions: [],
        related: [],
      }
    );
  },
};
