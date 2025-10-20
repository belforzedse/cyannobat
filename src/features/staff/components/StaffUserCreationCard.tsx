'use client'

import React, { useEffect, useMemo, useState } from 'react'

import { Button, Card, Input } from '@/components/ui'
import { useToast } from '@/components/ui/ToastProvider'
import { useGlobalLoadingOverlay } from '@/components/GlobalLoadingOverlayProvider'
import type { StaffUser } from '@/features/staff/types'
import { ASSIGNABLE_ROLES, type AssignableRole, getCreatableRolesForUser } from '@/lib/staff/rolePermissions'

type StaffUserCreationCardProps = {
  currentUser: StaffUser
}

type CreatedUser = {
  email?: string | null
  phone?: string | null
  roles: string[]
}

const roleLabelsFa: Record<AssignableRole, string> = {
  patient: 'O"UOU.OO�',
  doctor: 'U_O�O\'Uc',
  receptionist: 'U.O3O�U^U, U_O�UOO�O\'',
  admin: 'U.O_UOO�',
}

const roleHelpText: Record<AssignableRole, string> = {
  patient: 'O_O3O�O�O3UO U_OUOU� O"U� U_O�O�OU, U^ U.O_UOO�UOO� U+U^O"O��?OU�O.',
  doctor: 'O1OU^ UcOO_O� O_O�U.OU+ O"O O_O3O�O�O3UO O"U� OO"O�OO�U�OUO U_O�O\'Uc.',
  receptionist: 'U_O�O3U+U, U_O�UOO�O\' O"O OU.UcOU+ O�U.OU+�?OO"U+O_UO U+U^O"O��?OU�O.',
  admin: 'O_O3O�O�O3UO U.O_UOO�UOO�UO UcOU.U, O"U� O�U.OU. O"OrO\'�?OU�O.',
}

const isAssignableRole = (value: string): value is AssignableRole =>
  (ASSIGNABLE_ROLES as readonly string[]).includes(value)

const getRoleLabelFa = (role: string) => (isAssignableRole(role) ? roleLabelsFa[role] : role)

const iranPhoneRegex = /^(\+98|0)?9\d{9}$/

const StaffUserCreationCard = ({ currentUser }: StaffUserCreationCardProps) => {
  const creatableRoles = useMemo(() => getCreatableRolesForUser(currentUser.roles), [currentUser.roles])
  const { showToast } = useToast()
  const { setActivity } = useGlobalLoadingOverlay()

  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [selectedRole, setSelectedRole] = useState<AssignableRole | ''>(creatableRoles[0] ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [lastCreatedUser, setLastCreatedUser] = useState<CreatedUser | null>(null)

  useEffect(() => {
    if (creatableRoles.length === 0) {
      setSelectedRole('')
      return
    }

    setSelectedRole((current) => {
      if (current && creatableRoles.includes(current)) {
        return current
      }
      return creatableRoles[0]
    })
  }, [creatableRoles])

  if (creatableRoles.length === 0) {
    return null
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedEmail = email.trim()
    const trimmedPhone = phone.trim()

    if (!selectedRole) {
      setFormError('U,O�U?OU< UOUc U+U,O\' O"O�OUO OOrO�O�OO� OU+O�OrOO" UcU+UOO_.')
      return
    }

    if (!trimmedPhone) {
      setFormError('شماره تلفن الزامی است.')
      return
    }

    if (!iranPhoneRegex.test(trimmedPhone)) {
      setFormError('شماره تلفن معتبر وارد کنید.')
      return
    }

    setFormError(null)
    setIsSubmitting(true)
    setActivity('staff-create-user', true, 'OUOO�OO_ O-O3OO" UcOO�O"O�UO O�O_UOO_...')

    try {
      const response = await fetch('/api/staff/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: trimmedEmail || undefined,
          phone: trimmedPhone,
          password,
          roles: [selectedRole],
        }),
      })

      if (!response.ok) {
        let description = 'OU.UcOU+ OUOO�OO_ UcOO�O"O� U^O�U^O_ U+O_OO�O_.'

        try {
          const errorBody = (await response.json()) as { message?: string }
          if (errorBody?.message) {
            description = errorBody.message
          }
        } catch {
          // Ignore JSON parsing errors and keep the default message
        }

        setFormError(description)
        showToast({ description, variant: 'error' })
        return
      }

      const result = (await response.json()) as { user: CreatedUser }

      setEmail('')
      setPhone('')
      setPassword('')
      setLastCreatedUser(result.user)

      const contactLabel = result.user.email ?? result.user.phone ?? trimmedPhone
      showToast({
        description: `O-O3OO" ${roleLabelsFa[selectedRole]} O"O�OUO ${contactLabel} OUOO�OO_ O'O_.`,
        variant: 'success',
      })
    } catch (error) {
      console.error(error)
      const description = 'OU.UcOU+ OUOO�OO_ UcOO�O"O� U^O�U^O_ U+O_OO�O_. U,O�U?OU< O_U^O"OO�U� O�U,OO\' UcU+UOO_.'
      setFormError(description)
      showToast({ description, variant: 'error' })
    } finally {
      setIsSubmitting(false)
      setActivity('staff-create-user', false)
    }
  }

  return (
    <Card variant='default' padding='lg' className='flex flex-col gap-6'>
      <div className='flex flex-col gap-1 text-right'>
        <h2 className='text-lg font-semibold text-foreground'>OU?O�U^O_U+ O1OU^ O�UOU.</h2>
        <p className='text-xs text-muted-foreground'>
          O-O3OO"�?OU�OUO UcOO�O"O�UO O�O_UOO_ O�O O"O O3O�O- O_O3O�O�O3UO U.U+OO3O" OUOO�OO_ UcU+UOO_. O�U+U�O U+U,O'�?OU�OUOUO UcU� U.O�OO�
          O"U� U.O_UOO�UOO� O�U+�?OU�O U�O3O�UOO_ O_O� O�UOO� U+U.OUOO' O_OO_U� U.UO�?OO'U^U+O_.
        </p>
      </div>

      <form className='flex flex-col gap-5' onSubmit={handleSubmit}>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-4'>
          <label className='flex flex-col gap-2 text-sm'>
            <span className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>OUOU.UOU,</span>
            <Input
              type='email'
              autoComplete='email'
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder='UcOO�O"O�@example.com'
            />
          </label>

          <label className='flex flex-col gap-2 text-sm'>
            <span className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>شماره تلفن</span>
            <Input
              type='tel'
              autoComplete='tel'
              required
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder='09120000000'
            />
          </label>

          <label className='flex flex-col gap-2 text-sm'>
            <span className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>O�U.O� O1O"U^O� U.U^U,O�</span>
            <Input
              type='password'
              autoComplete='new-password'
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder='O-O_OU,U, U, UcOO�OUcO�O�'
            />
          </label>

          <label className='flex flex-col gap-2 text-sm'>
            <span className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>U+U,O'</span>
            <select
              className='glass-panel rounded-xl px-3 py-2 text-sm text-foreground ring-offset-background transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-70'
              value={selectedRole}
              onChange={(event) => {
                const role = event.target.value
                if (isAssignableRole(role) && creatableRoles.includes(role)) {
                  setSelectedRole(role)
                }
              }}
            >
              {creatableRoles.map((role) => (
                <option key={role} value={role}>
                  {roleLabelsFa[role]}
                </option>
              ))}
            </select>
          </label>
        </div>

        {selectedRole && (
          <p className='rounded-xl border border-dashed border-white/15 bg-white/10 px-4 py-3 text-xs text-muted-foreground dark:border-white/10'>
            <span className='font-semibold text-foreground'>{roleLabelsFa[selectedRole]}:</span>{' '}
            {roleHelpText[selectedRole]}
          </p>
        )}

        {formError && (
          <p className='rounded-xl border border-red-300/60 bg-red-50 px-4 py-3 text-xs text-red-700 dark:border-red-500/60 dark:bg-red-500/15 dark:text-red-100'>
            {formError}
          </p>
        )}

        <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
          <p className='text-[11px] text-muted-foreground'>
            O-O3OO"�?OU�O U?U^O�OU< OUOO�OO_ U.UO�?OO'U^U+O_. O�U.O� O1O"U^O� U.U^U,O� O�O O"U� OO'O�O�OUc O"U_O�OO�UOO_ U^ OO� UcOO�O"O�OU+ O"OrU^OU�UOO_
            U_O3 OO� U^O�U^O_ O�U+ O�O O�O�UOUOO� O_U�U+O_.
          </p>
          <Button type='submit' disabled={isSubmitting}>
            {isSubmitting ? 'O_O� O-OU, OUOO�OO_...' : 'OUOO�OO_ O-O3OO"'}
          </Button>
        </div>
      </form>

      {lastCreatedUser && (
        <div className='rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-muted-foreground dark:border-white/10 dark:bg-white/5'>
          <span className='font-semibold text-foreground'>O�OrO�UOU+ O-O3OO" OUOO�OO_O'O_U�:</span>{' '}
          <span>{lastCreatedUser.email ?? '—'}</span>
          <span className='mx-2 text-muted-foreground/60'>•</span>
          <span>{lastCreatedUser.phone ?? '—'}</span>
          <span className='mx-2 text-muted-foreground/60'>•</span>
          <span>{lastCreatedUser.roles.map((role) => getRoleLabelFa(role)).join('OO ')}</span>
        </div>
      )}
    </Card>
  )
}

export default StaffUserCreationCard
