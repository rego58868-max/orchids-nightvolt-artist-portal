import { supabase } from './supabase-client';

export async function sendVerificationEmail(email: string, code?: string) {
  try {
    // We use Supabase Auth OTP to send the email. 
    // Supabase handles the code generation and delivery automatically.
    // The default Supabase email service allows sending to any email address.
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      }
    });

    if (error) {
      console.error('Supabase Auth OTP error:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('Email sending exception:', error);
    return { success: false, error };
  }
}
