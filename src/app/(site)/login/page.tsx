import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { getPayload } from 'payload'

import configPromise from '@payload-config'
import { userIsStaff } from '@/lib/auth'
import LoginForm from '@/features/auth/components/LoginForm'

export const dynamic = 'force-dynamic'

const LoginPage = async () => {
  const payload = await getPayload({
    config: configPromise,
  })

  const headerStore = await headers()

  try {
    const { user } = await payload.auth({
      headers: headerStore,
    })

    if (user) {
      if (userIsStaff(user)) {
        redirect('/staff')
      }

      redirect('/account')
    }
  } catch {
    // ignore auth errors and show the form
  }

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-5xl flex-col items-center justify-center gap-8 px-6 py-16 text-right sm:px-10">
      <div className="max-w-lg text-right">
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">ورود به حساب کاربری</h1>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          پس از ورود، کاربران عادی به داشبورد شخصی هدایت می‌شوند و کاربران کادر درمان مستقیماً به پیشخوان ویژه کارکنان
          می‌روند.
        </p>
      </div>
      <LoginForm />
    </section>
  )
}

export default LoginPage
