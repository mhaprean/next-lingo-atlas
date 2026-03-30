'use server';

import { auth } from '@/lib/auth/server';
import { db } from '@/app/db';
import { todos } from '@/app/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { groups, words, translations } from '@/app/db/schema';

async function getAuthUser() {
    const session = await auth.getSession();
    const user = session?.data?.user;

    if (!user) redirect('/auth/sign-in');

    return user;
}

export async function getTodos() {
    const user = await getAuthUser();
    return db.select().from(todos).where(eq(todos.userId, user.id)).orderBy(desc(todos.createdAt));
}

export async function addTodo(formData: FormData) {
    const user = await getAuthUser();
    const text = formData.get('text') as string;
    if (!text) return;

    await db.insert(todos).values({ text, userId: user.id });

    revalidatePath('/');
}

export async function toggleTodo(id: number, currentStatus: boolean) {
    const user = await getAuthUser();

    await db
        .update(todos)
        .set({ completed: !currentStatus })
        .where(and(eq(todos.id, id), eq(todos.userId, user.id)));

    revalidatePath('/');
}

export async function deleteTodo(id: number) {
    const user = await getAuthUser();

    await db.delete(todos).where(and(eq(todos.id, id), eq(todos.userId, user.id)));

    revalidatePath('/');
}

// Public action to fetch all words with translations for the map
export async function getAllWordsForMap() {
    const result = await db
        .select({
            wordId: words.id,
            wordName: words.name,
            groupId: groups.id,
            groupName: groups.name,
            countryCode: translations.countryCode,
            translation: translations.translation,
            color: translations.color,
            family: translations.family,
        })
        .from(words)
        .innerJoin(groups, eq(words.groupId, groups.id))
        .innerJoin(translations, eq(words.id, translations.wordId))
        .orderBy(words.name, translations.countryCode);

    // Group by word
    const wordsMap = new Map<string, {
        name: string;
        groups: {
            family: string;
            color: string;
            entries: { country: string; translation: string }[];
        }[];
    }>();

    for (const row of result) {
        const wordId = row.wordId;
        if (!wordsMap.has(wordId)) {
            wordsMap.set(wordId, {
                name: row.wordName,
                groups: [],
            });
        }
        const word = wordsMap.get(wordId)!;

        // Find or create group
        const family = row.family || 'default';
        const color = row.color || '#3b82f6'; // default blue
        let group = word.groups.find(g => g.family === family && g.color === color);
        if (!group) {
            group = { family, color, entries: [] };
            word.groups.push(group);
        }
        group.entries.push({
            country: row.countryCode,
            translation: row.translation,
        });
    }

    return Array.from(wordsMap.values());
}