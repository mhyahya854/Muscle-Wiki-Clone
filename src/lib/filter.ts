import type { Exercise } from "@/lib/types";
import type { Filters } from "@/features/exercises/FilterBar";
import { MUSCLES_BY_ID } from "@/features/bodymap/muscles";

export function applyFilters(list: Exercise[], filters: Filters): Exercise[] {
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
        const note = exercise.conditionNotes.find((entry) => entry.conditionId === conditionId);
        return note && note.suitability !== "avoid";
      });
      if (!matchesConditions) return false;
    }

    if (query) {
      const haystack = [
        exercise.name,
        exercise.bodyRegion,
        ...exercise.tags,
        ...exercise.equipment,
        ...exercise.trainingStyles,
        ...exercise.primaryMuscles.map((muscle) => MUSCLES_BY_ID[muscle]?.name ?? ""),
        ...exercise.secondaryMuscles.map((muscle) => MUSCLES_BY_ID[muscle]?.name ?? ""),
      ]
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(query)) return false;
    }

    if (!exercise.sexModelSupport.includes(filters.sex)) return false;
    return true;
  });
}
