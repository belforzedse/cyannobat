'use client';

import SchedulePicker from '@/components/SchedulePicker';
import { type AvailabilityDay, type AvailabilitySlot } from '@/data/mockAvailability';

const cardClasses =
  'rounded-2xl sm:rounded-3xl border border-white/25 bg-white/45 p-4 sm:p-5 lg:p-6 shadow-[0_18px_40px_-28px_rgba(31,38,135,0.3)] backdrop-blur-sm dark:border-white/10 dark:bg-black/50';

type ScheduleSectionProps = {
  availability: AvailabilityDay[];
  selectedDay: string | null;
  selectedSlotId: string | null;
  onSelectDay: (day: AvailabilityDay) => void;
  onSelectSlot: (slot: AvailabilitySlot, day: AvailabilityDay) => void;
  placeholderMessage: string;
};

const ScheduleSection = ({
  availability,
  selectedDay,
  selectedSlotId,
  onSelectDay,
  onSelectSlot,
  placeholderMessage,
}: ScheduleSectionProps) => (
  <div className={cardClasses}>
    <div className="flex flex-col items-end gap-1 sm:gap-2 text-right">
      <h3 className="text-sm font-semibold text-foreground">تاریخ و زمان</h3>
      <p className="text-xs leading-6 text-muted-foreground">روز و ساعت دلخواه را انتخاب کنید تا یادآورها را دریافت نمایید.</p>
    </div>
    <div className="mt-4 sm:mt-5 lg:mt-6">
      <SchedulePicker
        availability={availability}
        selectedDay={selectedDay}
        selectedSlotId={selectedSlotId}
        onSelectDay={onSelectDay}
        onSelectSlot={onSelectSlot}
        placeholderMessage={placeholderMessage}
        emptyMessage="در حال حاضر زمانی در دسترس نیست. لطفاً بعداً دوباره بررسی کنید."
      />
    </div>
  </div>
);

export default ScheduleSection;
