'use server';

import { auth } from '@/lib/auth/server';
import { db } from '@/app/db';
import { groups, words, translations } from '@/app/db/schema';
import { eq, desc, and, count, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// --------------- Auth helper ---------------

async function getAuthUser() {
  const session = await auth.getSession();
  const user = session?.data?.user;
  if (!user) redirect('/auth/sign-in');
  return user;
}

// --------------- Groups ---------------

export async function getGroups() {
  await getAuthUser();

  const result = await db
    .select({
      id: groups.id,
      name: groups.name,
      slug: groups.slug,
      description: groups.description,
      createdAt: groups.createdAt,
      updatedAt: groups.updatedAt,
      wordCount: count(words.id),
    })
    .from(groups)
    .leftJoin(words, eq(groups.id, words.groupId))
    .groupBy(groups.id)
    .orderBy(desc(groups.createdAt));

  return result;
}

export async function getGroupById(groupId: string) {
  await getAuthUser();

  const [group] = await db
    .select()
    .from(groups)
    .where(eq(groups.id, groupId))
    .limit(1);

  return group ?? null;
}

export async function createGroup(data: { name: string; slug: string; description?: string }) {
  await getAuthUser();

  await db.insert(groups).values({
    name: data.name,
    slug: data.slug,
    description: data.description || null,
  });

  revalidatePath('/admin');
}

export async function updateGroup(groupId: string, data: { name: string; slug: string; description?: string }) {
  await getAuthUser();

  await db
    .update(groups)
    .set({
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(groups.id, groupId));

  revalidatePath('/admin');
}

export async function deleteGroup(groupId: string) {
  await getAuthUser();

  await db.delete(groups).where(eq(groups.id, groupId));

  revalidatePath('/admin');
}

// --------------- Words ---------------

export async function getWordsByGroup(groupId: string) {
  await getAuthUser();

  const result = await db
    .select({
      id: words.id,
      groupId: words.groupId,
      name: words.name,
      createdAt: words.createdAt,
      updatedAt: words.updatedAt,
      translationCount: count(translations.id),
    })
    .from(words)
    .leftJoin(translations, eq(words.id, translations.wordId))
    .where(eq(words.groupId, groupId))
    .groupBy(words.id)
    .orderBy(desc(words.createdAt));

  return result;
}

export async function getWordById(wordId: string) {
  await getAuthUser();

  const [word] = await db
    .select()
    .from(words)
    .where(eq(words.id, wordId))
    .limit(1);

  return word ?? null;
}

export async function createWord(data: { groupId: string; name: string }) {
  await getAuthUser();

  const [newWord] = await db.insert(words).values({
    groupId: data.groupId,
    name: data.name,
  }).returning();

  revalidatePath(`/admin/groups/${data.groupId}`);
  return newWord;
}

export async function updateWord(wordId: string, data: { name: string; groupId: string }) {
  await getAuthUser();

  await db
    .update(words)
    .set({
      name: data.name,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(words.id, wordId));

  revalidatePath(`/admin/groups/${data.groupId}`);
}

export async function deleteWord(wordId: string, groupId: string) {
  await getAuthUser();

  await db.delete(words).where(eq(words.id, wordId));

  revalidatePath(`/admin/groups/${groupId}`);
}

// --------------- Translations ---------------

export async function getTranslationsByWord(wordId: string) {
  await getAuthUser();

  return db
    .select()
    .from(translations)
    .where(eq(translations.wordId, wordId))
    .orderBy(translations.countryCode);
}

export async function upsertTranslations(
  wordId: string,
  groupId: string,
  items: { countryCode: string; translation: string }[]
) {
  await getAuthUser();

  // Filter out empty translations
  const nonEmpty = items.filter((t) => t.translation.trim() !== '');

  if (nonEmpty.length > 0) {
    // Delete existing translations for this word and re-insert
    await db.delete(translations).where(eq(translations.wordId, wordId));

    await db.insert(translations).values(
      nonEmpty.map((t) => ({
        wordId,
        countryCode: t.countryCode,
        translation: t.translation.trim(),
      }))
    );
  } else {
    // If all empty, just clear all translations
    await db.delete(translations).where(eq(translations.wordId, wordId));
  }

  revalidatePath(`/admin/groups/${groupId}/words/${wordId}`);
  revalidatePath(`/admin/groups/${groupId}`);
}
