'use client';

import { useState, type FormEvent } from 'react';

const staffRoles = ['admin', 'doctor', 'receptionist'] as const;

type LoginFormProps = {
  redirectToStaff?: string;
  redirectToAccount?: string;
  toggleHref?: string;
  toggleLabel?: string;
};

const LoginForm = ({
  redirectToStaff = '/staff',
  redirectToAccount = '/account',
  toggleHref,
  toggleLabel,
}: LoginFormProps) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier, password }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({ message: 'ورود ناموفق بود.' }));
        throw new Error(result.message ?? 'ورود ناموفق بود.');
      }

      const result = (await response.json()) as { user?: { roles?: string[] }; isStaff?: boolean };

      // Use isStaff flag from API response (more reliable than recalculating)
      const isStaff = result.isStaff ?? false;

      console.log('Login response:', { user: result.user, isStaff, roles: result.user?.roles });
      console.log('Redirecting to:', isStaff ? redirectToStaff : redirectToAccount);

      window.location.href = isStaff ? redirectToStaff : redirectToAccount;
    } catch (error) {
      console.error(error);
      setErrorMessage((error as Error).message ?? 'ورود ناموفق بود.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4 text-right">
      <label className="flex flex-col gap-2 text-sm text-foreground">
        ایمیل یا شماره موبایل
        <input
          type="text"
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
          required
          className="rounded-xl border border-white/20 bg-white/50 px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent dark:border-white/10 dark:bg-white/10"
          placeholder="you@example.com یا 09120000000"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm text-foreground">
        رمز عبور
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          className="rounded-xl border border-white/20 bg-white/50 px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent dark:border-white/10 dark:bg-white/10"
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
          className="inline-flex items-center justify-center rounded-full border border-accent/50 bg-accent px-5 py-2 text-sm font-semibold text-white transition-colors hover:border-accent/70 hover:bg-accent/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'در حال ورود...' : 'ورود'}
        </button>

        {toggleHref && toggleLabel ? (
          <p className="text-xs leading-6 text-muted-foreground">
            <a
              className="font-semibold text-accent hover:text-accent/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              href={toggleHref}
            >
              {toggleLabel}
            </a>
          </p>
        ) : null}

        <p className="text-xs leading-6 text-muted-foreground">
          احراز هویت پیامکی به‌زودی راه‌اندازی می‌شود. تا آن موقع از حساب‌های موقتی یا رمز عبور خود
          استفاده کنید.
        </p>
      </div>
    </form>
  );
};

export default LoginForm;
