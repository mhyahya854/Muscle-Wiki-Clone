import type { Condition } from "@/lib/types";

// All 10 conditions are now active with descriptions.
// Condition notes for each exercise are inferred in normalization.ts.
export const CONDITIONS: Condition[] = [
  {
    id: "scoliosis",
    label: "Scoliosis",
    shortLabel: "Scoliosis",
    description:
      "Favor symmetry, anti-rotation work, and supported variations when fatigue changes posture.",
    available: true,
  },
  {
    id: "arthritis",
    label: "Arthritis",
    shortLabel: "Arthritis",
    description: "Prefer controlled range of motion, lower joint stress, and pain-free loading.",
    available: true,
  },
  {
    id: "osteoporosis",
    label: "Osteoporosis",
    shortLabel: "Osteo",
    description:
      "Prioritize weight-bearing and resistance exercises. Avoid high-impact movements and spinal flexion under load.",
    available: true,
  },
  {
    id: "low_back_pain",
    label: "Low Back Pain",
    shortLabel: "Low Back",
    description:
      "Avoid loaded spinal flexion and heavy hinge patterns. Favor core bracing, hip hinge alternatives, and supported positions.",
    available: true,
  },
  {
    id: "hypertension",
    label: "Hypertension",
    shortLabel: "High BP",
    description:
      "Avoid sustained breath-holding (Valsalva). Prefer moderate intensity with consistent breathing and avoid isometric holds.",
    available: true,
  },
  {
    id: "diabetes",
    label: "Diabetes",
    shortLabel: "Diabetes",
    description:
      "Monitor blood sugar around exercise. Both aerobic and resistance training are beneficial with proper monitoring.",
    available: true,
  },
  {
    id: "parkinsons",
    label: "Parkinson's",
    shortLabel: "PD",
    description:
      "Focus on balance, functional movement, and exercises that challenge coordination. Avoid high fall-risk positions.",
    available: true,
  },
  {
    id: "hypermobility",
    label: "Hypermobility",
    shortLabel: "Hyper",
    description:
      "Avoid pushing through end range of motion. Prioritize muscle co-contraction and joint stability over deep stretches.",
    available: true,
  },
  {
    id: "pregnancy_postpartum",
    label: "Pregnancy / Postpartum",
    shortLabel: "Prenatal",
    description:
      "Avoid supine positions after first trimester, heavy Valsalva, and high-impact loading. Focus on functional patterns and pelvic floor health.",
    available: true,
  },
  {
    id: "rehab",
    label: "Rehab Mode",
    shortLabel: "Rehab",
    description:
      "Start with reduced load, shortened ROM, and higher reps. Build tissue tolerance before adding complexity.",
    available: true,
  },
];

export const CONDITIONS_BY_ID = Object.fromEntries(
  CONDITIONS.map((condition) => [condition.id, condition]),
) as Record<Condition["id"], Condition>;
