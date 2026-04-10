import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { db } from '@/db';
import { releases, tracks, artists } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const releaseId = parseInt(id);

    // Получаем релиз
    const [release] = await db
      .select()
      .from(releases)
      .where(
        and(
          eq(releases.id, releaseId),
          eq(releases.artistId, session.userId)
        )
      )
      .limit(1);

    if (!release) {
      return NextResponse.json(
        { error: 'Релиз не найден' },
        { status: 404 }
      );
    }

    // Получаем треки
    const releaseTracks = await db
      .select()
      .from(tracks)
      .where(eq(tracks.releaseId, releaseId))
      .orderBy(tracks.trackNumber);

    return NextResponse.json({ release, tracks: releaseTracks });
  } catch (error) {
    console.error('Error fetching release:', error);
    return NextResponse.json(
      { error: 'Ошибка при загрузке релиза' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const releaseId = parseInt(id);

    const body = await request.json();

    // Получаем данные артиста для проверки роли
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

    // Проверяем существование релиза и права доступа
    const [existingRelease] = await db
      .select()
      .from(releases)
      .where(
        and(
          eq(releases.id, releaseId),
          eq(releases.artistId, session.userId)
        )
      )
      .limit(1);

    if (!existingRelease) {
      return NextResponse.json(
        { error: 'Релиз не найден' },
        { status: 404 }
      );
    }

    // Проверяем можно ли редактировать
    if (existingRelease.status !== 'draft' && existingRelease.status !== 'requires_changes') {
      return NextResponse.json(
        { error: 'Редактирование недоступно для релизов в этом статусе' },
        { status: 403 }
      );
    }

    // Определяем лейбл для релиза
    let releaseLabel = artist.label; // По умолчанию используем лейбл из профиля

    // Если пользователь имеет роль "label" и передал новое название лейбла
    if (artist.role === 'label' && body.label && body.label !== artist.label) {
      // Обновляем лейбл в профиле артиста
      await db
        .update(artists)
        .set({ label: body.label })
        .where(eq(artists.id, session.userId));
      
      releaseLabel = body.label;
    }

    // Обновляем релиз
    await db
      .update(releases)
      .set({
        type: body.type,
        title: body.title,
        coverUrl: body.coverUrl,
        releaseDate: body.releaseDate,
        isAsap: body.isAsap || false,
        mainArtist: body.mainArtist,
        additionalArtists: body.additionalArtists,
        genre: body.genre,
        subgenre: body.subgenre,
        promoText: body.promoText,
        useEditorialPromo: body.useEditorialPromo || false,
        artistComment: body.artistComment,
        label: releaseLabel,
        status: body.status || existingRelease.status,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(releases.id, releaseId));

    // Удаляем старые треки и создаём новые
    await db.delete(tracks).where(eq(tracks.releaseId, releaseId));

    if (body.tracks && body.tracks.length > 0) {
      const trackValues = body.tracks.map((track: any) => ({
        releaseId: releaseId,
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating release:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении релиза' },
      { status: 500 }
    );
  }
}