import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { artists } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, artistNameOrLabel } = await request.json();

    if (!email || !password || !firstName || !lastName || !artistNameOrLabel) {
      return NextResponse.json(
        { error: 'Все поля обязательны' },
        { status: 400 }
      );
    }

    // Check if user already exists
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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in Turso
    const uid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    await db.insert(artists).values({
      uid,
      email,
      password: hashedPassword,
      name: `${firstName} ${lastName}`,
      surname: lastName,
      artistName: artistNameOrLabel,
        plan: 'none',
        emailVerified: true, // Mark as verified to bypass code check
        isApproved: false,   // But keep as not approved for manual moderation
        requiresApproval: true, // New field to distinguish self-registration
        accessRequestMessage: 'Автоматическая заявка при регистрации',

      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Регистрация прошла успешно. Ваша заявка находится на рассмотрении модератором.',
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Ошибка при регистрации' },
      { status: 500 }
    );
  }
}
