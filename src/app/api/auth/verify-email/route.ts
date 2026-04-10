import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { artists } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { supabase } from '@/lib/supabase-client';

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email и код обязательны' },
        { status: 400 }
      );
    }

    // Verify code via Supabase
    const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email',
    });

    if (verifyError) {
      console.error('Supabase verify error:', verifyError);
      return NextResponse.json(
        { error: 'Неверный или истекший код подтверждения' },
        { status: 400 }
      );
    }

    // Get user from Turso
    const [user] = await db
      .select()
      .from(artists)
      .where(eq(artists.email, email))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден в базе данных' },
        { status: 404 }
      );
    }

    // Update user in Turso
    await db
      .update(artists)
      .set({
        emailVerified: true,
        verificationCode: null,
      })
      .where(eq(artists.id, user.id));

    return NextResponse.json({
      success: true,
      message: 'Email успешно подтвержден',
    });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'Ошибка при верификации' },
      { status: 500 }
    );
  }
}
