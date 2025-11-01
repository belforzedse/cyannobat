'use client'

import type { FC } from 'react'

import { Card } from '@/components/ui'
import { glassPanelStyles } from '@/components/ui/glass'
import { cn } from '@/lib/utils'
import { DAY_LABEL_LOOKUP } from '@/lib/staff/constants/providerAvailability'
import type { StaffProvider } from '@/lib/staff/types'

type ReadOnlyAvailabilityCardProps = {
  provider: StaffProvider
}

const ReadOnlyAvailabilityCard: FC<ReadOnlyAvailabilityCardProps> = ({ provider }) => {
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

      <div className="space-y-2 text-[11px]">
        {provider.availability.length > 0 ? (
          provider.availability.map((window, index) => (
            <div
              key={`${provider.id}-${window.day}-${index}`}
              className={cn(glassPanelStyles(), 'rounded-xl px-3 py-2')}
            >
              <span className="font-semibold text-foreground">
                {DAY_LABEL_LOOKUP[window.day] ?? window.day}
              </span>
              <span className="mx-1 text-muted-foreground/60">—</span>
              <span>
                {window.startTime} تا {window.endTime}
              </span>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-white/20 px-3 py-2 text-muted-foreground dark:border-white/15">
            بازه‌ای ثبت نشده است.
          </div>
        )}
        <p className="text-right text-[11px] text-muted-foreground">
          برای ویرایش این بازه‌ها به نقش پذیرش یا مدیریت نیاز دارید.
        </p>
      </div>
    </Card>
  )
}

export default ReadOnlyAvailabilityCard
