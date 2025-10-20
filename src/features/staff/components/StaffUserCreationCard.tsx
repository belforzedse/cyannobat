'use client'

import React, { useEffect, useMemo, useState } from 'react'

import { Button, Card, Input } from '@/components/ui'
import { useToast } from '@/components/ui/ToastProvider'
import { useGlobalLoadingOverlay } from '@/components/GlobalLoadingOverlayProvider'
import type { StaffUser } from '@/features/staff/types'
import { ASSIGNABLE_ROLES, type AssignableRole, getCreatableRolesForUser } from '@/lib/staff/rolePermissions'

type StaffUserCreationCardProps = {
  currentUser: StaffUser
}

type CreatedUser = {
  email: string
  roles: string[]
}

const roleLabelsFa: Record<AssignableRole, string> = {
  patient: 'بیمار',
  doctor: 'پزشک',
  receptionist: 'مسئول پذیرش',
  admin: 'مدیر',
}

const roleHelpText: Record<AssignableRole, string> = {
  patient: 'دسترسی پایه به پرتال و مدیریت نوبت‌ها.',
  doctor: 'عضو کادر درمان با دسترسی به ابزارهای پزشک.',
  receptionist: 'پرسنل پذیرش با امکان زمان‌بندی نوبت‌ها.',
  admin: 'دسترسی مدیریتی کامل به تمام بخش‌ها.',
}

const isAssignableRole = (value: string): value is AssignableRole =>
  (ASSIGNABLE_ROLES as readonly string[]).includes(value)

const getRoleLabelFa = (role: string) => (isAssignableRole(role) ? roleLabelsFa[role] : role)

const StaffUserCreationCard = ({ currentUser }: StaffUserCreationCardProps) => {
  const creatableRoles = useMemo(() => getCreatableRolesForUser(currentUser.roles), [currentUser.roles])
  const { showToast } = useToast()
  const { setActivity } = useGlobalLoadingOverlay()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [selectedRole, setSelectedRole] = useState<AssignableRole | ''>(creatableRoles[0] ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [lastCreatedUser, setLastCreatedUser] = useState<CreatedUser | null>(null)

  useEffect(() => {
    if (creatableRoles.length === 0) {
      setSelectedRole('')
      return
    }

    setSelectedRole((current) => {
      if (current && creatableRoles.includes(current)) {
        return current
      }
      return creatableRoles[0]
    })
  }, [creatableRoles])

  if (creatableRoles.length === 0) {
    return null
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedRole) {
      setFormError('لطفاً یک نقش برای اختصاص انتخاب کنید.')
      return
    }

    setFormError(null)
    setIsSubmitting(true)
    setActivity('staff-create-user', true, 'ایجاد حساب کاربری جدید...')

    try {
      const response = await fetch('/api/staff/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          roles: [selectedRole],
        }),
      })

      if (!response.ok) {
        let description = 'امکان ایجاد کاربر وجود ندارد.'

        try {
          const errorBody = (await response.json()) as { message?: string }
          if (errorBody?.message) {
            description = errorBody.message
          }
        } catch {
          // Ignore JSON parsing errors and keep the default message
        }

        setFormError(description)
        showToast({ description, variant: 'error' })
        return
      }

      const result = (await response.json()) as { user: CreatedUser }

      setEmail('')
      setPassword('')
      setLastCreatedUser(result.user)
      showToast({
        description: `حساب ${roleLabelsFa[selectedRole]} برای ${result.user.email} ایجاد شد.`,
        variant: 'success',
      })
    } catch (error) {
      console.error(error)
      const description = 'امکان ایجاد کاربر وجود ندارد. لطفاً دوباره تلاش کنید.'
      setFormError(description)
      showToast({ description, variant: 'error' })
    } finally {
      setIsSubmitting(false)
      setActivity('staff-create-user', false)
    }
  }

  return (
    <Card variant='default' padding='lg' className='flex flex-col gap-6'>
      <div className='flex flex-col gap-1 text-right'>
        <h2 className='text-lg font-semibold text-foreground'>افزودن عضو تیم</h2>
        <p className='text-xs text-muted-foreground'>
          حساب‌های کاربری جدید را با سطح دسترسی مناسب ایجاد کنید. تنها نقش‌هایی که مجاز به مدیریت آن‌ها هستید در زیر
          نمایش داده می‌شوند.
        </p>
      </div>

      <form className='flex flex-col gap-5' onSubmit={handleSubmit}>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
          <label className='flex flex-col gap-2 text-sm'>
            <span className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>ایمیل</span>
            <Input
              type='email'
              autoComplete='email'
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder='کاربر@example.com'
            />
          </label>

          <label className='flex flex-col gap-2 text-sm'>
            <span className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>رمز عبور موقت</span>
            <Input
              type='password'
              autoComplete='new-password'
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder='حداقل ۸ کاراکتر'
            />
          </label>

          <label className='flex flex-col gap-2 text-sm'>
            <span className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>نقش</span>
            <select
              className='glass-panel rounded-xl px-3 py-2 text-sm text-foreground ring-offset-background transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-70'
              value={selectedRole}
              onChange={(event) => {
                const role = event.target.value
                if (isAssignableRole(role) && creatableRoles.includes(role)) {
                  setSelectedRole(role)
                }
              }}
            >
              {creatableRoles.map((role) => (
                <option key={role} value={role}>
                  {roleLabelsFa[role]}
                </option>
              ))}
            </select>
          </label>
        </div>

        {selectedRole && (
          <p className='rounded-xl border border-dashed border-white/15 bg-white/10 px-4 py-3 text-xs text-muted-foreground dark:border-white/10'>
            <span className='font-semibold text-foreground'>{roleLabelsFa[selectedRole]}:</span>{' '}
            {roleHelpText[selectedRole]}
          </p>
        )}

        {formError && (
          <p className='rounded-xl border border-red-300/60 bg-red-50 px-4 py-3 text-xs text-red-700 dark:border-red-500/60 dark:bg-red-500/15 dark:text-red-100'>
            {formError}
          </p>
        )}

        <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
          <p className='text-[11px] text-muted-foreground'>
            حساب‌ها فوراً ایجاد می‌شوند. رمز عبور موقت را به اشتراک بگذارید و از کاربران بخواهید پس از ورود آن را تغییر دهند.
          </p>
          <Button type='submit' disabled={isSubmitting}>
            {isSubmitting ? 'در حال ایجاد...' : 'ایجاد حساب'}
          </Button>
        </div>
      </form>

      {lastCreatedUser && (
        <div className='rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-muted-foreground dark:border-white/10 dark:bg-white/5'>
          <span className='font-semibold text-foreground'>آخرین حساب ایجادشده:</span>{' '}
          <span>{lastCreatedUser.email}</span>
          <span className='mx-2 text-muted-foreground/60'>•</span>
          <span>{lastCreatedUser.roles.map((role) => getRoleLabelFa(role)).join('، ')}</span>
        </div>
      )}
    </Card>
  )
}

export default StaffUserCreationCard
