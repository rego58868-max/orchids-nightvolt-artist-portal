import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { releases, artists, tracks } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication check
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { 
          error: 'Требуется авторизация',
          code: 'AUTH_REQUIRED' 
        },
        { status: 401 }
      );
    }

    // Admin privilege check
    if (!session.isAdmin) {
      return NextResponse.json(
        { 
          error: 'Требуются права администратора',
          code: 'ADMIN_REQUIRED' 
        },
        { status: 403 }
      );
    }

    // Validate release ID
    const releaseId = parseInt(params.id);
    if (!releaseId || isNaN(releaseId)) {
      return NextResponse.json(
        { 
          error: 'Некорректный ID релиза',
          code: 'INVALID_ID' 
        },
        { status: 400 }
      );
    }

    // Fetch release with artist info - используем правильные имена полей из схемы
    const releaseRecords = await db.select({
      id: releases.id,
      type: releases.type,
      title: releases.title,
      coverUrl: releases.coverUrl,
      releaseDate: releases.releaseDate,
      isAsap: releases.isAsap,
      mainArtist: releases.mainArtist,
      additionalArtists: releases.additionalArtists,
      genre: releases.genre,
      subgenre: releases.subgenre,
      label: releases.label,
      promoText: releases.promoText,
      useEditorialPromo: releases.useEditorialPromo,
      status: releases.status,
      upc: releases.upc,
      artistComment: releases.artistComment,
      moderatorComment: releases.moderatorComment,
      createdAt: releases.createdAt,
      updatedAt: releases.updatedAt,
      platforms: releases.platforms,
      territories: releases.territories,
      persons: releases.persons,
      artistId: releases.artistId,
      artistName: artists.name,
      artistEmail: artists.email,
      artistLabel: artists.label,
      artistPlan: artists.plan,
    })
      .from(releases)
      .leftJoin(artists, eq(releases.artistId, artists.id))
      .where(eq(releases.id, releaseId))
      .limit(1);

    if (releaseRecords.length === 0) {
      return NextResponse.json(
        { 
          error: 'Релиз не найден',
          code: 'RELEASE_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    const release = releaseRecords[0];

    // Получаем треки отдельным запросом
    const releaseTracks = await db
      .select()
      .from(tracks)
      .where(eq(tracks.releaseId, releaseId))
      .orderBy(tracks.trackNumber);

    // Преобразуем данные в правильный формат для фронтенда
    const formattedRelease = {
      ...release,
      featuredArtists: release.additionalArtists || '',
      promoInfo: release.promoText || '',
      promoByNightvolt: release.useEditorialPromo || false,
      platformsList: release.platforms ? JSON.parse(release.platforms) : null,
      territoriesList: release.territories ? JSON.parse(release.territories) : null,
      personsList: release.persons ? JSON.parse(release.persons) : null,
      tracks: releaseTracks.map(track => ({
        id: track.id.toString(),
        title: track.title,
        url: track.url || '',
        performers: track.artists,
        musicAuthor: track.musicAuthor || '',
        lyricsAuthor: track.lyricsAuthor || '',
        producer: track.producer || '',
        lyrics: track.lyrics || '',
        isrc: '',
        language: (track as any).language || '',
        explicit: !!(track as any).explicit,
        composer: (track as any).composer || '',
      })),
      editableFields: [], // Это поле больше не используется
    };

    // Return comprehensive response
    return NextResponse.json({
      release: formattedRelease
    }, { status: 200 });

  } catch (error) {
    console.error('GET release details error:', error);
    return NextResponse.json(
      { 
        error: 'Внутренняя ошибка сервера: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка'),
        code: 'INTERNAL_ERROR' 
      },
      { status: 500 }
    );
  }
}