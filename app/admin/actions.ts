'use server';

import { auth } from '@/lib/auth/server';
import { db } from '@/app/db';
import { groups, words, translations, userInNeonAuth } from '@/app/db/schema';
import { eq, desc, and, count, sql, aliasedTable } from 'drizzle-orm';
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

  const creatorUser = aliasedTable(userInNeonAuth, 'creator');
  const updaterUser = aliasedTable(userInNeonAuth, 'updater');

  const result = await db
    .select({
      id: groups.id,
      name: groups.name,
      slug: groups.slug,
      description: groups.description,
      createdBy: groups.createdBy,
      updatedBy: groups.updatedBy,
      createdAt: groups.createdAt,
      updatedAt: groups.updatedAt,
      wordCount: count(words.id),
      createdByName: creatorUser.name,
      updatedByName: updaterUser.name,
    })
    .from(groups)
    .leftJoin(words, eq(groups.id, words.groupId))
    .leftJoin(creatorUser, eq(groups.createdBy, creatorUser.id))
    .leftJoin(updaterUser, eq(groups.updatedBy, updaterUser.id))
    .groupBy(groups.id, creatorUser.name, updaterUser.name)
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
  const user = await getAuthUser();

  await db.insert(groups).values({
    name: data.name,
    slug: data.slug,
    description: data.description || null,
    createdBy: user.id,
    updatedBy: user.id,
  });

  revalidatePath('/admin');
}

export async function updateGroup(groupId: string, data: { name: string; slug: string; description?: string }) {
  const user = await getAuthUser();

  await db
    .update(groups)
    .set({
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      updatedAt: new Date().toISOString(),
      updatedBy: user.id,
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

  const creatorUser = aliasedTable(userInNeonAuth, 'creator');
  const updaterUser = aliasedTable(userInNeonAuth, 'updater');

  const result = await db
    .select({
      id: words.id,
      groupId: words.groupId,
      name: words.name,
      createdAt: words.createdAt,
      createdBy: words.createdBy,
      updatedBy: words.updatedBy,
      updatedAt: words.updatedAt,
      translationCount: count(translations.id),
      createdByName: creatorUser.name,
      updatedByName: updaterUser.name,
    })
    .from(words)
    .leftJoin(translations, eq(words.id, translations.wordId))
    .leftJoin(creatorUser, eq(words.createdBy, creatorUser.id))
    .leftJoin(updaterUser, eq(words.updatedBy, updaterUser.id))
    .where(eq(words.groupId, groupId))
    .groupBy(words.id, creatorUser.name, updaterUser.name)
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
  const user = await getAuthUser();

  const [newWord] = await db.insert(words).values({
    groupId: data.groupId,
    name: data.name,
    createdBy: user.id,
    updatedBy: user.id,
  }).returning();

  revalidatePath(`/admin/groups/${data.groupId}`);
  return newWord;
}

export async function updateWord(wordId: string, data: { name: string; groupId: string }) {
  const user = await getAuthUser();

  await db
    .update(words)
    .set({
      name: data.name,
      updatedAt: new Date().toISOString(),
      updatedBy: user.id,
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
  items: {
    countryCode: string;
    translation: string;
    color?: string | null;
    family?: string | null;
    language?: string | null;
    root?: string | null;
  }[]
) {
  const user = await getAuthUser();

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
        color: t.color || null,
        family: t.family || null,
        language: t.language || null,
        root: t.root || null,
        createdBy: user.id,
        updatedBy: user.id,
      }))
    );
  } else {
    // If all empty, just clear all translations
    await db.delete(translations).where(eq(translations.wordId, wordId));
  }

  revalidatePath(`/admin/groups/${groupId}/words/${wordId}`);
  revalidatePath(`/admin/groups/${groupId}`);
}

// --------------- Bulk Import ---------------

interface BulkWordEntry {
  word: string;
  groups: {
    family?: string | null;
    root?: string | null;
    color?: string | null;
    entries: {
      country: string;
      language?: string | null;
      translation: string;
    }[];
  }[];
}

export async function bulkImportWords(
  groupId: string,
  entries: BulkWordEntry[]
) {
  const user = await getAuthUser();

  let wordsCreated = 0;
  let wordsUpdated = 0;
  let translationsCreated = 0;

  for (const entry of entries) {
    if (!entry.word?.trim()) continue;

    const wordName = entry.word.trim();

    // Find existing word or create a new one
    let wordId: string;

    const [existing] = await db
      .select({ id: words.id })
      .from(words)
      .where(and(eq(words.groupId, groupId), eq(words.name, wordName)))
      .limit(1);

    if (existing) {
      wordId = existing.id;
      wordsUpdated++;
    } else {
      const [newWord] = await db
        .insert(words)
        .values({
          groupId,
          name: wordName,
          createdBy: user.id,
          updatedBy: user.id,
        })
        .returning();
      wordId = newWord.id;
      wordsCreated++;
    }

    // Build translation entries from all groups
    const translationEntriesMap = new Map<string, typeof translations.$inferInsert>();

    for (const group of entry.groups || []) {
      for (const trans of group.entries || []) {
        if (!trans.translation?.trim()) continue;

        const countryCode = trans.country.trim();
        // Use Map to deduplicate by country code (last one wins)
        translationEntriesMap.set(countryCode, {
          wordId,
          countryCode,
          translation: trans.translation.trim(),
          language: trans.language?.trim() || null,
          color: group.color?.trim() || null,
          family: group.family?.trim() || null,
          root: group.root?.trim() || null,
          createdBy: user.id,
          updatedBy: user.id,
        });
      }
    }

    const translationEntries = Array.from(translationEntriesMap.values());

    if (translationEntries.length > 0) {
      // Delete existing translations for this word, then re-insert
      await db.delete(translations).where(eq(translations.wordId, wordId));

      await db.insert(translations).values(translationEntries);
      translationsCreated += translationEntries.length;
    }
  }

  revalidatePath(`/admin/groups/${groupId}`);
  revalidatePath('/admin');

  return { wordsCreated, wordsUpdated, translationsCreated };
}
