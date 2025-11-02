import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import { z } from 'zod';

import configPromise from '@payload-config';

const contactSchema = z.object({
  name: z
    .string({ required_error: 'وارد کردن نام الزامی است.' })
    .trim()
    .min(1, 'وارد کردن نام الزامی است.')
    .max(150, 'نام باید کمتر از ۱۵۰ کاراکتر باشد.'),
  email: z
    .string({ required_error: 'ایمیل الزامی است.' })
    .trim()
    .min(1, 'ایمیل الزامی است.')
    .max(320, 'ایمیل باید کمتر از ۳۲۰ کاراکتر باشد.')
    .email('ایمیل وارد شده معتبر نیست.'),
  subject: z
    .string({ required_error: 'موضوع پیام را وارد کنید.' })
    .trim()
    .min(1, 'موضوع پیام را وارد کنید.')
    .max(200, 'موضوع پیام باید کمتر از ۲۰۰ کاراکتر باشد.'),
  message: z
    .string({ required_error: 'متن پیام الزامی است.' })
    .trim()
    .min(1, 'متن پیام الزامی است.')
    .max(2000, 'متن پیام باید کمتر از ۲۰۰۰ کاراکتر باشد.'),
});

const buildValidationResponse = (issues: z.ZodIssue[]) =>
  NextResponse.json(
    {
      message: 'اطلاعات ارسالی معتبر نیست.',
      errors: issues.map((issue) => ({
        field: issue.path[0] ?? 'form',
        message: issue.message,
      })),
    },
    { status: 400 },
  );

const extractClientDetails = (request: Request) => {
  const forwardedFor = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
  const ipAddress = forwardedFor ? (forwardedFor.split(',')[0]?.trim() ?? null) : null;

  return {
    ipAddress,
    userAgent: request.headers.get('user-agent') ?? null,
    referer: request.headers.get('referer') ?? request.headers.get('referrer') ?? null,
  };
};

const sendTicketEmail = async (
  payload: Awaited<ReturnType<typeof getPayload>>,
  data: z.infer<typeof contactSchema>,
  clientDetails: ReturnType<typeof extractClientDetails>,
) => {
  const to =
    process.env.SUPPORT_EMAIL_TO || process.env.SUPPORT_EMAIL_RECIPIENT || 'support@cyannobat.com';
  const from =
    process.env.SUPPORT_EMAIL_FROM ||
    process.env.SUPPORT_EMAIL_IDENTITY ||
    'no-reply@cyannobat.com';

  const subject = `[Cyannobat] پیام جدید: ${data.subject}`;
  const plain = [
    `نام: ${data.name}`,
    `ایمیل: ${data.email}`,
    `موضوع: ${data.subject}`,
    '',
    data.message,
    '',
    `منبع: فرم تماس سایت`,
    clientDetails.ipAddress ? `IP: ${clientDetails.ipAddress}` : null,
    clientDetails.userAgent ? `User Agent: ${clientDetails.userAgent}` : null,
    clientDetails.referer ? `Referrer: ${clientDetails.referer}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const html = `
    <p><strong>نام:</strong> ${data.name}</p>
    <p><strong>ایمیل:</strong> ${data.email}</p>
    <p><strong>موضوع:</strong> ${data.subject}</p>
    <hr />
    <p style="white-space: pre-wrap;">${data.message}</p>
    <hr />
    <p><strong>منبع:</strong> فرم تماس سایت</p>
    ${clientDetails.ipAddress ? `<p><strong>IP:</strong> ${clientDetails.ipAddress}</p>` : ''}
    ${clientDetails.userAgent ? `<p><strong>User Agent:</strong> ${clientDetails.userAgent}</p>` : ''}
    ${clientDetails.referer ? `<p><strong>Referrer:</strong> ${clientDetails.referer}</p>` : ''}
  `;

  await payload.sendEmail({
    to,
    from,
    subject,
    text: plain,
    html,
  });
};

const createSupportTicket = async (
  payload: Awaited<ReturnType<typeof getPayload>>,
  data: z.infer<typeof contactSchema>,
  clientDetails: ReturnType<typeof extractClientDetails>,
) => {
  type CreateArgs = Parameters<typeof payload.create>[0];
  const fallbackCollection = 'supportTickets';
  const configuredCollection = process.env.SUPPORT_TICKETS_COLLECTION?.trim();
  const candidateCollection =
    configuredCollection && configuredCollection.length > 0
      ? configuredCollection
      : fallbackCollection;

  const availableCollections = payload.collections as Record<string, unknown> | undefined;
  const resolvedCollection = availableCollections
    ? candidateCollection in availableCollections
      ? (candidateCollection as CreateArgs['collection'])
      : fallbackCollection in availableCollections
        ? (fallbackCollection as CreateArgs['collection'])
        : null
    : null;

  if (!resolvedCollection) {
    throw new Error('Support tickets collection is not registered in Payload configuration.');
  }

  const created = await payload.create({
    collection: resolvedCollection,
    overrideAccess: true,
    data: {
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
      status: 'new',
      source: 'contact-form',
      metadata: {
        channel: 'web',
        ipAddress: clientDetails.ipAddress,
        userAgent: clientDetails.userAgent,
        referer: clientDetails.referer,
      },
    },
  } as CreateArgs);

  return created?.id ?? null;
};

export const dynamic = 'force-dynamic';

export const POST = async (request: Request) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        message: 'ساختار درخواست نامعتبر است.',
      },
      { status: 400 },
    );
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return buildValidationResponse(parsed.error.issues);
  }

  let payload;
  try {
    payload = await getPayload({ config: configPromise });
  } catch (error) {
    console.error('Failed to initialize Payload for contact route', error);
    return NextResponse.json(
      {
        message: 'امکان پردازش درخواست وجود ندارد. لطفاً بعداً تلاش کنید.',
      },
      { status: 500 },
    );
  }

  const deliveryMode = (process.env.CONTACT_DELIVERY_MODE || 'ticket').toLowerCase();
  const clientDetails = extractClientDetails(request);

  try {
    if (deliveryMode === 'email') {
      await sendTicketEmail(payload, parsed.data, clientDetails);
      return NextResponse.json(
        {
          message: 'پیام شما با موفقیت ارسال شد.',
        },
        { status: 200 },
      );
    }

    const ticketId = await createSupportTicket(payload, parsed.data, clientDetails);
    return NextResponse.json(
      {
        message: 'پیام شما با موفقیت ثبت شد.',
        ticketId,
      },
      { status: 201 },
    );
  } catch (error) {
    payload.logger.error?.('Failed to process contact form submission', error);

    if (
      deliveryMode !== 'email' &&
      (process.env.SUPPORT_EMAIL_TO || process.env.SUPPORT_EMAIL_RECIPIENT)
    ) {
      try {
        await sendTicketEmail(payload, parsed.data, clientDetails);
        return NextResponse.json(
          {
            message: 'پیام شما با موفقیت ارسال شد.',
          },
          { status: 200 },
        );
      } catch (emailError) {
        payload.logger.error?.('Failed to send contact form fallback email', emailError);
      }
    }

    return NextResponse.json(
      {
        message: 'ارسال پیام با خطا مواجه شد. لطفاً دوباره تلاش کنید.',
      },
      { status: 500 },
    );
  }
};
