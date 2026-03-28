
import { db } from './app/db';
import { translations } from './app/db/schema';
import { eq } from 'drizzle-orm';

async function checkWord(wordId: string) {
  console.log(`Checking translations for wordId: ${wordId}`);
  const result = await db.select().from(translations).where(eq(translations.wordId, wordId));
  console.log(JSON.stringify(result, null, 2));
}

const targetWordId = 'b82b0e53-e00e-44d9-af63-3ec31948c7a4';
checkWord(targetWordId).then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
