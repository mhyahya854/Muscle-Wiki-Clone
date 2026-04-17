import type { ConditionNote } from "@/lib/types";
import { CONDITIONS_BY_ID } from "@/features/conditions/conditions";

// Suitability logic is based on current condition notes. Manual review recommended for edge cases.
const STYLES: Record<ConditionNote["suitability"], { dot: string; ring: string; label: string }> = {
  suitable: {
    dot: "bg-success",
    ring: "ring-success/30 text-success",
    label: "Generally suitable",
  },
  caution: {
    dot: "bg-warning",
    ring: "ring-warning/30 text-warning",
    label: "Use caution",
  },
  avoid: {
    dot: "bg-danger",
    ring: "ring-danger/30 text-danger",
    label: "Usually avoid or modify",
  },
};

export function ConditionBadge({
  note,
  compact = false,
}: {
  note: ConditionNote;
  compact?: boolean;
}) {
  const condition = CONDITIONS_BY_ID[note.conditionId];
  const style = STYLES[note.suitability];
  return (
    <span
      title={`${condition?.label}: ${style.label}`}
      className={`inline-flex items-center gap-1.5 rounded-full bg-surface-elevated px-2.5 py-1 text-xs font-medium ring-1 ${style.ring}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {compact
        ? (condition?.shortLabel ?? note.conditionId)
        : (condition?.label ?? note.conditionId)}
    </span>
  );
}
