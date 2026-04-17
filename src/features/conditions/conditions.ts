import type { Condition } from "@/lib/types";

export const CONDITIONS: Condition[] = [
  {
    id: "scoliosis",
    label: "Scoliosis",
    shortLabel: "Scoliosis",
    description: "Favor symmetry, anti-rotation work, and supported variations when fatigue changes posture.",
    available: true,
  },
  {
    id: "arthritis",
    label: "Arthritis",
    shortLabel: "Arthritis",
    description: "Prefer controlled range of motion, lower joint stress, and pain-free loading.",
    available: true,
  },
  { id: "osteoporosis", label: "Osteoporosis", shortLabel: "Osteo", description: "", available: false },
  { id: "low_back_pain", label: "Chronic Low Back Pain", shortLabel: "Low Back", description: "", available: false },
  { id: "hypertension", label: "Hypertension", shortLabel: "BP", description: "", available: false },
  { id: "diabetes", label: "Diabetes", shortLabel: "Diabetes", description: "", available: false },
  { id: "parkinsons", label: "Parkinson's", shortLabel: "PD", description: "", available: false },
  { id: "hypermobility", label: "Hypermobility", shortLabel: "Hyper", description: "", available: false },
  { id: "pregnancy_postpartum", label: "Pregnancy / Postpartum", shortLabel: "Prenatal", description: "", available: false },
  { id: "rehab", label: "Rehab Mode", shortLabel: "Rehab", description: "", available: false },
];

export const CONDITIONS_BY_ID = Object.fromEntries(
  CONDITIONS.map((condition) => [condition.id, condition]),
) as Record<Condition["id"], Condition>;
