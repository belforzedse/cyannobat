import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { getPayload } from 'payload';

import configPromise from '@payload-config';
import { userIsStaff } from '@/lib/auth';
import SignupForm from '@/components/auth/SignupForm';

export const dynamic = 'force-dynamic';

const SignupPage = async () => {
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
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">ایجاد حساب کاربری جدید</h1>
        <p className="text-sm leading-7 text-muted-foreground">
          پس از تکمیل ثبت‌نام، کاربران عادی وارد داشبورد شخصی می‌شوند و اعضای کادر درمان به صورت
          خودکار به پیشخوان ویژه کارکنان منتقل خواهند شد.
        </p>
      </div>
      <SignupForm toggleHref="/login" toggleLabel="حساب دارید؟ وارد شوید" />
    </div>
  );
};

export default SignupPage;
