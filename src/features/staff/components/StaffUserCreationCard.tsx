'use client'

import React, { useEffect, useMemo, useState } from 'react'

import { Button, Card, Input } from '@/components/ui'
import { useToast } from '@/components/ui/ToastProvider'
import { useGlobalLoadingOverlay } from '@/components/GlobalLoadingOverlayProvider'
import type { StaffUser } from '@/features/staff/types'
import { type AssignableRole, getCreatableRolesForUser } from '@/lib/staff/rolePermissions'
import { isAssignableRole, roleLabels } from '@/features/staff/utils/roleLabels'

type StaffUserCreationCardProps = {
  currentUser: StaffUser
}

type CreatedUser = {
  email: string
  roles: string[]
}

const roleHelpText: Record<AssignableRole, string> = {
  patient: 'Basic portal access and booking management.',
  doctor: 'Clinical staff with access to provider tooling.',
  receptionist: 'Front desk staff with scheduling capabilities.',
  admin: 'Full administrative access across the workspace.',
}

const StaffUserCreationCard = ({ currentUser }: StaffUserCreationCardProps) => {
  const creatableRoles = useMemo(() => getCreatableRolesForUser(currentUser.roles), [currentUser.roles])
  const { showToast } = useToast()
  const { setActivity } = useGlobalLoadingOverlay()

  const [email, setEmail] = useState('')
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

    if (!selectedRole) {
      setFormError('Select a role to assign.')
      return
    }

    setFormError(null)
    setIsSubmitting(true)
    setActivity('staff-create-user', true, 'Creating user account...')

    try {
      const response = await fetch('/api/staff/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          roles: [selectedRole],
        }),
      })

      if (!response.ok) {
        let description = 'Unable to create the user.'

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
      setPassword('')
      setLastCreatedUser(result.user)
      showToast({
        description: `Created ${roleLabels[selectedRole]} account for ${result.user.email}.`,
        variant: 'success',
      })
    } catch (error) {
      console.error(error)
      const description = 'Unable to create the user. Please try again.'
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
        <h2 className='text-lg font-semibold text-foreground'>Add a team member</h2>
        <p className='text-xs text-muted-foreground'>
          Create new user accounts with the appropriate permissions. Only the roles you are allowed to manage are shown
          below.
        </p>
      </div>

      <form className='flex flex-col gap-5' onSubmit={handleSubmit}>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
          <label className='flex flex-col gap-2 text-sm'>
            <span className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>Email</span>
            <Input
              type='email'
              autoComplete='email'
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder='name@example.com'
            />
          </label>

          <label className='flex flex-col gap-2 text-sm'>
            <span className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>Temporary password</span>
            <Input
              type='password'
              autoComplete='new-password'
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder='At least 8 characters'
            />
          </label>

          <label className='flex flex-col gap-2 text-sm'>
            <span className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>Role</span>
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
                  {roleLabels[role]}
                </option>
              ))}
            </select>
          </label>
        </div>

        {selectedRole && (
          <p className='rounded-xl border border-dashed border-white/15 bg-white/10 px-4 py-3 text-xs text-muted-foreground dark:border-white/10'>
            <span className='font-semibold text-foreground'>{roleLabels[selectedRole]}:</span>{' '}
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
            Accounts are created instantly. Share the temporary password and encourage recipients to update it after
            signing in.
          </p>
          <Button type='submit' disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create account'}
          </Button>
        </div>
      </form>

      {lastCreatedUser && (
        <div className='rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-muted-foreground dark:border-white/10 dark:bg-white/5'>
          <span className='font-semibold text-foreground'>Last created:</span>{' '}
          <span>{lastCreatedUser.email}</span>
          <span className='mx-2 text-muted-foreground/60'>•</span>
          <span>{lastCreatedUser.roles.join(', ')}</span>
        </div>
      )}
    </Card>
  )
}

export default StaffUserCreationCard
