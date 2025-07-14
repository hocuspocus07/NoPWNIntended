'use server'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers' 
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const supabase = await createClient()
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { data: authData, error: authError } = 
    await supabase.auth.signInWithPassword({ email, password })

  if (authError) {
    console.error('Auth error:', authError)
    return { error: authError.message }
  }

  // --- NEW: Get session and set cookie manually ---
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    const cookieStore = await cookies();
    cookieStore.set('sb-access-token', session.access_token, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      maxAge: session.expires_in,
      secure: process.env.NODE_ENV === 'production',
    });
    cookieStore.set('sb-refresh-token', session.refresh_token, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      secure: process.env.NODE_ENV === 'production',
    });
  }
  // --- END NEW ---

  // Add a small delay to ensure session is established
  await new Promise(resolve => setTimeout(resolve, 500))
  
  revalidatePath('/')
  redirect('/dashboard')
}
// Signup 
export async function signup(formData: FormData) {
  const supabase = await createClient()
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string

  // 1. Create auth user
  const { data: authData, error: authError } = 
    await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    })

  if (authError) throw new Error(authError.message)

  // 2. Create public user record
  if (authData.user) {
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        name,
      })

    if (profileError) {
      await supabase.auth.admin.deleteUser(authData.user.id)
      throw new Error(profileError.message)
    }
  }

  revalidatePath('/')
  return { success: true }
}