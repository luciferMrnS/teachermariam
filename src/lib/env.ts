import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url('NEXT_PUBLIC_SUPABASE_URL must be a URL.'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20, 'Anon key looks too short.'),
})

export type PublicEnv = z.infer<typeof envSchema>

let cached: PublicEnv | null = null

export function publicEnv(): PublicEnv {
  if (cached) return cached

  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  })

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('\n')
    throw new Error(
      `Supabase environment is not configured.\n${issues}\n\nCopy .env.example to .env.local and fill in the values from your Supabase project settings.`,
    )
  }

  cached = parsed.data
  return cached
}
