import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { db } from '@/app/db';
import { translations } from '@/app/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    // Authenticate the user
    const session = await auth.getSession();
    const user = session?.data?.user;
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the request body
    const body = await request.json();
    const { wordId, countryCode, translation, color } = body;

    // Validate required fields
    if (!wordId || !countryCode) {
      return NextResponse.json(
        { error: 'Missing required fields: wordId and countryCode' },
        { status: 400 }
      );
    }

    // Check if a translation already exists for this word and country
    const [existing] = await db
      .select()
      .from(translations)
      .where(
        and(
          eq(translations.wordId, wordId),
          eq(translations.countryCode, countryCode)
        )
      )
      .limit(1);

    if (existing) {
      // Update existing translation
      await db
        .update(translations)
        .set({
          translation: translation?.trim() || null,
          color: color?.trim() || null,
          updatedAt: new Date().toISOString(),
          updatedBy: user.id,
        })
        .where(eq(translations.id, existing.id));
    } else {
      // Insert new translation
      await db.insert(translations).values({
        wordId,
        countryCode,
        translation: translation?.trim() || null,
        color: color?.trim() || null,
        createdBy: user.id,
        updatedBy: user.id,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving translation:', error);
    return NextResponse.json(
      { error: 'Failed to save translation' },
      { status: 500 }
    );
  }
}
