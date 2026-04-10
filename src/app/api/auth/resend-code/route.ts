import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { artists } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email обязателен' },
        { status: 400 }
      );
    }

    const [user] = await db
      .select()
      .from(artists)
      .where(eq(artists.email, email))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email уже подтвержден' },
        { status: 400 }
      );
    }

    // Send verification code via Supabase Auth OTP (handled inside sendVerificationEmail)
    const { success: emailSent, error: emailError } = await sendVerificationEmail(email);

    if (!emailSent) {
      console.error('Failed to resend email:', emailError);
      return NextResponse.json(
        { error: 'Ошибка при отправке кода' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Код успешно отправлен повторно',
    });
  } catch (error) {
    console.error('Resend code error:', error);
    return NextResponse.json(
      { error: 'Ошибка при повторной отправке кода' },
      { status: 500 }
    );
  }
}
