'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

import { Card, Button, Input, Textarea } from '@/components/ui';
import GlassIcon from '@/components/GlassIcon';
import { GlassSurface } from '@/components/ui/glass';

const contactMethods = [
  {
    icon: Mail,
    title: 'ایمیل',
    value: 'support@cyannobat.com',
    href: 'mailto:support@cyannobat.com',
    description: 'برای پرسش‌های غیرفوری',
  },
  {
    icon: Phone,
    title: 'تلفن',
    value: '۰۲۱-۱۲۳۴۵۶۷۸',
    href: 'tel:+982112345678',
    description: 'شنبه تا پنج‌شنبه، ۹ صبح تا ۵ عصر',
  },
  {
    icon: MapPin,
    title: 'آدرس',
    value: 'تهران، خیابان ولیعصر',
    href: null,
    description: 'دفتر مرکزی سایان نوبت',
  },
];

const ContactPage = () => {
  const prefersReducedMotion = useReducedMotion();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof typeof formData, string>>>(
    {},
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setSubmitStatus('idle');
    setErrorMessage(null);

    const trimmedData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      subject: formData.subject.trim(),
      message: formData.message.trim(),
    };

    const errors: Partial<Record<keyof typeof formData, string>> = {};

    if (!trimmedData.name) {
      errors.name = 'لطفاً نام خود را وارد کنید.';
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedData.email) {
      errors.email = 'لطفاً ایمیل خود را وارد کنید.';
    } else if (!emailPattern.test(trimmedData.email)) {
      errors.email = 'ایمیل وارد شده معتبر نیست.';
    }

    if (!trimmedData.subject) {
      errors.subject = 'لطفاً موضوع پیام را بنویسید.';
    }

    if (!trimmedData.message) {
      errors.message = 'لطفاً متن پیام را وارد کنید.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setSubmitStatus('error');
      setErrorMessage('لطفاً خطاهای مشخص‌شده را برطرف کنید و دوباره تلاش کنید.');
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trimmedData),
      });

      if (!response.ok) {
        let errorBody: unknown;
        try {
          errorBody = await response.json();
        } catch {
          // ignore parse error
        }

        const apiErrors: Partial<Record<keyof typeof formData, string>> = {};

        if (
          errorBody &&
          typeof errorBody === 'object' &&
          Array.isArray((errorBody as { errors?: unknown }).errors)
        ) {
          for (const issue of (errorBody as { errors: unknown[] }).errors) {
            if (
              issue &&
              typeof issue === 'object' &&
              'field' in issue &&
              'message' in issue &&
              typeof (issue as { field?: unknown }).field === 'string' &&
              typeof (issue as { message?: unknown }).message === 'string'
            ) {
              const fieldKey = (issue as { field: string }).field;
              if (fieldKey === 'form') continue;
              if (fieldKey in trimmedData) {
                apiErrors[fieldKey as keyof typeof formData] = (
                  issue as { message: string }
                ).message;
              }
            }
          }
        }

        if (Object.keys(apiErrors).length > 0) {
          setFieldErrors(apiErrors);
        }

        const apiMessage =
          errorBody &&
          typeof errorBody === 'object' &&
          'message' in errorBody &&
          typeof errorBody.message === 'string'
            ? errorBody.message
            : 'ارسال پیام با خطا مواجه شد. لطفاً دوباره تلاش کنید.';

        setSubmitStatus('error');
        setErrorMessage(apiMessage);
        return;
      }

      setFieldErrors({});
      setSubmitStatus('success');
      setErrorMessage(null);
      setFormData({ name: '', email: '', subject: '', message: '' });

      setTimeout(() => {
        setSubmitStatus('idle');
      }, 4000);
    } catch (error) {
      console.error('Contact form submission failed', error);
      setSubmitStatus('error');
      setErrorMessage(
        'ارسال پیام با خطا مواجه شد. لطفاً اتصال اینترنت خود را بررسی کنید و دوباره تلاش کنید.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => {
      if (!prev[field]) {
        return prev;
      }

      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  return (
    <motion.section
      initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: 'easeOut' }}
      className="relative flex flex-col gap-8"
    >
      {/* Header Section */}
      <GlassSurface className="relative overflow-hidden px-8 py-12 text-right sm:px-12 lg:px-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-accent/25 blur-[140px] sm:-left-16 dark:bg-accent/35"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 bottom-16 h-80 w-80 rounded-full bg-accent-strong/25 blur-[150px] dark:bg-accent-strong/35"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-70 dark:via-white/20"
        />

        <motion.span
          initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: prefersReducedMotion ? 0 : 0.1,
            duration: prefersReducedMotion ? 0 : 0.45,
          }}
          className="inline-block rounded-full border border-white/25 bg-white/20 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm dark:border-white/15 dark:bg-white/10"
        >
          راه‌های ارتباطی
        </motion.span>

        <motion.h1
          initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: prefersReducedMotion ? 0 : 0.2,
            duration: prefersReducedMotion ? 0 : 0.5,
          }}
          className="mt-4 bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text text-4xl font-bold text-transparent sm:text-5xl"
        >
          تماس با ما
        </motion.h1>

        <motion.p
          initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: prefersReducedMotion ? 0 : 0.3,
            duration: prefersReducedMotion ? 0 : 0.5,
          }}
          className="mt-3 max-w-2xl text-balance leading-relaxed text-muted-foreground"
        >
          سوالات، پیشنهادات یا نیاز به راهنمایی دارید؟ تیم پشتیبانی سایان نوبت آماده کمک به شماست.
          از طریق فرم زیر یا راه‌های ارتباطی دیگر با ما در تماس باشید.
        </motion.p>
      </GlassSurface>

      {/* Contact Methods Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        {contactMethods.map((method, index) => (
          <motion.div
            key={method.title}
            initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: prefersReducedMotion ? 0 : 0.4 + index * 0.1,
              duration: prefersReducedMotion ? 0 : 0.5,
            }}
          >
            <Card
              variant="default"
              padding="lg"
              className={method.href ? 'group transition-all duration-300 hover:shadow-lg' : ''}
            >
              {method.href ? (
                <a href={method.href} className="block">
                  <div className="flex flex-col items-end gap-3 text-right">
                    <GlassIcon icon={method.icon} size="sm" label={method.title} />
                    <div className="w-full">
                      <h3 className="text-sm font-semibold text-foreground">{method.title}</h3>
                      <p className="mt-1 text-sm font-medium text-accent transition-colors group-hover:text-accent-strong">
                        {method.value}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">{method.description}</p>
                    </div>
                  </div>
                </a>
              ) : (
                <div className="flex flex-col items-end gap-3 text-right">
                  <GlassIcon icon={method.icon} size="sm" label={method.title} />
                  <div className="w-full">
                    <h3 className="text-sm font-semibold text-foreground">{method.title}</h3>
                    <p className="mt-1 text-sm font-medium text-foreground">{method.value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{method.description}</p>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Contact Form */}
      <motion.div
        initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: prefersReducedMotion ? 0 : 0.7,
          duration: prefersReducedMotion ? 0 : 0.6,
        }}
      >
        <Card variant="default" padding="lg" className="sm:px-8 sm:py-4">
          <div className="mb-6 text-right">
            <h2 className="text-2xl font-bold text-foreground">ارسال پیام</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              فرم زیر را تکمیل کنید و ما در اسرع وقت با شما تماس خواهیم گرفت.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <Input
                label="نام و نام خانوادگی"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="نام خود را وارد کنید"
                required
                disabled={isSubmitting}
                error={fieldErrors.name}
              />
              <Input
                label="ایمیل"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="example@email.com"
                required
                disabled={isSubmitting}
                error={fieldErrors.email}
              />
            </div>

            <Input
              label="موضوع"
              value={formData.subject}
              onChange={(e) => handleChange('subject', e.target.value)}
              placeholder="موضوع پیام خود را بنویسید"
              required
              disabled={isSubmitting}
              error={fieldErrors.subject}
            />

            <Textarea
              label="پیام"
              value={formData.message}
              onChange={(e) => handleChange('message', e.target.value)}
              placeholder="پیام خود را اینجا بنویسید..."
              rows={6}
              required
              disabled={isSubmitting}
              error={fieldErrors.message}
            />

            <div className="flex flex-col items-end gap-3">
              <div className="flex items-center gap-3">
                <Link href="/">
                  <Button variant="secondary" size="md" disabled={isSubmitting}>
                    بازگشت
                  </Button>
                </Link>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isSubmitting || submitStatus === 'success'}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? (
                    'در حال ارسال...'
                  ) : submitStatus === 'success' ? (
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      ارسال شد
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      ارسال پیام
                    </span>
                  )}
                </Button>
              </div>

              {submitStatus === 'success' && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-accent"
                >
                  پیام شما با موفقیت ارسال شد. به زودی با شما تماس خواهیم گرفت.
                </motion.p>
              )}

              {submitStatus === 'error' && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-destructive"
                >
                  {errorMessage ?? 'خطا در ارسال پیام. لطفاً دوباره تلاش کنید.'}
                </motion.p>
              )}
            </div>
          </form>
        </Card>
      </motion.div>
    </motion.section>
  );
};

export default ContactPage;
