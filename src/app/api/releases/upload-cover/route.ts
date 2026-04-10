import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const maxDuration = 120;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Расширенная валидация типов файлов
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const fileType = file.type.toLowerCase();
    
    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json(
        { error: 'Неверный формат файла. Допустимые форматы: JPEG, PNG, WebP' },
        { status: 400 }
      );
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Размер файла превышает лимит 50 МБ' },
        { status: 400 }
      );
    }

    // Очищаем имя файла и определяем расширение
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const ext = originalName.split('.').pop()?.toLowerCase() || 'jpg';
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileName = `${session.userId}/${timestamp}-${randomString}.${ext}`;

    // Читаем файл как ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log(`Uploading cover: ${fileName}, size: ${file.size}, type: ${file.type}`);

    // Загружаем в Supabase Storage
    const { data, error } = await supabase.storage
      .from('release-covers')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
        cacheControl: '3600',
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return NextResponse.json(
        { 
          success: false,
          error: 'Ошибка при загрузке обложки: ' + error.message 
        },
        { status: 500 }
      );
    }

    // Получаем публичный URL
    const { data: urlData } = supabase.storage
      .from('release-covers')
      .getPublicUrl(fileName);

    console.log(`Cover uploaded successfully: ${urlData.publicUrl}`);

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      fileName: originalName,
      size: file.size,
    });
  } catch (error: any) {
    console.error('Upload cover error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Внутренняя ошибка сервера: ' + (error?.message || 'Unknown error')
      },
      { status: 500 }
    );
  }
}
