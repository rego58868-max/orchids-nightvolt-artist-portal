import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { artists } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, artistName, socialNetwork, howDidYouHear } = await request.json();

    if (!email || !password || !firstName || !artistName || !socialNetwork) {
      return NextResponse.json(
        { error: 'Заполните все обязательные поля' },
        { status: 400 }
      );
    }

    const [existingUser] = await db
      .select()
      .from(artists)
      .where(eq(artists.email, email))
      .limit(1);

    if (existingUser) {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const uid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    await db.insert(artists).values({
      uid,
      email,
      password: hashedPassword,
      name: firstName,
      surname: lastName || '',
      artistName,
      plan: 'none',
      emailVerified: true,
      isApproved: false,
      requiresApproval: true,
      accessRequestMessage: null,
      socialNetwork: socialNetwork || null,
      howDidYouHear: howDidYouHear || null,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Заявка отправлена. С вами свяжется менеджер для уточнения деталей.',
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Ошибка при регистрации' },
      { status: 500 }
    );
  }
}
