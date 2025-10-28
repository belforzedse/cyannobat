'use client'

import React, { useEffect, useMemo, useState } from 'react'

import { Button, Card, Input, Select, type SelectOption } from '@/components/ui'
import { useToast } from '@/components/ui/ToastProvider'
import { useGlobalLoadingOverlay } from '@/components/GlobalLoadingOverlayProvider'
import type { StaffUser } from '@/features/staff/types'
import { ASSIGNABLE_ROLES, type AssignableRole, getCreatableRolesForUser } from '@/lib/staff/rolePermissions'
import {
  isValidIranNationalId,
  normalizeIranNationalIdDigits,
} from '@/lib/validators/iran-national-id'

type StaffUserCreationCardProps = {
  currentUser: StaffUser
}

type CreatedUser = {
  email?: string | null
  phone?: string | null
  nationalId?: string | null
  roles: string[]
}

const roleLabelsFa: Record<AssignableRole, string> = {
  patient: 'بیمار',
  doctor: 'پزشک',
  receptionist: 'مسئول پذیرش',
  admin: 'مدیر سیستم',
}

const roleHelpText: Record<AssignableRole, string> = {
  patient: 'حساب‌های بیمار فقط به داشبورد شخصی دسترسی دارند و نمی‌توانند کاربران دیگر را مدیریت کنند.',
  doctor: 'پزشکان می‌توانند نوبت‌های خود را ببینند و وضعیت بیمارانشان را به‌روزرسانی کنند.',
  receptionist: 'مسئولان پذیرش می‌توانند نوبت‌ها و اطلاعات تماس بیماران را مدیریت و هماهنگ کنند.',
  admin: 'مدیران سیستم به همه تنظیمات مدیریتی و داده‌های کاربران دسترسی کامل دارند.',
}

const isAssignableRole = (value: string): value is AssignableRole =>
  (ASSIGNABLE_ROLES as readonly string[]).includes(value)

const getRoleLabelFa = (role: string) => (isAssignableRole(role) ? roleLabelsFa[role] : role)

const iranPhoneRegex = /^(\+98|0)?9\d{9}$/

const StaffUserCreationCard = ({ currentUser }: StaffUserCreationCardProps) => {
  const creatableRoles = useMemo(() => getCreatableRolesForUser(currentUser.roles), [currentUser.roles])
  const { showToast } = useToast()
  const { setActivity } = useGlobalLoadingOverlay()

  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [nationalId, setNationalId] = useState('')
  const [password, setPassword] = useState('')
  const [selectedRole, setSelectedRole] = useState<AssignableRole | ''>(creatableRoles[0] ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [lastCreatedUser, setLastCreatedUser] = useState<CreatedUser | null>(null)
  const roleOptions = useMemo<SelectOption[]>(
    () =>
      creatableRoles.map((role) => ({
        value: role,
        label: roleLabelsFa[role],
      })),
    [creatableRoles],
  )

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

    const trimmedEmail = email.trim()
    const trimmedPhone = phone.trim()
    const normalizedNationalId = normalizeIranNationalIdDigits(nationalId)
    const trimmedNationalId = normalizedNationalId.trim()

    if (!selectedRole) {
      setFormError('لطفاً یک نقش معتبر انتخاب کنید.')
      return
    }

    if (!trimmedPhone) {
      setFormError('شماره تلفن الزامی است.')
      return
    }

    if (!iranPhoneRegex.test(trimmedPhone)) {
      setFormError('شماره تلفن معتبر وارد کنید.')
      return
    }

    if (!isValidIranNationalId(trimmedNationalId)) {
      setFormError('کد ملی معتبر وارد کنید.')
      return
    }

    setFormError(null)
    setIsSubmitting(true)
    setActivity('staff-create-user', true, 'در حال ایجاد کاربر جدید...')

    try {
      const response = await fetch('/api/staff/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: trimmedEmail || undefined,
          phone: trimmedPhone,
          nationalId: trimmedNationalId,
          password,
          roles: [selectedRole],
        }),
      })

      if (!response.ok) {
        let description = 'در ایجاد کاربر مشکلی پیش آمد.'

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
      setPhone('')
      setNationalId('')
      setPassword('')
      setLastCreatedUser(result.user)

      const contactLabel = result.user.email ?? result.user.phone ?? trimmedPhone
      showToast({
        description: `کاربر ${roleLabelsFa[selectedRole]} برای ${contactLabel} با موفقیت ایجاد شد.`,
        variant: 'success',
      })
    } catch (error) {
      console.error(error)
      const description = 'در ایجاد کاربر مشکلی پیش آمد. لطفاً اتصال خود را بررسی کنید و دوباره تلاش کنید.'
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
        <h2 className='text-lg font-semibold text-foreground'>ایجاد کاربر جدید</h2>
        <p className='text-xs text-muted-foreground'>
          برای افزودن کاربر جدید، نقش مناسب را انتخاب کنید و اطلاعات تماس او را وارد کنید. این اطلاعات فقط برای تیم شما
          قابل مشاهده است.
        </p>
      </div>

      <form className='flex flex-col gap-5' onSubmit={handleSubmit}>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-4'>
          <label className='flex flex-col gap-2 text-sm'>
            <span className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>ایمیل (اختیاری)</span>
            <Input
              type='email'
              autoComplete='email'
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder='user@example.com'
            />
          </label>

          <label className='flex flex-col gap-2 text-sm'>
            <span className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>شماره تلفن</span>
            <Input
              type='tel'
              autoComplete='tel'
              required
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder='09120000000'
            />
          </label>

          <label className='flex flex-col gap-2 text-sm'>
            <span className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>کد ملی</span>
            <Input
              inputMode='numeric'
              pattern='[0-9]*'
              maxLength={10}
              required
              value={nationalId}
              onChange={(event) => setNationalId(normalizeIranNationalIdDigits(event.target.value))}
              placeholder='1234567890'
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

          <Select
            label='نقش کاربر'
            value={selectedRole}
            onChange={(event) => {
              const role = event.target.value
              if (isAssignableRole(role) && creatableRoles.includes(role)) {
                setSelectedRole(role)
              }
            }}
            options={roleOptions}
          />
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
            رمز عبور را از طریق کانال‌های امن در اختیار کاربر بگذارید. در صورت نیاز می‌توانید بعداً نقش او را نیز تغییر دهید.
          </p>
          <Button type='submit' disabled={isSubmitting}>
            {isSubmitting ? 'در حال ایجاد...' : 'ایجاد کاربر'}
          </Button>
        </div>
      </form>

      {lastCreatedUser && (
        <div className='rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-muted-foreground dark:border-white/10 dark:bg-white/5'>
          <span className='font-semibold text-foreground'>آخرین کاربر ایجاد شده:</span>{' '}
          <span>{lastCreatedUser.email ?? '—'}</span>
          <span className='mx-2 text-muted-foreground/60'>•</span>
          <span>{lastCreatedUser.phone ?? '—'}</span>
          <span className='mx-2 text-muted-foreground/60'>•</span>
          <span>{lastCreatedUser.nationalId ?? '—'}</span>
          <span className='mx-2 text-muted-foreground/60'>•</span>
          <span>{lastCreatedUser.roles.map((role) => getRoleLabelFa(role)).join('، ')}</span>
        </div>
      )}
    </Card>
  )
}

export default StaffUserCreationCard
