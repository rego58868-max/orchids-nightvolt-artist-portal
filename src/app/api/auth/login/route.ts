import { NextRequest, NextResponse } from 'next/server';
import { verifyCredentials, createSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email и пароль обязательны' },
        { status: 400 }
      );
    }

    try {
      const user = await verifyCredentials(email, password);

      if (!user) {
        return NextResponse.json(
          { error: 'Неверный email или пароль' },
          { status: 401 }
        );
      }

      const token = await createSession(user);

        return NextResponse.json({
          success: true,
          token,
          user: {
            email: user.email,
            name: user.name,
            isAdmin: user.isAdmin,
            isManager: user.isManager,
            isFrozen: user.isFrozen,
            uid: user.uid,
            plan: user.plan,
            isApproved: user.isApproved,
            emailVerified: user.emailVerified,
          },
        });

    } catch (error) {
      if (error instanceof Error && error.message === 'BLOCKED') {
        return NextResponse.json(
          { error: 'Доступ к учётной записи временно ограничен администратором NIGHTVOLT' },
          { status: 403 }
        );
      }
      if (error instanceof Error && error.message === 'PENDING_APPROVAL') {
        return NextResponse.json(
          { error: 'PENDING_APPROVAL' },
          { status: 403 }
        );
      }
      if (error instanceof Error && error.message === 'FROZEN') {
        return NextResponse.json(
          { error: 'Ваш аккаунт заморожен администратором. Обратитесь в поддержку.' },
          { status: 403 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Ошибка авторизации' },
      { status: 500 }
    );
  }
}