import { NextResponse } from 'next/server'
import { ZodError, z } from 'zod'

import { authenticateStaffRequest, unauthorizedResponse } from '@/lib/api/auth'
import { extractRoles } from '@/lib/auth'
import { ASSIGNABLE_ROLES, canAssignRoles } from '@/lib/staff/rolePermissions'

export const dynamic = 'force-dynamic'

const roleEnum = z.enum(ASSIGNABLE_ROLES as [typeof ASSIGNABLE_ROLES[number], ...typeof ASSIGNABLE_ROLES[number][]])

const createUserSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required',
      invalid_type_error: 'Email must be a string',
    })
    .trim()
    .min(1, 'Email is required')
    .email('Email must be valid'),
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

  const rolesToAssign = body.roles && body.roles.length > 0 ? body.roles : ['patient']

  if (!canAssignRoles(extractRoles(user), rolesToAssign)) {
    return NextResponse.json(
      {
        message: 'You do not have permission to assign one or more of the requested roles.',
      },
      { status: 403 },
    )
  }

  try {
    const created = await payload.create({
      collection: 'users',
      data: {
        email: body.email,
        password: body.password,
        roles: rolesToAssign,
      },
      overrideAccess: false,
    })

    const createdRoles = Array.isArray(created.roles) ? created.roles.filter((role): role is string => typeof role === 'string') : []

    return NextResponse.json(
      {
        user: {
          id: created.id,
          email: created.email,
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
          message: 'A user with that email already exists.',
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
