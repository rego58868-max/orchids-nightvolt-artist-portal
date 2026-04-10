import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/db';
import { releases, tracks, artists } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();

    // Получаем данные артиста для проверки роли и текущего лейбла
    const [artist] = await db
      .select()
      .from(artists)
      .where(eq(artists.id, session.userId))
      .limit(1);

    if (!artist) {
      return NextResponse.json(
        { error: 'Artist not found' },
        { status: 404 }
      );
    }

    // Определяем лейбл для релиза
    let releaseLabel = artist.label; // По умолчанию используем лейбл из профиля

    // Если пользователь имеет роль "label" и передал новое название лейбла
    if (artist.role === 'label' && data.label && data.label !== artist.label) {
      // Обновляем лейбл в профиле артиста
      await db
        .update(artists)
        .set({ label: data.label })
        .where(eq(artists.id, session.userId));
      
      releaseLabel = data.label;
    }

    // Создаём релиз
    const [release] = await db.insert(releases).values({
      artistId: session.userId,
      type: data.type,
      title: data.title,
      coverUrl: data.coverUrl,
      releaseDate: data.releaseDate,
      isAsap: data.isAsap || false,
      mainArtist: data.mainArtist,
      additionalArtists: data.additionalArtists,
      genre: data.genre,
      subgenre: data.subgenre,
      promoText: data.promoText,
      useEditorialPromo: data.useEditorialPromo || false,
      label: releaseLabel,
      artistComment: data.artistComment,
      moderatorComment: null,
      status: data.status || 'draft',
      upc: null,
      platforms: data.platforms ? JSON.stringify(data.platforms) : null,
      territories: data.territories ? JSON.stringify(data.territories) : null,
      persons: data.persons ? JSON.stringify(data.persons) : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).returning();

    // Создаём треки
    if (data.tracks && data.tracks.length > 0) {
      const trackValues = data.tracks.map((track: any) => ({
        releaseId: release.id,
        trackNumber: track.trackNumber,
        title: track.title,
        url: track.url,
        artists: track.artists || '',
        musicAuthor: track.musicAuthor,
        lyricsAuthor: track.lyricsAuthor,
        producer: track.producer,
        lyrics: track.lyrics,
        createdAt: new Date().toISOString(),
      }));

      await db.insert(tracks).values(trackValues);
    }

    return NextResponse.json({ success: true, releaseId: release.id });
  } catch (error) {
    console.error('Error creating release:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании релиза' },
      { status: 500 }
    );
  }
}