export type ProviderAvailabilityDayOption = {
  value: string;
  label: string;
};

export const DAY_OPTIONS: readonly ProviderAvailabilityDayOption[] = [
  { value: 'saturday', label: 'شنبه' },
  { value: 'sunday', label: 'یکشنبه' },
  { value: 'monday', label: 'دوشنبه' },
  { value: 'tuesday', label: 'سه‌شنبه' },
  { value: 'wednesday', label: 'چهارشنبه' },
  { value: 'thursday', label: 'پنج‌شنبه' },
  { value: 'friday', label: 'جمعه' },
] as const;

export const DAY_LABEL_LOOKUP: Record<string, string> = DAY_OPTIONS.reduce(
  (accumulator, option) => {
    accumulator[option.value] = option.label;
    return accumulator;
  },
  {} as Record<string, string>,
);
