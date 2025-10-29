'use client'

import { motion } from 'framer-motion'
import { Plus, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui'
import { glassPanelStyles } from '@/components/ui/glass'
import { cn } from '@/lib/utils'

import type { StatusOption } from '../constants'

export type AppointmentsToolbarProps = {
  filterStatus: string
  onFilterChange: (value: string) => void
  searchTerm: string
  onSearchChange: (value: string) => void
  searchPlaceholder: string
  canCreateAppointments: boolean
  onCreateClick: () => void
  onRefresh: () => void
  isRefreshing: boolean
  prefersReducedMotion: boolean
  statusOptions: StatusOption[]
}

export const AppointmentsToolbar = ({
  filterStatus,
  onFilterChange,
  searchTerm,
  onSearchChange,
  searchPlaceholder,
  canCreateAppointments,
  onCreateClick,
  onRefresh,
  isRefreshing,
  prefersReducedMotion,
  statusOptions,
}: AppointmentsToolbarProps) => (
  <motion.div
    initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: prefersReducedMotion ? 0 : 0.3, duration: prefersReducedMotion ? 0 : 0.5 }}
    className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
  >
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">وضعیت نوبت</label>
        <select
          value={filterStatus}
          onChange={(event) => onFilterChange(event.target.value)}
          className={cn(
            glassPanelStyles(),
            'rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40',
          )}
        >
          <option value="all">همه وضعیت‌ها</option>
          {statusOptions.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">جستجوی سریع</label>
        <input
          type="search"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          className={cn(
            glassPanelStyles(),
            'w-full rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 sm:w-64',
          )}
        />
      </div>
    </div>

    <div className="flex items-center justify-end gap-2">
      {canCreateAppointments && (
        <Button variant="primary" size="sm" onClick={onCreateClick} className="gap-2">
          <Plus className="h-4 w-4" />
          رزرو نوبت جدید
        </Button>
      )}
      <Button variant="secondary" size="sm" onClick={onRefresh} disabled={isRefreshing} className="gap-2">
        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        به‌روزرسانی
      </Button>
    </div>
  </motion.div>
)
