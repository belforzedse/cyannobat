'use client'

import type { FC } from 'react'

import type { StaffProvider, StaffUser } from '@/lib/staff/types'
import ProviderAvailabilityCard from '@/components/staff/provider-availability/ProviderAvailabilityCard'
import ReadOnlyAvailabilityCard from '@/components/staff/provider-availability/ReadOnlyAvailabilityCard'
import { useProviderAvailabilityEditor } from '@/hooks/staff/useProviderAvailabilityEditor'

import type { StaffProviderAvailabilityWindow } from '@/lib/staff/types'

type ProviderAvailabilityEditorProps = {
  providers: StaffProvider[]
  currentUser: StaffUser
  onRefreshProviders?: () => Promise<StaffProvider[] | void>
}

const ProviderAvailabilityEditor: FC<ProviderAvailabilityEditorProps> = ({
  providers,
  currentUser,
  onRefreshProviders,
}) => {
  const {
    dayOptions,
    addWindow,
    canEditProvider,
    getDraftWindows,
    getErrorMessage,
    isSavingProvider,
    providerHasChanges,
    removeWindow,
    saveProvider,
    updateWindow,
  } = useProviderAvailabilityEditor({ providers, currentUser, onRefreshProviders })

  if (providers.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/20 bg-white/10 p-6 text-center text-sm text-muted-foreground dark:border-white/10">
        هنوز پروفایل ارائه‌دهنده‌ای ثبت نشده است.
      </div>
    )
  }

  const handleWindowChange = (
    providerId: string,
    index: number,
    field: keyof StaffProviderAvailabilityWindow,
    value: string,
  ) => {
    updateWindow(providerId, index, field, value)
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {providers.map((provider) => {
        if (!canEditProvider(provider)) {
          return <ReadOnlyAvailabilityCard key={provider.id} provider={provider} />
        }

        const windows = getDraftWindows(provider.id)
        const errorMessage = getErrorMessage(provider.id)
        const isSaving = isSavingProvider(provider.id)
        const hasChanges = providerHasChanges(provider)

        return (
          <ProviderAvailabilityCard
            key={provider.id}
            provider={provider}
            windows={windows}
            dayOptions={dayOptions}
            errorMessage={errorMessage}
            isSaving={isSaving}
            hasChanges={hasChanges}
            onAddWindow={() => addWindow(provider.id)}
            onSave={() => saveProvider(provider)}
            onWindowChange={(index, field, value) =>
              handleWindowChange(provider.id, index, field, value)
            }
            onRemoveWindow={(index) => removeWindow(provider.id, index)}
          />
        )
      })}
    </div>
  )
}

export default ProviderAvailabilityEditor
