import { z } from 'zod'

export const emailSchema = z.email('Enter a valid email address.')

/**
 * Spec §G: minimum 12 characters — length beats composition rules. No
 * letter/number/symbol mandates (they produce `Password1!`). Breached-password
 * screening is a Supabase Auth dashboard setting, not application code.
 */
export const passwordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters.')

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Enter your password.'),
})

export type SignInInput = z.infer<typeof signInSchema>

export const applicantRegistrationSchema = z.object({
  firstName: z.string().trim().min(2, 'Enter your first name.'),
  lastName: z.string().trim().min(2, 'Enter your last name.'),
  email: emailSchema,
  phone: z
    .string()
    .trim()
    .min(7, 'Enter a valid phone number.')
    .regex(/^[+\d][\d\s()-]{6,}$/, 'Enter a valid phone number.'),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter your date of birth.'),
  guardianName: z.string().trim().min(2, 'Enter your guardian’s name.'),
  guardianPhone: z
    .string()
    .trim()
    .min(7, 'Enter a valid phone number.')
    .regex(/^[+\d][\d\s()-]{6,}$/, 'Enter a valid phone number.'),
  classApplying: z.string().trim().min(1, 'Select the class you are applying to.'),
  previousSchool: z.string().trim().optional(),
  statement: z
    .string()
    .trim()
    .min(40, 'Tell us a little more (at least 40 characters).')
    .max(2000, 'Keep this under 2000 characters.'),
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Confirm your password.'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword'],
})

export type ApplicantRegistrationInput = z.infer<
  typeof applicantRegistrationSchema
>

export const profileUpdateSchema = z.object({
  firstName: z.string().trim().min(1, 'Required.').max(80),
  lastName: z.string().trim().min(1, 'Required.').max(80),
  phone: z
    .string()
    .trim()
    .regex(/^[+\d][\d\s()-]{6,}$/, 'Enter a valid phone number.'),
})

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>

export const complaintSchema = z.object({
  // Spec FR-7.2: exactly one of Academic, Financial, Disciplinary.
  category: z.enum(['academic', 'financial', 'disciplinary'], {
    error: 'Select a category.',
  }),
  subject: z.string().trim().min(5, 'Add a subject.').max(160),
  body: z.string().trim().min(20, 'Provide more detail (at least 20 characters).'),
  anonymous: z.boolean().default(false),
})

export type ComplaintInput = z.infer<typeof complaintSchema>

export const anonymousReportSchema = z.object({
  category: z.enum(
    ['bullying', 'safety', 'abuse', 'theft', 'misconduct', 'other'],
    { error: 'Select a category.' },
  ),
  body: z.string().trim().min(30, 'Provide more detail (at least 30 characters).'),
  incidentDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter the date of the incident.')
    .optional(),
  anonymous: z.literal(true),
})

export type AnonymousReportInput = z.infer<typeof anonymousReportSchema>

export const messageSchema = z.object({
  recipientId: z.string().uuid('Invalid recipient.'),
  body: z.string().trim().min(1, 'Write a message.').max(4000),
})

export type MessageInput = z.infer<typeof messageSchema>
