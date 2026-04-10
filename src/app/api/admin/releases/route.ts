import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { db } from '@/db';
import { releases, artists } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Authentication check - используем bearer token
    const session = await getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        { error: 'Требуется авторизация', code: 'AUTHENTICATION_REQUIRED' },
        { status: 401 }
      );
    }

    if (!session.isAdmin) {
      return NextResponse.json(
        { error: 'Требуются права администратора', code: 'ADMIN_ACCESS_REQUIRED' },
        { status: 403 }
      );
    }

    // Получаем все релизы с информацией об артистах
    const allReleases = await db
      .select({
        id: releases.id,
        type: releases.type,
        title: releases.title,
        coverUrl: releases.coverUrl,
        releaseDate: releases.releaseDate,
        isAsap: releases.isAsap,
        mainArtist: releases.mainArtist,
        status: releases.status,
        upc: releases.upc,
        artistComment: releases.artistComment,
        moderatorComment: releases.moderatorComment,
        createdAt: releases.createdAt,
        artistId: releases.artistId,
        artistName: artists.name,
        label: releases.label,
        genre: releases.genre,
      })
      .from(releases)
      .leftJoin(artists, eq(releases.artistId, artists.id))
      .orderBy(desc(releases.createdAt));

    return NextResponse.json({ releases: allReleases });
  } catch (error) {
    console.error('Error fetching releases:', error);
    return NextResponse.json(
      { error: 'Ошибка при загрузке релизов: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка') },
      { status: 500 }
    );
  }
}