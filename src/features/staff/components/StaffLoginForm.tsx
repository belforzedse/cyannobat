'use client'

import { FormEvent, useState } from 'react'

type StaffLoginFormProps = {
  redirectTo?: string
}

const StaffLoginForm = ({ redirectTo = '/staff' }: StaffLoginFormProps) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const response = await fetch('/api/staff/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const result = await response.json().catch(() => ({ message: 'ورود ناموفق بود.' }))
        throw new Error(result.message ?? 'ورود ناموفق بود.')
      }

      window.location.href = redirectTo
    } catch (error) {
      console.error(error)
      setErrorMessage((error as Error).message ?? 'ورود ناموفق بود.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4 text-right">
      <label className="flex flex-col gap-2 text-sm text-foreground">
        ایمیل سازمانی
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          className="rounded-xl border border-white/20 bg-white/50 px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40 dark:border-white/10 dark:bg-white/10"
          placeholder="staff@example.com"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm text-foreground">
        رمز عبور موقت
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

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center justify-center rounded-full border border-accent/50 bg-accent px-5 py-2 text-sm font-semibold text-white transition-colors hover:border-accent/70 hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'در حال ورود...' : 'ورود'}
      </button>

      <p className="text-xs leading-6 text-muted-foreground">
        احراز هویت پیامکی به‌زودی جایگزین رمز عبور می‌شود. تا آن زمان، حساب‌های موقتی ایجاد شده با ابزار seed قابل استفاده هستند.
      </p>
    </form>
  )
}

export default StaffLoginForm

