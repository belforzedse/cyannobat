import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { getPayload } from 'payload';

import configPromise from '@payload-config';
import { userIsStaff } from '@/lib/auth';
import LoginForm from '@/components/auth/LoginForm';

export const dynamic = 'force-dynamic';

const LoginPage = async () => {
  const payload = await getPayload({
    config: configPromise,
  });

  const headerStore = await headers();

  try {
    const { user } = await payload.auth({
      headers: headerStore,
    });

    if (user) {
      if (userIsStaff(user)) {
        redirect('/staff');
      }

      redirect('/account');
    }
  } catch {
    // ignore auth errors and show the form
  }

  return (
    <div className="flex flex-col gap-6 text-right">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">ورود به حساب کاربری</h1>
        <p className="text-sm leading-7 text-muted-foreground">
          پس از ورود، کاربران عادی به داشبورد شخصی هدایت می‌شوند و کاربران کادر درمان مستقیماً به
          پیشخوان ویژه کارکنان می‌روند.
        </p>
      </div>
      <LoginForm toggleHref="/signup" toggleLabel="حساب ندارید؟ ثبت‌نام کنید" />
    </div>
  );
};

export default LoginPage;
