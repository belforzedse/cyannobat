import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { ToastOptions } from '@/components/ui/ToastProvider';

import { type CustomerInfo, type SelectedSchedule } from '@/lib/booking/types';

const HOLD_TTL_SECONDS = 5 * 60;

const reasonMessages: Record<string, string> = {
  ALREADY_BOOKED: 'این زمان پیش‌تر رزرو شده است.',
  ALREADY_ON_HOLD: 'این زمان به طور موقت توسط کاربر دیگری نگه داشته شده است.',
  HOLD_NOT_FOUND: 'رزرو موقت معتبر یافت نشد. لطفاً دوباره تلاش کنید.',
  HOLD_RESERVED_FOR_DIFFERENT_CUSTOMER: 'این نوبت برای کاربر دیگری نگه داشته شده است.',
  HOLD_RESERVED_FOR_DIFFERENT_PROVIDER: 'این نوبت با پزشک دیگری هماهنگ شده است.',
  LEAD_TIME_NOT_MET: 'زمان انتخابی با محدودیت فاصله زمانی خدمت همخوانی ندارد.',
  PAST_SLOT: 'زمان انتخاب‌شده در گذشته است.',
  PROVIDER_NOT_AVAILABLE_FOR_SERVICE: 'پزشک انتخابی برای این خدمت در دسترس نیست.',
  PROVIDER_REQUIRED: 'انتخاب پزشک برای این رزرو ضروری است.',
  SERVICE_INACTIVE: 'این خدمت در حال حاضر فعال نیست.',
  SERVICE_NOT_FOUND: 'خدمت انتخابی یافت نشد.',
};

type HoldKey = { serviceId: string; slot: string; customerId: string };

type UseBookingSubmissionParams = {
  additionalReason: string;
  customerInfo: CustomerInfo;
  customerNotes: string;
  reasonSummary: string[];
  router: { push: (href: string) => void };
  selectedReasons: string[];
  selectedSchedule: SelectedSchedule | null;
  setActivity: (key: string, isActive: boolean, message?: string) => void;
  showToast: (options: ToastOptions) => void;
  isContinueDisabled: boolean;
};

type BookingSubmissionState = {
  isSubmitting: boolean;
  submitError: string | null;
  validationErrors: string[];
  bookingReference: string | null;
};

type BookingSubmissionResult = BookingSubmissionState & {
  isActionDisabled: boolean;
  handleContinue: () => Promise<void>;
};

const extractErrorMessages = (payload: unknown): string[] => {
  if (!payload || typeof payload !== 'object') return [];

  const details: string[] = [];
  if ('errors' in payload && Array.isArray((payload as { errors?: unknown }).errors)) {
    for (const issue of (payload as { errors?: unknown[] }).errors ?? []) {
      if (!issue || typeof issue !== 'object') continue;
      if ('message' in issue && typeof issue.message === 'string') {
        details.push(issue.message);
      }
    }
  }

  if ('reasons' in payload && Array.isArray((payload as { reasons?: unknown }).reasons)) {
    for (const reason of (payload as { reasons?: unknown[] }).reasons ?? []) {
      if (typeof reason !== 'string') continue;
      details.push(reasonMessages[reason] ?? reason);
    }
  }

  return details;
};

export const useBookingSubmission = ({
  additionalReason,
  customerInfo,
  customerNotes,
  reasonSummary,
  router,
  selectedReasons,
  selectedSchedule,
  setActivity,
  showToast,
  isContinueDisabled,
}: UseBookingSubmissionParams): BookingSubmissionResult => {
  const [state, setState] = useState<BookingSubmissionState>({
    isSubmitting: false,
    submitError: null,
    validationErrors: [],
    bookingReference: null,
  });
  const holdKeyRef = useRef<HoldKey | null>(null);

  const normalizedCustomer = useMemo(
    () => ({
      fullName: customerInfo.fullName.trim(),
      email: customerInfo.email.trim(),
      phone: customerInfo.phone.trim(),
    }),
    [customerInfo.email, customerInfo.fullName, customerInfo.phone],
  );

  const releaseHold = useCallback(async () => {
    if (!holdKeyRef.current) {
      return;
    }

    const holdKey = holdKeyRef.current;

    try {
      const response = await fetch('/api/hold', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(holdKey),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        console.warn('Failed to release booking hold', {
          status: response.status,
          payload,
        });
        showToast({
          variant: 'error',
          title: 'مشکل در آزادسازی نوبت',
          description: 'رزرو موقت آزاد نشد. در صورت تکرار، صفحه را تازه‌سازی کنید.',
        });
      }
    } catch (error) {
      console.error('Failed to release booking hold', error);
      showToast({
        variant: 'error',
        title: 'مشکل در آزادسازی نوبت',
        description: 'رزرو موقت آزاد نشد. در صورت تکرار، صفحه را تازه‌سازی کنید.',
      });
    } finally {
      holdKeyRef.current = null;
    }
  }, [showToast]);

  useEffect(() => {
    return () => {
      if (holdKeyRef.current) {
        void releaseHold();
      }
    };
  }, [releaseHold]);

  const handleContinue = useCallback(async () => {
    if (!selectedSchedule) {
      setState((current) => ({
        ...current,
        isSubmitting: false,
        submitError: 'لطفاً پیش از ادامه، زمان ملاقات را انتخاب کنید.',
        validationErrors: [],
      }));
      return;
    }

    const resolvedCustomerId = normalizedCustomer.email || normalizedCustomer.phone;
    const trimmedNotes = customerNotes.trim();
    const trimmedAdditionalReason = additionalReason.trim();

    setState({
      isSubmitting: true,
      submitError: null,
      validationErrors: [],
      bookingReference: null,
    });

    holdKeyRef.current = null;

    try {
      setActivity('booking-submit', true, 'در حال نهایی‌سازی نوبت...');
      const slot = selectedSchedule.slot;
      const holdResponse = await fetch('/api/hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: slot.serviceId,
          slot: slot.start,
          ttlSeconds: HOLD_TTL_SECONDS,
          providerId: slot.providerId,
          customerId: resolvedCustomerId || undefined,
          metadata: {
            day: selectedSchedule.day.date,
            serviceName: slot.serviceName,
            providerName: slot.providerName,
            reasons: selectedReasons,
            reasonSummary,
            additionalReason: trimmedAdditionalReason || undefined,
            customerInfo: normalizedCustomer,
            customerNotes: trimmedNotes || undefined,
          },
        }),
      });

      const holdPayload = await holdResponse.json().catch(() => null);

      if (!holdResponse.ok) {
        setState({
          isSubmitting: false,
          submitError: 'امکان نگه‌داشت موقت نوبت وجود ندارد. لطفاً دوباره تلاش کنید.',
          validationErrors: extractErrorMessages(holdPayload),
          bookingReference: null,
        });
        return;
      }

      if (
        holdPayload &&
        typeof holdPayload === 'object' &&
        'hold' in holdPayload &&
        holdPayload.hold &&
        typeof holdPayload.hold === 'object'
      ) {
        const hold = holdPayload.hold as {
          serviceId?: unknown;
          slot?: unknown;
          customerId?: unknown;
        };
        if (
          typeof hold.serviceId === 'string' &&
          typeof hold.slot === 'string' &&
          typeof hold.customerId === 'string'
        ) {
          holdKeyRef.current = {
            serviceId: hold.serviceId,
            slot: hold.slot,
            customerId: hold.customerId,
          };
        }
      }

      const bookingResponse = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: slot.serviceId,
          slot: slot.start,
          clientId:
            (holdPayload && typeof holdPayload === 'object' && 'hold' in holdPayload
              ? (holdPayload as { hold?: { customerId?: string } }).hold?.customerId
              : null) ?? resolvedCustomerId,
          providerId: slot.providerId,
          timeZone: slot.timeZone,
          clientNotes: trimmedNotes || undefined,
          metadata: {
            reasons: selectedReasons,
            reasonSummary,
            additionalReason: trimmedAdditionalReason || undefined,
            customerInfo: normalizedCustomer,
          },
        }),
      });

      const bookingPayload = await bookingResponse.json().catch(() => null);

      if (!bookingResponse.ok) {
        await releaseHold();
        setState({
          isSubmitting: false,
          submitError: 'ثبت نهایی نوبت با خطا مواجه شد. لطفاً دوباره تلاش کنید.',
          validationErrors: extractErrorMessages(bookingPayload),
          bookingReference: null,
        });
        return;
      }

      const appointmentReference =
        bookingPayload && typeof bookingPayload === 'object'
          ? (bookingPayload as { appointment?: { reference?: unknown } }).appointment?.reference
          : null;

      const reference = typeof appointmentReference === 'string' ? appointmentReference : null;

      setState({
        isSubmitting: false,
        submitError: null,
        validationErrors: [],
        bookingReference: reference,
      });

      if (reference) {
        router.push(`/reserve/confirmation?reference=${encodeURIComponent(reference)}`);
      } else {
        router.push('/reserve/confirmation');
      }
    } catch (error) {
      console.error('Failed to complete booking flow', error);
      await releaseHold();
      setState({
        isSubmitting: false,
        submitError: 'ثبت نوبت با خطا مواجه شد. لطفاً دوباره تلاش کنید.',
        validationErrors: [],
        bookingReference: null,
      });
    } finally {
      setActivity('booking-submit', false);
    }
  }, [
    additionalReason,
    customerNotes,
    normalizedCustomer,
    reasonSummary,
    releaseHold,
    router,
    selectedReasons,
    selectedSchedule,
    setActivity,
  ]);

  return {
    ...state,
    isActionDisabled: isContinueDisabled || state.isSubmitting,
    handleContinue,
  };
};

export type UseBookingSubmissionReturn = ReturnType<typeof useBookingSubmission>;
