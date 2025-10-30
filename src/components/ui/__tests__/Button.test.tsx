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
        class="relative inline-flex items-center justify-center gap-2 rounded-full font-medium focus-visible:outline-none transition-transform duration-200 ease-out overflow-hidden backdrop-blur-[12px] px-8 py-3 text-base _root_e3db9e _focusVisible_e3db9e _primary_e3db9e"
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
        class="relative inline-flex items-center justify-center gap-2 rounded-full font-medium focus-visible:outline-none transition-transform duration-200 ease-out overflow-hidden backdrop-blur-[14px] px-6 py-2.5 text-[0.9rem] _root_e3db9e _focusVisible_e3db9e _secondary_e3db9e"
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
        class="relative font-medium focus-visible:outline-none ease-out text-foreground px-4 py-2 text-sm _focusVisible_e3db9e inline-flex items-center justify-center gap-2 rounded-full border border-white/45 bg-[linear-gradient(145deg,rgba(255,255,255,0.7),rgba(255,255,255,0.4))] shadow-[0_14px_32px_-22px_rgba(42,74,125,0.38),inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-[16px] transition-[box-shadow,border-color,background,transform] duration-[250ms] ease-glass dark:border-[rgba(120,190,255,0.25)] dark:bg-[linear-gradient(145deg,rgba(12,22,38,0.88),rgba(12,22,38,0.64))] dark:shadow-[0_18px_42px_-26px_rgba(2,6,28,0.72),inset_0_1px_0_rgba(120,190,255,0.16)] cursor-pointer hover:border-accent/40 hover:bg-[linear-gradient(145deg,rgba(255,255,255,0.78),color-mix(in_srgb,var(--accent)_18%,transparent))] hover:shadow-[0_22px_42px_-26px_rgba(86,154,222,0.32),0_12px_30px_-20px_rgba(42,74,125,0.32)] hover:-translate-y-0.5 dark:hover:border-[rgba(120,190,255,0.5)] dark:hover:bg-[linear-gradient(145deg,rgba(36,132,255,0.22),rgba(12,22,38,0.76))] dark:hover:shadow-[0_28px_52px_-28px_rgba(36,132,255,0.35),0_18px_36px_-26px_rgba(2,6,28,0.68)]"
      >
        <span>
          Glass CTA
        </span>
      </button>
    `)
  })
})

