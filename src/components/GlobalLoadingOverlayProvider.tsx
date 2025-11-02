'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import GlobalLoadingOverlay from './GlobalLoadingOverlay';

type ActiveRequest = { key: string; message?: string };

type GlobalLoadingOverlayContextValue = {
  /**
   * Toggle a keyed loading activity. When at least one activity is active the overlay is shown.
   * Later calls with the same key update the message.
   */
  setActivity: (key: string, active: boolean, message?: string) => void;
  /**
   * Convenience helper to wrap async work with the overlay.
   */
  withOverlay: <T>(key: string, task: () => Promise<T>, message?: string) => Promise<T>;
};

const GlobalLoadingOverlayContext = createContext<GlobalLoadingOverlayContextValue | undefined>(
  undefined,
);

type GlobalLoadingOverlayProviderProps = {
  children: ReactNode;
  defaultMessage?: string;
};

export const GlobalLoadingOverlayProvider = ({
  children,
  defaultMessage = 'در حال بارگذاری...',
}: GlobalLoadingOverlayProviderProps) => {
  const [activeRequests, setActiveRequests] = useState<ActiveRequest[]>([]);

  const setActivity = useCallback((key: string, active: boolean, message?: string) => {
    setActiveRequests((current) => {
      if (active) {
        const existingIndex = current.findIndex((request) => request.key === key);
        if (existingIndex >= 0) {
          const updated = [...current];
          updated[existingIndex] = { key, message };
          return updated;
        }
        return [...current, { key, message }];
      }

      if (current.length === 0) {
        return current;
      }

      return current.filter((request) => request.key !== key);
    });
  }, []);

  const withOverlay = useCallback<GlobalLoadingOverlayContextValue['withOverlay']>(
    async (key, task, message) => {
      setActivity(key, true, message);
      try {
        return await task();
      } finally {
        setActivity(key, false);
      }
    },
    [setActivity],
  );

  const latestMessage =
    activeRequests.length > 0 ? activeRequests[activeRequests.length - 1]?.message : undefined;

  const contextValue = useMemo<GlobalLoadingOverlayContextValue>(
    () => ({
      setActivity,
      withOverlay,
    }),
    [setActivity, withOverlay],
  );

  return (
    <GlobalLoadingOverlayContext.Provider value={contextValue}>
      {children}
      <GlobalLoadingOverlay
        active={activeRequests.length > 0}
        message={latestMessage ?? defaultMessage}
      />
    </GlobalLoadingOverlayContext.Provider>
  );
};

export const useGlobalLoadingOverlay = () => {
  const context = useContext(GlobalLoadingOverlayContext);
  if (!context) {
    throw new Error('useGlobalLoadingOverlay must be used within a GlobalLoadingOverlayProvider');
  }
  return context;
};
