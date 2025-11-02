'use client';

import BookingSummary from './BookingSummary';
import { type CustomerInfo } from '@/lib/booking/types';

type BookingSummaryPanelProps = {
  prefersReducedMotion: boolean | null;
  isContinueDisabled: boolean;
  formattedDate: string;
  formattedTime: string;
  reasonSummary: string[];
  customerInfo: CustomerInfo;
  customerNotes: string;
  isCustomerComplete: boolean;
  serviceLabel: string;
  providerLabel: string;
};

const BookingSummaryPanel = (props: BookingSummaryPanelProps) => {
  return <BookingSummary {...props} />;
};

export default BookingSummaryPanel;
