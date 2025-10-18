import { useCallback, useMemo, useState } from 'react';
import { mockAvailability, type AvailabilityDay, type AvailabilitySlot } from '@/data/mockAvailability';
import { progressSteps, reasonOptions, schedulePlaceholderMessage } from '../constants';
import { type CustomerInfo, type ProgressStepWithStatus, type SelectedSchedule, type StepStatus } from '../types';

const formatDateLabel = (value: string | null) => {
  if (!value) {
    return 'انتخاب نشده';
  }

  try {
    return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'long' }).format(new Date(`${value}T00:00:00`));
  } catch {
    return value;
  }
};

const formatTimeRange = (slot: AvailabilitySlot | null) => {
  if (!slot) {
    return 'انتخاب نشده';
  }

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':').map((part) => Number.parseInt(part, 10));
    if (Number.isNaN(hour) || Number.isNaN(minute)) {
      return time;
    }

    try {
      return new Intl.DateTimeFormat('fa-IR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'UTC',
      }).format(new Date(Date.UTC(2024, 0, 1, hour, minute)));
    } catch {
      return time;
    }
  };

  return `${formatTime(slot.start)} تا ${formatTime(slot.end)}`;
};

export const useBookingState = () => {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<SelectedSchedule | null>(null);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [additionalReason, setAdditionalReason] = useState('');
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    fullName: '',
    email: '',
    phone: '',
  });
  const [customerNotes, setCustomerNotes] = useState('');

  const availabilityForSelection = useMemo(() => {
    const merged = new Map<string, AvailabilityDay>();

    Object.values(mockAvailability).forEach((serviceAvailability) => {
      Object.values(serviceAvailability).forEach((doctorAvailability) => {
        doctorAvailability.forEach((day) => {
          const existingDay = merged.get(day.date);
          if (!existingDay) {
            merged.set(day.date, {
              date: day.date,
              slots: [...day.slots],
              note: day.note,
            });
            return;
          }

          const combinedSlots = [...existingDay.slots];
          day.slots.forEach((slot) => {
            if (!combinedSlots.some((existingSlot) => existingSlot.id === slot.id)) {
              combinedSlots.push(slot);
            }
          });

          merged.set(day.date, {
            date: day.date,
            slots: combinedSlots.sort((a, b) => a.start.localeCompare(b.start)),
            note: existingDay.note ?? day.note,
          });
        });
      });
    });

    return Array.from(merged.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, []);

  const handleDaySelect = useCallback((day: AvailabilityDay) => {
    setSelectedDay(day.date);
    setSelectedSchedule((currentSchedule) => {
      if (currentSchedule && currentSchedule.day.date === day.date) {
        return currentSchedule;
      }
      return null;
    });
  }, []);

  const handleSlotSelect = useCallback((slot: AvailabilitySlot, day: AvailabilityDay) => {
    setSelectedDay(day.date);
    setSelectedSchedule({ day, slot });
  }, []);

  const handleReasonToggle = useCallback((value: string) => {
    setSelectedReasons((prev) => {
      if (prev.includes(value)) {
        return prev.filter((reason) => reason !== value);
      }
      return [...prev, value];
    });
  }, []);

  const handleCustomerChange = useCallback((field: keyof CustomerInfo, value: string) => {
    setCustomerInfo((prev) => ({ ...prev, [field]: value }));
  }, []);

  const selectedReasonLabels = useMemo(
    () =>
      selectedReasons
        .map((reason) => reasonOptions.find((option) => option.value === reason)?.label ?? reason)
        .filter((label): label is string => Boolean(label)),
    [selectedReasons],
  );

  const isScheduleComplete = Boolean(selectedSchedule);
  const isReasonComplete = selectedReasons.length > 0 || additionalReason.trim().length > 0;
  const isCustomerComplete = Object.values(customerInfo).every((value) => value.trim().length > 0);

  const stepsWithStatus: ProgressStepWithStatus[] = useMemo(() => {
    const activeIndex = progressSteps.findIndex((step) => {
      if (step.key === 'dateTime') return !isScheduleComplete;
      if (step.key === 'reason') return !isReasonComplete;
      return !isCustomerComplete;
    });

    const resolvedActiveIndex = activeIndex === -1 ? progressSteps.length - 1 : activeIndex;

    return progressSteps.map((step, index) => {
      const complete =
        step.key === 'dateTime' ? isScheduleComplete : step.key === 'reason' ? isReasonComplete : isCustomerComplete;

      const status: StepStatus = complete ? 'complete' : index === resolvedActiveIndex ? 'current' : 'upcoming';

      return { ...step, status, index };
    });
  }, [isCustomerComplete, isReasonComplete, isScheduleComplete]);

  const formattedDate = useMemo(
    () => (selectedSchedule ? formatDateLabel(selectedSchedule.day.date) : formatDateLabel(selectedDay)),
    [selectedDay, selectedSchedule],
  );

  const formattedTime = useMemo(
    () => formatTimeRange(selectedSchedule?.slot ?? null),
    [selectedSchedule],
  );

  const isContinueDisabled = !isScheduleComplete || !isReasonComplete || !isCustomerComplete;

  const reasonSummary = useMemo(
    () =>
      isReasonComplete
        ? [
            ...selectedReasonLabels,
            additionalReason.trim() ? `توضیحات: ${additionalReason.trim()}` : null,
          ].filter((value): value is string => Boolean(value))
        : [],
    [additionalReason, isReasonComplete, selectedReasonLabels],
  );

  return {
    availabilityForSelection,
    selectedDay,
    selectedSchedule,
    handleDaySelect,
    handleSlotSelect,
    selectedReasons,
    handleReasonToggle,
    additionalReason,
    setAdditionalReason,
    customerInfo,
    handleCustomerChange,
    customerNotes,
    setCustomerNotes,
    stepsWithStatus,
    formattedDate,
    formattedTime,
    isContinueDisabled,
    isCustomerComplete,
    reasonSummary,
    schedulePlaceholderMessage,
  };
};
