import type { UserRole, UserStatus } from '@department-tools/types/auth'
import { z } from 'zod'

export const userStatusSchema = z.union([
  z.literal('active'),
  z.literal('inactive'),
]) satisfies z.ZodType<UserStatus>

export const userRoleSchema = z.union([
  z.literal('super_admin'),
  z.literal('admin'),
  z.literal('user'),
]) satisfies z.ZodType<UserRole>

export const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  employee_id: z.string(),
  department_id: z.number().nullable(),
  department: z.object({ id: z.number(), name: z.string() }).nullable().optional(),
  status: userStatusSchema,
  role: userRoleSchema,
  must_change_password: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
})
export type User = z.infer<typeof userSchema>
export type { UserRole, UserStatus }
