import Body, { type ExtendedBodyPart, type Slug as VendorSlug } from "@/vendor/bodymap/react-muscle-highlighter/index";
import type { BodyView, MuscleId, Sex } from "@/lib/types";
import { DEFAULT_MUSCLE_BY_VENDOR_SLUG, VENDOR_SLUG_BY_MUSCLE, type VendorBodySlug } from "@/features/bodymap/vendorMuscleMap";

interface Props {
  sex: Sex;
  view: BodyView;
  selected: MuscleId | null;
  hovered: MuscleId | null;
  onHover: (muscle: MuscleId | null) => void;
  onSelect: (muscle: MuscleId) => void;
}

function asVendorSlug(value: VendorBodySlug): VendorSlug {
  return value as VendorSlug;
}

function toVendorSlug(muscle: MuscleId | null) {
  return muscle ? VENDOR_SLUG_BY_MUSCLE[muscle] : undefined;
}

export function BodyMap({ sex, view, selected, hovered, onHover, onSelect }: Props) {
  const selectedSlug = toVendorSlug(selected);
  const hoveredSlug = toVendorSlug(hovered);
  const parts = new Map<VendorBodySlug, ExtendedBodyPart>();

  if (hoveredSlug) {
    parts.set(hoveredSlug, { slug: asVendorSlug(hoveredSlug), color: "var(--muscle-hover)" });
  }
  if (selectedSlug) {
    parts.set(selectedSlug, { slug: asVendorSlug(selectedSlug), color: "var(--muscle-active)" });
  }

  return (
    <div className="flex h-full w-full items-center justify-center rounded-3xl border border-border bg-gradient-to-b from-card to-card/60 p-4 shadow-card">
      <Body
        data={[...parts.values()]}
        side={view}
        gender={sex}
        scale={1.08}
        defaultFill="var(--muscle-base)"
        defaultStroke="oklch(0.36 0.018 240)"
        defaultStrokeWidth={1}
        border="oklch(0.42 0.018 240)"
        onBodyPartPress={(part) => {
          const muscle = part.slug ? DEFAULT_MUSCLE_BY_VENDOR_SLUG[part.slug as VendorBodySlug] : undefined;
          if (muscle) onSelect(muscle);
        }}
      />
    </div>
  );
}
