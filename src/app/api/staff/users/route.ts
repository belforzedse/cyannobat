import { NextResponse } from 'next/server'
import { ZodError, z } from 'zod'

import { authenticateStaffRequest, unauthorizedResponse } from '@/lib/api/auth'
import { extractRoles } from '@/lib/auth'
import { ASSIGNABLE_ROLES, canAssignRoles, type AssignableRole } from '@/lib/staff/rolePermissions'
import {
  isValidIranNationalId,
  normalizeIranNationalIdDigits,
} from '@/lib/validators/iran-national-id'

export const dynamic = 'force-dynamic'

const roleEnum = z.enum(ASSIGNABLE_ROLES as [typeof ASSIGNABLE_ROLES[number], ...typeof ASSIGNABLE_ROLES[number][]])

const emailSchema = z
  .string({ invalid_type_error: 'Email must be a string' })
  .trim()
  .email('Email must be valid')

const phoneSchema = z
  .string({ invalid_type_error: 'Phone number must be a string' })
  .trim()
  .min(1, 'Phone number must be provided')
  .regex(/^(\+98|0)?9\d{9}$/, 'Enter a valid Iranian phone number')

const nationalIdSchema = z
  .string({ invalid_type_error: 'National ID must be a string', required_error: 'National ID is required' })
  .transform((value) => normalizeIranNationalIdDigits(value))
  .transform((value) => value.trim())
  .refine((value) => isValidIranNationalId(value), {
    message: 'Enter a valid Iranian national ID',
  })

const createUserSchema = z.object({
  email: emailSchema.optional().or(z.literal('').transform(() => undefined)),
  phone: phoneSchema,
  nationalId: nationalIdSchema,
  password: z
    .string({
      required_error: 'Password is required',
      invalid_type_error: 'Password must be a string',
    })
    .min(8, 'Password must be at least 8 characters long'),
  roles: z.array(roleEnum).optional(),
})

type CreateUserBody = z.infer<typeof createUserSchema>

const parseBody = async (request: Request): Promise<CreateUserBody> => {
  const body = await request.json()
  return createUserSchema.parse(body)
}

export const POST = async (request: Request) => {
  const { payload, user } = await authenticateStaffRequest(request)

  if (!user) {
    return unauthorizedResponse()
  }

  let body: CreateUserBody

  try {
    body = await parseBody(request)
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          message: 'Invalid request body',
          issues: error.flatten(),
        },
        { status: 400 },
      )
    }

    return NextResponse.json(
      {
        message: 'Invalid JSON body',
      },
      { status: 400 },
    )
  }

  const defaultRoles: NonNullable<CreateUserBody['roles']> = ['patient']
  const rolesToAssign = body.roles && body.roles.length > 0 ? body.roles : defaultRoles

  if (!canAssignRoles(extractRoles(user), rolesToAssign)) {
    return NextResponse.json(
      {
        message: 'You do not have permission to assign one or more of the requested roles.',
      },
      { status: 403 },
    )
  }

  const normalizedPhone = body.phone.trim()
  const normalizedEmail = body.email?.trim()
  const normalizedNationalId = body.nationalId

  try {
    const created = await payload.create({
      collection: 'users',
      data: {
        email: normalizedEmail || undefined,
        name: normalizedPhone,
        phone: normalizedPhone,
        nationalId: normalizedNationalId,
        username: normalizedPhone,
        password: body.password,
        roles: rolesToAssign,
      },
      overrideAccess: false,
    })

    const createdRoles = Array.isArray(created.roles)
      ? created.roles.filter(
          (role): role is AssignableRole =>
            typeof role === 'string' && (ASSIGNABLE_ROLES as readonly string[]).includes(role),
        )
      : []

    return NextResponse.json(
      {
        user: {
          id: created.id,
          email: created.email,
          phone: created.phone,
          nationalId: (created as { nationalId?: string }).nationalId ?? null,
          roles: createdRoles,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    payload.logger.error?.('Failed to create staff-managed user', error)

    if (error instanceof Error && /duplicate key value|already exists/i.test(error.message)) {
      return NextResponse.json(
        {
          message: 'A user with the same email, phone, or national ID already exists.',
        },
        { status: 409 },
      )
    }

    return NextResponse.json(
      {
        message: 'Failed to create user.',
      },
      { status: 500 },
    )
  }
}
