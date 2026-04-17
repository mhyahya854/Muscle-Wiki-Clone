import type { MuscleId } from "@/lib/types";

export type VendorBodySlug =
  | "abs"
  | "adductors"
  | "biceps"
  | "calves"
  | "chest"
  | "deltoids"
  | "forearm"
  | "gluteal"
  | "hamstring"
  | "lower-back"
  | "neck"
  | "obliques"
  | "quadriceps"
  | "tibialis"
  | "trapezius"
  | "triceps"
  | "upper-back";

export const VENDOR_SLUG_BY_MUSCLE: Partial<Record<MuscleId, VendorBodySlug>> = {
  upper_chest: "chest",
  mid_chest: "chest",
  lower_chest: "chest",
  front_delts: "deltoids",
  lateral_delts: "deltoids",
  rear_delts: "deltoids",
  lats: "upper-back",
  traps: "trapezius",
  rhomboids: "upper-back",
  spinal_erectors: "lower-back",
  biceps: "biceps",
  triceps: "triceps",
  forearms: "forearm",
  abs: "abs",
  obliques: "obliques",
  glutes: "gluteal",
  quads: "quadriceps",
  hamstrings: "hamstring",
  calves: "calves",
  adductors: "adductors",
  abductors: "hamstring",
  tibialis: "tibialis",
};

export const DEFAULT_MUSCLE_BY_VENDOR_SLUG: Record<VendorBodySlug, MuscleId> = {
  abs: "abs",
  adductors: "adductors",
  biceps: "biceps",
  calves: "calves",
  chest: "mid_chest",
  deltoids: "front_delts",
  forearm: "forearms",
  gluteal: "glutes",
  hamstring: "hamstrings",
  "lower-back": "spinal_erectors",
  neck: "traps",
  obliques: "obliques",
  quadriceps: "quads",
  tibialis: "tibialis",
  trapezius: "traps",
  triceps: "triceps",
  "upper-back": "lats",
};
