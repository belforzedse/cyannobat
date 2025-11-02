import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

vi.mock('payload', () => ({
  getPayload: vi.fn(),
}));

vi.mock('@payload-config', () => ({
  default: {},
}));

describe('reserve confirmation page', () => {
  it('renders a friendly fallback when reference is missing', async () => {
    const ConfirmationPage = (await import('./page')).default;
    const tree = await ConfirmationPage({ searchParams: Promise.resolve({}) });
    const html = renderToString(tree);

    expect(html).toContain('تأییدیه رزرو در دسترس نیست');
  });
});
