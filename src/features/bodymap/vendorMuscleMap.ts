import type { BodyView, MuscleId, VendorBodySlug } from "@/lib/types";
import { MUSCLES } from "./muscles";

export { type VendorBodySlug };

export const VENDOR_SLUG_BY_MUSCLE: Partial<Record<MuscleId, VendorBodySlug>> = Object.fromEntries(
  MUSCLES.filter((m) => m.vendorSlug).map((m) => [m.id, m.vendorSlug as VendorBodySlug]),
);

const buildDefaultMuscleMap = (view: BodyView) => {
  const map: Partial<Record<VendorBodySlug, MuscleId>> = {};
  MUSCLES.filter((m) => m.view === view && m.vendorSlug && m.isDefault).forEach((m) => {
    map[m.vendorSlug as VendorBodySlug] = m.id;
  });
  return map;
};

export const DEFAULT_MUSCLE_BY_VENDOR_SLUG_AND_VIEW: Record<
  BodyView,
  Partial<Record<VendorBodySlug, MuscleId>>
> = {
  front: buildDefaultMuscleMap("front"),
  back: buildDefaultMuscleMap("back"),
};
