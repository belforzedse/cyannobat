'use client'

import { motion } from 'framer-motion'
import { LogOut } from 'lucide-react'

import { Card, Button } from '@/components/ui'

export type DashboardHeaderProps = {
  title: string
  description: string
  email: string
  roleSummary: string
  prefersReducedMotion: boolean
  onLogout: () => void
}

export const DashboardHeader = ({
  title,
  description,
  email,
  roleSummary,
  prefersReducedMotion,
  onLogout,
}: DashboardHeaderProps) => (
  <motion.div
    initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
  >
    <Card variant="default" padding="lg" className="flex flex-col gap-6 text-right">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="flex flex-col gap-2 text-right">
          <motion.h1
            initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: prefersReducedMotion ? 0 : 0.2, duration: prefersReducedMotion ? 0 : 0.5 }}
            className="text-2xl font-semibold text-foreground"
          >
            {title}
          </motion.h1>
          <motion.p
            initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: prefersReducedMotion ? 0 : 0.3, duration: prefersReducedMotion ? 0 : 0.5 }}
            className="text-sm leading-relaxed text-muted-foreground"
          >
            {description}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: prefersReducedMotion ? 1 : 0, scale: prefersReducedMotion ? 1 : 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: prefersReducedMotion ? 0 : 0.35, duration: prefersReducedMotion ? 0 : 0.5 }}
          className="flex flex-col items-end gap-3 text-sm text-muted-foreground"
        >
          <div>
            <span className="font-medium text-foreground">{email}</span>
            <span className="mx-2 text-muted-foreground/70">•</span>
            <span>{roleSummary}</span>
          </div>
          <Button variant="secondary" size="sm" onClick={onLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            خروج
          </Button>
        </motion.div>
      </div>
    </Card>
  </motion.div>
)
