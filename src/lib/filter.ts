import type { ExerciseSummary } from "@/lib/types";
import type { Filters } from "@/features/exercises/FilterBar";
import { MUSCLES_BY_ID } from "@/features/bodymap/muscles";

export function applyFilters(list: ExerciseSummary[], filters: Filters): ExerciseSummary[] {
  const query = filters.q.trim().toLowerCase();

  return list.filter((exercise) => {
    if (
      filters.styles.length &&
      !exercise.trainingStyles.some((style) => filters.styles.includes(style))
    )
      return false;
    if (
      filters.equipment.length &&
      !exercise.equipment.some((equipment) => filters.equipment.includes(equipment))
    )
      return false;
    if (filters.difficulty.length && !filters.difficulty.includes(exercise.difficulty))
      return false;

    if (filters.regions.length) {
      const regions = new Set(
        [...exercise.primaryMuscles, ...exercise.secondaryMuscles]
          .map((muscle) => MUSCLES_BY_ID[muscle]?.region)
          .filter(Boolean) as string[],
      );
      if (!filters.regions.some((region) => regions.has(region))) return false;
    }

    if (filters.conditions.length) {
      const matchesConditions = filters.conditions.every((conditionId) => {
        const suitability = exercise.conditions?.[conditionId];
        return !suitability || suitability !== "avoid";
      });
      if (!matchesConditions) return false;
    }

    if (query) {
      const searchStr = exercise.searchStr || "";
      if (!searchStr.includes(query)) return false;
    }

    if (!exercise.sexModelSupport.includes(filters.sex)) return false;
    return true;
  });
}
