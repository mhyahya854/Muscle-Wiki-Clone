import type { Muscle } from "@/lib/types";

export const MUSCLES: Muscle[] = [
  { id: "upper_chest", name: "Upper Chest", region: "chest", view: "front" },
  { id: "mid_chest", name: "Chest", region: "chest", view: "front" },
  { id: "lower_chest", name: "Lower Chest", region: "chest", view: "front" },
  { id: "front_delts", name: "Front Delts", region: "shoulders", view: "front" },
  { id: "lateral_delts", name: "Lateral Delts", region: "shoulders", view: "front" },
  { id: "rear_delts", name: "Rear Delts", region: "shoulders", view: "back" },
  { id: "lats", name: "Lats", region: "back", view: "back" },
  { id: "traps", name: "Traps", region: "back", view: "back" },
  { id: "rhomboids", name: "Rhomboids", region: "back", view: "back" },
  { id: "spinal_erectors", name: "Lower Back", region: "back", view: "back" },
  { id: "biceps", name: "Biceps", region: "arms", view: "front" },
  { id: "triceps", name: "Triceps", region: "arms", view: "back" },
  { id: "forearms", name: "Forearms", region: "arms", view: "front" },
  { id: "abs", name: "Abs", region: "core", view: "front" },
  { id: "obliques", name: "Obliques", region: "core", view: "front" },
  { id: "glutes", name: "Glutes", region: "legs", view: "back" },
  { id: "quads", name: "Quads", region: "legs", view: "front" },
  { id: "hamstrings", name: "Hamstrings", region: "legs", view: "back" },
  { id: "calves", name: "Calves", region: "legs", view: "back" },
  { id: "adductors", name: "Adductors", region: "legs", view: "front" },
  { id: "abductors", name: "Abductors", region: "legs", view: "back" },
  { id: "hip_flexors", name: "Hip Flexors", region: "legs", view: "front" },
  { id: "tibialis", name: "Tibialis", region: "legs", view: "front" },
];

export const MUSCLES_BY_ID = Object.fromEntries(
  MUSCLES.map((muscle) => [muscle.id, muscle]),
) as Record<Muscle["id"], Muscle>;
