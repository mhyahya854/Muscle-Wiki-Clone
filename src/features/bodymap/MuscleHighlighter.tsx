import Body, {
  type ExtendedBodyPart,
  type Slug as VendorSlug,
} from "./highlighter-core/index";
import type { BodyView, Sex } from "@/lib/types";

export interface HighlightItem {
  slug: string;
  color: string;
}

interface MuscleHighlighterProps {
  sex: Sex;
  view: BodyView;
  highlights: HighlightItem[];
  onPartEnter: (slug: string) => void;
  onPartLeave: () => void;
  onPartSelect: (slug: string) => void;
}

/**
 * A decoupled wrapper for the vendor Body component.
 * This isolates the vendor dependency and provides a neutral interface.
 */
export function MuscleHighlighter({
  sex,
  view,
  highlights,
  onPartEnter,
  onPartLeave,
  onPartSelect,
}: MuscleHighlighterProps) {
  const vendorData: ExtendedBodyPart[] = highlights.map((h) => ({
    slug: h.slug as VendorSlug,
    color: h.color,
  }));

  return (
    <Body
      data={vendorData}
      side={view}
      gender={sex}
      scale={1.08}
      defaultFill="var(--muscle-base)"
      defaultStroke="oklch(0.36 0.018 240)"
      defaultStrokeWidth={1}
      border="oklch(0.42 0.018 240)"
      onBodyPartEnter={(part) => {
        if (part.slug) onPartEnter(part.slug);
      }}
      onBodyPartLeave={onPartLeave}
      onBodyPartPress={(part) => {
        if (part.slug) onPartSelect(part.slug);
      }}
    />
  );
}
