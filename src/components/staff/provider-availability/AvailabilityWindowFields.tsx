'use client';

import { X } from 'lucide-react';
import type { FC } from 'react';

import { Button, Input, Select } from '@/components/ui';
import type { ProviderAvailabilityDayOption } from '@/lib/staff/constants/providerAvailability';
import type { StaffProviderAvailabilityWindow } from '@/lib/staff/types';

type AvailabilityWindowFieldsProps = {
  index: number;
  window: StaffProviderAvailabilityWindow;
  dayOptions: readonly ProviderAvailabilityDayOption[];
  disabled?: boolean;
  onChange: (index: number, field: keyof StaffProviderAvailabilityWindow, value: string) => void;
  onRemove: (index: number) => void;
};

const AvailabilityWindowFields: FC<AvailabilityWindowFieldsProps> = ({
  index,
  window,
  dayOptions,
  disabled = false,
  onChange,
  onRemove,
}) => {
  return (
    <div className="space-y-2 rounded-xl border border-white/20 bg-white/10 p-3 text-[11px] dark:border-white/15 dark:bg-white/5">
      <Select
        value={window.day}
        onChange={(event) => onChange(index, 'day', event.target.value)}
        options={dayOptions.map((option) => ({
          value: option.value,
          label: option.label,
        }))}
        aria-label="روز هفته"
        disabled={disabled}
      />
      <div className="grid grid-cols-2 gap-2">
        <Input
          type="time"
          value={window.startTime}
          onChange={(event) => onChange(index, 'startTime', event.target.value)}
          aria-label="زمان شروع"
          disabled={disabled}
        />
        <Input
          type="time"
          value={window.endTime}
          onChange={(event) => onChange(index, 'endTime', event.target.value)}
          aria-label="زمان پایان"
          disabled={disabled}
        />
      </div>
      <div className="flex justify-end">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onRemove(index)}
          leftIcon={<X className="h-4 w-4" />}
          disabled={disabled}
        >
          حذف بازه
        </Button>
      </div>
    </div>
  );
};

export default AvailabilityWindowFields;
