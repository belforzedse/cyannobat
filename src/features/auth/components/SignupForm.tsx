'use client'

import { useState, type FormEvent } from 'react'

import {
  isValidIranNationalId,
  normalizeIranNationalIdDigits,
} from '@/lib/validators/iran-national-id'

const staffRoles = ['admin', 'doctor', 'receptionist'] as const

type SignupFormProps = {
  redirectToStaff?: string
  redirectToAccount?: string
  toggleHref?: string
  toggleLabel?: string
}

const SignupForm = ({
  redirectToStaff = '/staff',
  redirectToAccount = '/account',
  toggleHref,
  toggleLabel,
}: SignupFormProps) => {
  const [name, setName] = useState('')
  const [email] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [nationalId, setNationalId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setErrorMessage(null)

    const trimmedEmail = email.trim()
    const trimmedPhone = phone.trim()
    const normalizedNationalId = normalizeIranNationalIdDigits(nationalId)
    const trimmedNationalId = normalizedNationalId.trim()

    if (!trimmedEmail && !trimmedPhone) {
      setIsSubmitting(false)
      setErrorMessage('حداقل یکی از فیلدهای ایمیل یا شماره تلفن را وارد کنید.')
      return
    }

    if (!isValidIranNationalId(trimmedNationalId)) {
      setIsSubmitting(false)
      setErrorMessage('کد ملی نامعتبر است. لطفاً کد ۱۰ رقمی خود را بدون فاصله وارد کنید.')
      return
    }

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email: trimmedEmail || undefined,
          phone: trimmedPhone || undefined,
          nationalId: trimmedNationalId,
          password,
        }),
      })

      if (!response.ok) {
        const result = await response.json().catch(() => ({ message: 'ثبت‌نام ناموفق بود.' }))
        throw new Error(result.message ?? 'ثبت‌نام ناموفق بود.')
      }

      let result: unknown = null
      if (response.status !== 204) {
        result = await response.json().catch(() => null)
      }

      const rawRoles = (result as { user?: { roles?: unknown } } | null)?.user?.roles
      const roles = Array.isArray(rawRoles) ? (rawRoles as string[]) : []
      const isStaff = roles.some((role) => staffRoles.includes(role as (typeof staffRoles)[number]))

      window.location.href = isStaff ? redirectToStaff : redirectToAccount
    } catch (error) {
      console.error(error)
      setErrorMessage((error as Error).message ?? 'ثبت‌نام ناموفق بود.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4 text-right">
      <label className="flex flex-col gap-2 text-sm text-foreground">
        نام و نام خانوادگی
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          className="rounded-xl border border-white/20 bg-white/50 px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40 dark:border-white/10 dark:bg-white/10"
          placeholder="رضا رضایی"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm text-foreground">
        شماره موبایل
        <input
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          required
          className="rounded-xl border border-white/20 bg-white/50 px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40 dark:border-white/10 dark:bg-white/10"
          placeholder="09123456789"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm text-foreground">
        کد ملی
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          dir="ltr"
          maxLength={10}
          value={nationalId}
          onChange={(event) => setNationalId(normalizeIranNationalIdDigits(event.target.value))}
          required
          className="rounded-xl border border-white/20 bg-white/50 px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40 dark:border-white/10 dark:bg-white/10"
          placeholder="1234567890"
        />
        <span className="text-xs text-muted-foreground">کد ملی ۱۰ رقمی بدون خط تیره یا فاصله، مانند 1234567890</span>
      </label>

      <label className="flex flex-col gap-2 text-sm text-foreground">
        رمز عبور
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          className="rounded-xl border border-white/20 bg-white/50 px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40 dark:border-white/10 dark:bg-white/10"
          placeholder="••••••••"
        />
      </label>

      {errorMessage ? (
        <p className="rounded-xl border border-red-400/40 bg-red-50 px-4 py-2 text-xs text-red-600 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-200">
          {errorMessage}
        </p>
      ) : null}

      <div className="space-y-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-full border border-accent/50 bg-accent px-5 py-2 text-sm font-semibold text-white transition-colors hover:border-accent/70 hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}
        </button>

        {toggleHref && toggleLabel ? (
          <p className="text-xs leading-6 text-muted-foreground">
            <a className="font-semibold text-accent hover:text-accent/80" href={toggleHref}>
              {toggleLabel}
            </a>
          </p>
        ) : null}

        <p className="text-xs leading-6 text-muted-foreground">
          برای فعال‌سازی نوبت‌دهی، احراز هویت پیامکی و ثبت کد ملی هر دو ضروری هستند. تا تکمیل این مراحل، رمز عبور امن
          انتخاب کنید و آن را نزد خود نگه دارید.
        </p>
      </div>
    </form>
  )
}

export default SignupForm
