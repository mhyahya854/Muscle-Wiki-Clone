import { MuscleHighlighter, type HighlightItem } from "@/features/bodymap/MuscleHighlighter";
import type { BodyView, MuscleId, Sex } from "@/lib/types";
import {
  DEFAULT_MUSCLE_BY_VENDOR_SLUG_AND_VIEW,
  VENDOR_SLUG_BY_MUSCLE,
  type VendorBodySlug,
} from "@/features/bodymap/vendorMuscleMap";

interface Props {
  sex: Sex;
  view: BodyView;
  selected: MuscleId | null;
  hovered: MuscleId | null;
  onHover: (muscle: MuscleId | null) => void;
  onSelect: (muscle: MuscleId) => void;
}

function toLiftMapMuscle(slug: string, view: BodyView) {
  return DEFAULT_MUSCLE_BY_VENDOR_SLUG_AND_VIEW[view][slug as VendorBodySlug];
}

export function BodyMap({ sex, view, selected, hovered, onHover, onSelect }: Props) {
  const highlights: HighlightItem[] = [];
  const hoveredSlug = hovered ? VENDOR_SLUG_BY_MUSCLE[hovered] : undefined;
  const selectedSlug = selected ? VENDOR_SLUG_BY_MUSCLE[selected] : undefined;

  if (hoveredSlug) {
    highlights.push({ slug: hoveredSlug, color: "var(--muscle-hover)" });
  }
  if (selectedSlug) {
    highlights.push({ slug: selectedSlug, color: "var(--muscle-active)" });
  }

  return (
    <div className="flex h-full w-full items-center justify-center rounded-3xl border border-border bg-gradient-to-b from-card to-card/60 p-4 shadow-card">
      <MuscleHighlighter
        sex={sex}
        view={view}
        highlights={highlights}
        onPartEnter={(slug) => onHover(toLiftMapMuscle(slug, view) ?? null)}
        onPartLeave={() => onHover(null)}
        onPartSelect={(slug) => {
          const muscle = toLiftMapMuscle(slug, view);
          if (muscle) onSelect(muscle);
        }}
      />
    </div>
  );
}
