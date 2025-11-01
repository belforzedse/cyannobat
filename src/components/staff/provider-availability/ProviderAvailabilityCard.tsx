'use client'

import { Plus } from 'lucide-react'
import type { FC } from 'react'

import { Button, Card } from '@/components/ui'
import type { ProviderAvailabilityDayOption } from '@/lib/staff/constants/providerAvailability'
import type {
  StaffProvider,
  StaffProviderAvailabilityWindow,
} from '@/lib/staff/types'

import AvailabilityWindowFields from './AvailabilityWindowFields'

type ProviderAvailabilityCardProps = {
  provider: StaffProvider
  windows: StaffProviderAvailabilityWindow[]
  dayOptions: readonly ProviderAvailabilityDayOption[]
  errorMessage: string | null
  isSaving: boolean
  hasChanges: boolean
  onAddWindow: () => void
  onSave: () => void
  onWindowChange: (
    index: number,
    field: keyof StaffProviderAvailabilityWindow,
    value: string,
  ) => void
  onRemoveWindow: (index: number) => void
}

const ProviderAvailabilityCard: FC<ProviderAvailabilityCardProps> = ({
  provider,
  windows,
  dayOptions,
  errorMessage,
  isSaving,
  hasChanges,
  onAddWindow,
  onSave,
  onWindowChange,
  onRemoveWindow,
}) => {
  return (
    <Card
      key={provider.id}
      variant="subtle"
      padding="sm"
      className="flex flex-col gap-3 transition-transform hover:scale-[1.01] sm:p-6"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-foreground">{provider.displayName}</span>
        <span className="text-[11px] text-muted-foreground">منطقه زمانی: {provider.timeZone}</span>
      </div>

      <div className="flex flex-col gap-3">
        {windows.length > 0 ? (
          windows.map((window, index) => (
            <AvailabilityWindowFields
              key={`${provider.id}-${index}`}
              index={index}
              window={window}
              dayOptions={dayOptions}
              disabled={isSaving}
              onChange={onWindowChange}
              onRemove={onRemoveWindow}
            />
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-white/20 px-3 py-5 text-center text-[11px] text-muted-foreground dark:border-white/15">
            هنوز بازه‌ای برای این ارائه‌دهنده ثبت نشده است.
          </div>
        )}

        {errorMessage && <p className="text-right text-xs text-red-500">{errorMessage}</p>}

        <div className="flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onAddWindow}
            disabled={isSaving}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            افزودن بازه
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onSave}
            disabled={isSaving || !hasChanges}
            isLoading={isSaving}
          >
            ذخیره تغییرات
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default ProviderAvailabilityCard
