/** Shop + admin attribute options (PDF filter set). */

export const FIT_OPTIONS = ["Athletic", "Regular", "Relaxed", "Compression"] as const;
export type FitOption = (typeof FIT_OPTIONS)[number];

export const ACTIVITY_OPTIONS = ["Gym", "Run", "Training", "Casual", "Team", "Match"] as const;
export type ActivityOption = (typeof ACTIVITY_OPTIONS)[number];

export function isFitOption(value: string | undefined | null): value is FitOption {
  return !!value && (FIT_OPTIONS as readonly string[]).includes(value);
}

export function isActivityOption(value: string | undefined | null): value is ActivityOption {
  return !!value && (ACTIVITY_OPTIONS as readonly string[]).includes(value);
}
