/**
 * Result shape returned by the auth Server Actions.
 *
 * This lives outside `actions.ts` on purpose: a `'use server'` module may only
 * export async functions, so the initial state object and its type have to sit
 * in a plain module that the client forms can import.
 */
export type AuthState = {
  status: 'idle' | 'error' | 'success'
  message?: string
  fieldErrors?: Record<string, string[]>
  /**
   * Last submitted values, echoed back so the form can repopulate after a
   * failed submission (React resets uncontrolled inputs when the action
   * completes). Never includes passwords — those are always retyped.
   */
  values?: Record<string, string>
}

export const initialAuthState: AuthState = { status: 'idle' }
