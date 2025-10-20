'use client'

import clsx from 'clsx'
import { motion, useReducedMotion } from 'framer-motion'

import { Card } from '@/components/ui'
import { type ServiceOption } from '@/features/booking/types'
import { luxuryContainer, luxuryPresets, luxurySlideFade } from '@/lib/luxuryAnimations'

const listContainerClasses = 'grid gap-3 sm:grid-cols-2 lg:grid-cols-3'

const ServiceSectionSkeleton = () => (
  <div className={listContainerClasses}>
    {Array.from({ length: 3 }).map((_, index) => (
      <div
        key={index}
        className="h-32 animate-pulse rounded-2xl border border-white/20 bg-white/40 backdrop-blur-sm dark:border-white/10 dark:bg-black/40"
      />
    ))}
  </div>
)

type ServiceSectionProps = {
  services: ServiceOption[]
  selectedServiceId: string | null
  onSelectService: (serviceId: string) => void
  isLoading: boolean
  errorMessage?: string | null
  onRetry?: () => void
}

const formatDuration = (minutes?: number | null) => {
  if (!minutes) return null
  return `${minutes} دقیقه`
}

const ServiceSection = ({
  services,
  selectedServiceId,
  onSelectService,
  isLoading,
  errorMessage,
  onRetry,
}: ServiceSectionProps) => {
  const prefersReducedMotion = useReducedMotion()
  const reduceMotion = Boolean(prefersReducedMotion)

  const sectionVariants = reduceMotion ? undefined : luxuryPresets.silk('up')
  const listVariants = reduceMotion ? undefined : luxuryContainer
  const itemVariants = reduceMotion
    ? undefined
    : luxurySlideFade('up', {
        distance: 24,
        duration: 0.6,
        delayIn: 0.08,
      })

  const motionStates = reduceMotion ? {} : { initial: 'initial' as const, animate: 'animate' as const }

  return (
    <motion.section variants={sectionVariants} {...motionStates}>
      <Card variant="muted" padding="lg" className="sm:rounded-3xl">
      <div className="flex flex-col items-end gap-1 text-right sm:gap-2">
        <h3 className="text-sm font-semibold text-foreground">انتخاب خدمت درمانی</h3>
        <p className="text-xs leading-6 text-muted-foreground">
          ابتدا یکی از خدمات فعال کلینیک را برگزینید تا زمان‌های آزاد همان خدمت برای شما نمایش داده شود. در صورت تغییر خدمت،
          برنامه زمانی نیز بر اساس انتخاب جدید به‌روز خواهد شد.
        </p>
      </div>

      <div className="mt-4 sm:mt-5 lg:mt-6">
        {errorMessage ? (
          <div className="flex flex-col items-end gap-3 rounded-2xl border border-dashed border-red-300/50 bg-white/40 p-6 text-right text-sm text-red-500 dark:border-red-300/30 dark:bg-white/10">
            <p>{errorMessage}</p>
            {onRetry ? (
              <button
                type="button"
                onClick={onRetry}
                className="rounded-full border border-red-400/60 px-4 py-2 text-xs font-semibold text-red-600 transition-all duration-300 ease-out hover:bg-red-50 dark:border-red-300/40 dark:text-red-200 dark:hover:bg-red-500/10"
              >
                تلاش دوباره
              </button>
            ) : null}
          </div>
        ) : isLoading ? (
          <ServiceSectionSkeleton />
        ) : services.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/30 bg-white/40 p-6 text-sm text-muted-foreground dark:border-white/15 dark:bg-black/30">
            در حال حاضر خدمتی برای رزرو آنلاین فعال نشده است. لطفاً بعداً مراجعه کنید یا با پذیرش تماس بگیرید.
          </div>
        ) : (
          <motion.div
            className={listContainerClasses}
            variants={listVariants}
            {...motionStates}
          >
            {services.map((service) => {
              const isSelected = service.id === selectedServiceId
              const durationLabel = formatDuration(service.durationMinutes)

              return (
                <motion.button
                  key={service.id}
                  type="button"
                  onClick={() => onSelectService(service.id)}
                  className={clsx(
                    'flex h-full flex-col items-end gap-2 rounded-2xl border px-4 py-3 text-right',
                    // Smooth, slow transitions for all properties
                    'transition-all duration-300 ease-out',
                    'border-white/20 bg-white/55 hover:border-accent/50 hover:bg-white/75',
                    'dark:border-white/15 dark:bg-black/45 dark:hover:border-accent/40 dark:hover:bg-black/55',
                    isSelected &&
                      'border-accent/70 bg-accent/20 text-accent shadow-[0_18px_42px_-30px_rgba(88,175,192,0.6)] dark:border-accent/40 dark:bg-accent/15',
                  )}
                  aria-pressed={isSelected}
                  variants={itemVariants}
                >
                  <span className="text-sm font-semibold">{service.title}</span>
                  {service.category ? (
                    <span className="text-[11px] font-medium text-muted-foreground">{service.category}</span>
                  ) : null}
                  {durationLabel ? (
                    <span className="text-[11px] text-muted-foreground">مدت زمان تقریبی: {durationLabel}</span>
                  ) : null}
                </motion.button>
              )
            })}
          </motion.div>
        )}
      </div>
      </Card>
    </motion.section>
  )
}

export default ServiceSection
