import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { getPayload } from 'payload'

import configPromise from '@payload-config'
import { userIsStaff } from '@/lib/auth'
import StaffLoginForm from '@/features/staff/components/StaffLoginForm'

export const dynamic = 'force-dynamic'

const StaffLoginPage = async () => {
  const payload = await getPayload({
    config: configPromise,
  })

  try {
    const { user } = await payload.auth({
      headers: headers(),
    })

    if (user && userIsStaff(user)) {
      redirect('/staff')
    }
  } catch {
    // ignore auth failures here
  }

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-5xl flex-col items-center justify-center gap-8 px-6 py-16 text-right sm:px-10">
      <div className="max-w-lg text-right">
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">ورود کارکنان</h1>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          حساب‌های موقتی بر پایه رمز عبور تنها برای دوره توسعه فعال هستند. در نسخه نهایی، احراز هویت پیامکی به‌صورت خودکار آدرس وارد شده را تایید می‌کند و نیازی به رمز عبور نخواهد بود.
        </p>
      </div>
      <StaffLoginForm />
    </section>
  )
}

export default StaffLoginPage

