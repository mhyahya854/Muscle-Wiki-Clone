import type {
  BodyRegion,
  ConditionId,
  Difficulty,
  Equipment,
  Sex,
  TrainingStyle,
} from "@/lib/types";
import { CONDITIONS } from "@/features/conditions/conditions";

export interface Filters {
  q: string;
  styles: TrainingStyle[];
  sex: Sex;
  regions: BodyRegion[];
  equipment: Equipment[];
  difficulty: Difficulty[];
  conditions: ConditionId[];
}

export const EMPTY_FILTERS: Filters = {
  q: "",
  styles: [],
  sex: "male",
  regions: [],
  equipment: [],
  difficulty: [],
  conditions: [],
};

const STYLE_OPTS: TrainingStyle[] = ["bodybuilding", "powerlifting", "calisthenics"];
const REGION_OPTS: BodyRegion[] = ["chest", "back", "shoulders", "arms", "core", "legs"];
const EQUIP_OPTS: Equipment[] = [
  "barbell",
  "dumbbell",
  "cable",
  "machine",
  "bodyweight",
  "kettlebell",
  "bands",
  "rings",
  "smith-machine",
  "medicine-ball",
  "foam-roll",
];
const DIFF_OPTS: Difficulty[] = ["beginner", "intermediate", "advanced"];

function toggle<T>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter((entry) => entry !== value) : [...arr, value];
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-all ${
        active
          ? "border-primary/60 bg-primary text-primary-foreground"
          : "border-border bg-surface text-muted-foreground hover:border-border-strong hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

export function FilterBar({
  filters,
  onChange,
  resultCount,
}: {
  filters: Filters;
  onChange: (filters: Filters) => void;
  resultCount: number;
}) {
  const update = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });

  return (
    <div className="sticky top-16 z-30 -mx-4 border-b border-border bg-background/85 px-4 py-4 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M11 19a8 8 0 110-16 8 8 0 010 16z"
              />
            </svg>
            <input
              value={filters.q}
              onChange={(event) => update({ q: event.target.value })}
              placeholder="Search exercises, muscles, equipment..."
              className="w-full rounded-full border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-full border border-border bg-surface p-0.5">
              {(["male", "female"] as Sex[]).map((sex) => (
                <button
                  key={sex}
                  onClick={() => update({ sex })}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                    filters.sex === sex
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {sex}
                </button>
              ))}
            </div>
            <span className="rounded-full border border-border bg-surface px-3 py-1.5 font-mono text-xs text-muted-foreground">
              {resultCount} results
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Section label="Style">
            {STYLE_OPTS.map((style) => (
              <Pill
                key={style}
                active={filters.styles.includes(style)}
                onClick={() => update({ styles: toggle(filters.styles, style) })}
              >
                {style}
              </Pill>
            ))}
          </Section>
          <Section label="Region">
            {REGION_OPTS.map((region) => (
              <Pill
                key={region}
                active={filters.regions.includes(region)}
                onClick={() => update({ regions: toggle(filters.regions, region) })}
              >
                {region}
              </Pill>
            ))}
          </Section>
          <Section label="Equipment">
            {EQUIP_OPTS.map((equipment) => (
              <Pill
                key={equipment}
                active={filters.equipment.includes(equipment)}
                onClick={() => update({ equipment: toggle(filters.equipment, equipment) })}
              >
                {equipment}
              </Pill>
            ))}
          </Section>
          <Section label="Level">
            {DIFF_OPTS.map((difficulty) => (
              <Pill
                key={difficulty}
                active={filters.difficulty.includes(difficulty)}
                onClick={() => update({ difficulty: toggle(filters.difficulty, difficulty) })}
              >
                {difficulty}
              </Pill>
            ))}
          </Section>
          <Section label="Conditions">
            {CONDITIONS.map((condition) => (
              <button
                key={condition.id}
                onClick={() => update({ conditions: toggle(filters.conditions, condition.id) })}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                  filters.conditions.includes(condition.id)
                    ? "border-primary/60 bg-primary text-primary-foreground"
                    : "border-border bg-surface text-muted-foreground hover:border-border-strong hover:text-foreground"
                }`}
                title={condition.description}
              >
                {condition.shortLabel}
              </button>
            ))}
          </Section>
        </div>
      </div>
    </div>
  );
}
