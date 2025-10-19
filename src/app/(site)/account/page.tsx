import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { getPayload } from 'payload'

import configPromise from '@payload-config'
import { extractRoles, userIsStaff } from '@/lib/auth'
import type { Appointment, Provider as ProviderDoc, Service } from '@/payload-types'

type PopulatedAppointment = Appointment & {
  provider?: Appointment['provider']
  service?: Appointment['service']
}

const getRelationDoc = <T,>(relation: unknown): T | null => {
  if (!relation || typeof relation === 'string') return null
  if (typeof relation === 'object') {
    const candidate = relation as { value?: unknown }
    if ('value' in candidate) {
      const value = candidate.value
      if (value && typeof value === 'object') {
        return value as T
      }
      return null
    }
    return relation as T
  }
  return null
}

const mapAppointment = (appointment: PopulatedAppointment) => {
  const schedule = appointment.schedule ?? {}
  const provider = getRelationDoc<ProviderDoc>(appointment.provider)
  const service = getRelationDoc<Service>(appointment.service)

  return {
    id: String(appointment.id ?? ''),
    start: schedule.start ?? '',
    end: schedule.end ?? '',
    timeZone: schedule.timeZone ?? 'UTC',
    providerName: provider?.displayName ?? 'نامشخص',
    serviceTitle: service?.title ?? 'خدمت بدون عنوان',
    status: appointment.status ?? 'pending',
  }
}

export const dynamic = 'force-dynamic'

const AccountPage = async () => {
  const payload = await getPayload({
    config: configPromise,
  })

  const headerStore = await headers()

  const authResult = await payload
    .auth({
      headers: headerStore,
    })
    .catch(() => ({ user: null }))

  const authUser = authResult?.user

  if (!authUser) {
    redirect('/login')
  }

  const userId = String((authUser as { id?: string | number }).id ?? '')
  const userEmail = (authUser as { email?: string }).email ?? ''
  const roles = extractRoles(authUser)
  const isStaff = userIsStaff(authUser)

  let upcomingAppointments: ReturnType<typeof mapAppointment>[] = []

  if (!isStaff && userId) {
    const result = await payload.find({
      collection: 'appointments',
      where: {
        client: {
          equals: userId,
        },
      },
      sort: 'schedule.start',
      limit: 5,
      depth: 2,
      overrideAccess: true,
    })

    upcomingAppointments = result.docs.map((doc) => mapAppointment(doc as PopulatedAppointment))
  }

  return (
    <section className="mx-auto flex min-h-[70vh] w-full max-w-5xl flex-col gap-10 px-6 py-12 text-right sm:px-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">حساب کاربری</h1>
        <p className="text-sm text-muted-foreground">
          اطلاعات ورود شما با سیستم رزرو یکپارچه است. نقش‌های فعال: {roles.length > 0 ? roles.join('، ') : 'کاربر مهمان'}.
        </p>
      </header>

      {isStaff ? (
        <div className="rounded-2xl border border-accent/40 bg-accent/10 p-6 text-sm leading-7 text-accent shadow-sm backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-accent">ورود به پیشخوان کارکنان</h2>
          <p className="mt-2 text-accent/90">
            شما به عنوان عضو کادر درمان وارد شده‌اید. برای مدیریت نوبت‌ها و بازه‌های زمانی، به پیشخوان کارکنان منتقل شوید.
          </p>
          <a
            href="/staff"
            className="mt-4 inline-flex rounded-full border border-white/30 bg-white/20 px-5 py-2 text-xs font-semibold text-accent transition-colors hover:border-white/50 hover:bg-white/30"
          >
            رفتن به پیشخوان
          </a>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/20 bg-white/35 p-6 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
          <h2 className="text-lg font-semibold text-foreground">نوبت‌های آینده</h2>
          {upcomingAppointments.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              نوبت فعالی ثبت نشده است. از طریق صفحه رزرو، زمان مناسب خود را انتخاب کنید.
            </p>
          ) : (
            <ul className="mt-4 space-y-3 text-sm">
              {upcomingAppointments.map((appointment) => (
                <li
                  key={appointment.id}
                  className="rounded-xl border border-white/20 bg-white/50 px-4 py-3 text-right shadow-sm dark:border-white/10 dark:bg-white/10"
                >
                  <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                    <span className="text-sm font-semibold text-foreground">{appointment.serviceTitle}</span>
                    <span>پزشک: {appointment.providerName}</span>
                    <span>
                      زمان شروع: {new Date(appointment.start).toLocaleString('fa-IR', { hour12: false })}
                    </span>
                    <span>وضعیت: {appointment.status}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="rounded-2xl border border-white/20 bg-white/35 p-6 text-sm text-muted-foreground shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
        <h2 className="text-lg font-semibold text-foreground">اطلاعات ورود</h2>
        <p className="mt-2">
          ایمیل ثبت شده: <span className="font-semibold text-foreground">{userEmail}</span>
        </p>
        <p className="mt-1">برای تغییر رمز عبور یا به‌روزرسانی اطلاعات تماس، با پشتیبانی هماهنگ کنید.</p>
      </div>
    </section>
  )
}

export default AccountPage
