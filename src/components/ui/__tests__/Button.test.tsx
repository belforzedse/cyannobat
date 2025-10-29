import React from 'react'
import { render } from '@testing-library/react'

import { Button } from '../Button'

describe('Button', () => {
  it('matches the primary variant snapshot', () => {
    const { getByRole } = render(
      <Button disableAnimation variant="primary">
        Primary CTA
      </Button>
    )

    expect(getByRole('button')).toMatchInlineSnapshot(`
      <button
        class="relative inline-flex items-center justify-center gap-2 rounded-full focus-visible:outline-none cursor-pointer overflow-hidden border border-[rgba(255,255,255,0.55)] bg-[linear-gradient(135deg,var(--accent-strong),var(--accent))] font-semibold text-[rgb(12,22,38)] shadow-[0_20px_48px_-24px_rgba(86,154,222,0.45),0_10px_18px_-16px_rgba(42,74,125,0.28)] backdrop-blur-[12px] transition-[box-shadow,transform,filter] duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)] after:content-[""] after:absolute after:inset-[2px] after:rounded-full after:bg-[linear-gradient(180deg,rgba(255,255,255,0.55)_0%,rgba(255,255,255,0.2)_58%,transparent_100%)] after:pointer-events-none after:opacity-[0.85] after:transition-opacity after:duration-[250ms] after:ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-[1px] hover:after:opacity-100 hover:shadow-[0_28px_60px_-24px_rgba(86,154,222,0.55),0_16px_24px_-18px_rgba(42,74,125,0.34)] active:translate-y-0 active:brightness-[0.98] disabled:cursor-not-allowed disabled:opacity-75 disabled:shadow-none disabled:bg-[linear-gradient(135deg,color-mix(in_srgb,var(--accent)_55%,transparent),color-mix(in_srgb,var(--accent)_35%,transparent))] disabled:after:opacity-[0.5] dark:text-[rgb(4,10,24)] dark:shadow-[0_24px_56px_-26px_rgba(36,132,255,0.55),0_12px_28px_-18px_rgba(2,6,28,0.6)] dark:hover:shadow-[0_32px_68px_-28px_rgba(120,190,255,0.6),0_18px_36px_-20px_rgba(2,6,28,0.65)] dark:disabled:bg-[linear-gradient(135deg,color-mix(in_srgb,var(--accent)_42%,transparent),color-mix(in_srgb,var(--accent)_24%,transparent))] dark:after:opacity-[0.85] px-8 py-3 text-base"
      >
        <span>
          Primary CTA
        </span>
      </button>
    `)
  })

  it('matches the secondary variant snapshot', () => {
    const { getByRole } = render(
      <Button disableAnimation variant="secondary">
        Secondary CTA
      </Button>
    )

    expect(getByRole('button')).toMatchInlineSnapshot(`
      <button
        class="relative inline-flex items-center justify-center gap-2 rounded-full focus-visible:outline-none cursor-pointer overflow-hidden border border-[rgba(255,255,255,0.45)] bg-[linear-gradient(145deg,rgba(255,255,255,0.68),rgba(255,255,255,0.4))] text-foreground shadow-[0_16px_36px_-24px_rgba(42,74,125,0.28),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-[14px] transition-[border-color,background,box-shadow,transform] duration-[220ms] ease-[cubic-bezier(0.16,1,0.3,1)] after:content-[""] after:absolute after:inset-[2px] after:rounded-full after:bg-[linear-gradient(180deg,rgba(255,255,255,0.45)_0%,rgba(255,255,255,0.12)_65%,transparent_100%)] after:pointer-events-none after:opacity-[0.75] after:transition-opacity after:duration-[220ms] after:ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-[1px] hover:border-accent/45 hover:bg-[linear-gradient(145deg,rgba(255,255,255,0.72),color-mix(in_srgb,var(--accent)_16%,transparent))] hover:shadow-[0_20px_44px_-26px_rgba(86,154,222,0.32),inset_0_1px_0_rgba(255,255,255,0.6)] hover:after:opacity-[0.9] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none disabled:after:opacity-40 dark:border-[rgba(120,190,255,0.28)] dark:bg-[linear-gradient(145deg,rgba(12,22,38,0.85),rgba(12,22,38,0.62))] dark:shadow-[0_22px_48px_-28px_rgba(2,6,28,0.72),inset_0_1px_0_rgba(120,190,255,0.18)] dark:hover:border-[rgba(120,190,255,0.5)] dark:hover:bg-[linear-gradient(145deg,rgba(36,132,255,0.18),rgba(12,22,38,0.78))] dark:hover:shadow-[0_30px_58px_-30px_rgba(36,132,255,0.32),inset_0_1px_0_rgba(120,190,255,0.22)] dark:disabled:border-[rgba(120,190,255,0.16)] dark:disabled:bg-[linear-gradient(145deg,rgba(12,22,38,0.7),rgba(12,22,38,0.5))] px-6 py-2.5 text-[0.9rem]"
      >
        <span>
          Secondary CTA
        </span>
      </button>
    `)
  })

  it('matches the glass pill variant snapshot', () => {
    const { getByRole } = render(
      <Button disableAnimation variant="glass-pill">
        Glass CTA
      </Button>
    )

    expect(getByRole('button')).toMatchInlineSnapshot(`
      <button
        class="relative focus-visible:outline-none text-foreground px-4 py-2 text-sm inline-flex items-center justify-center gap-2 rounded-full border border-white/45 bg-[linear-gradient(145deg,rgba(255,255,255,0.7),rgba(255,255,255,0.4))] shadow-[0_14px_32px_-22px_rgba(42,74,125,0.38),inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-[16px] transition-[box-shadow,border-color,background,transform] duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)] dark:border-[rgba(120,190,255,0.25)] dark:bg-[linear-gradient(145deg,rgba(12,22,38,0.88),rgba(12,22,38,0.64))] dark:shadow-[0_18px_42px_-26px_rgba(2,6,28,0.72),inset_0_1px_0_rgba(120,190,255,0.16)] cursor-pointer hover:border-accent/40 hover:bg-[linear-gradient(145deg,rgba(255,255,255,0.78),color-mix(in_srgb,var(--accent)_18%,transparent))] hover:shadow-[0_22px_42px_-26px_rgba(86,154,222,0.32),0_12px_30px_-20px_rgba(42,74,125,0.32)] hover:-translate-y-0.5 dark:hover:border-[rgba(120,190,255,0.5)] dark:hover:bg-[linear-gradient(145deg,rgba(36,132,255,0.22),rgba(12,22,38,0.76))] dark:hover:shadow-[0_28px_52px_-28px_rgba(36,132,255,0.35),0_18px_36px_-26px_rgba(2,6,28,0.68)]"
      >
        <span>
          Glass CTA
        </span>
      </button>
    `)
  })
})

