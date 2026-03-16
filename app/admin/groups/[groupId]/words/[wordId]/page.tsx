import { notFound } from 'next/navigation';
import {
  getGroupById,
  getWordById,
  getTranslationsByWord,
} from '@/app/admin/actions';
import { TranslationsForm } from '@/app/admin/components/TranslationsForm';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface TranslationsPageProps {
  params: Promise<{ groupId: string; wordId: string }>;
}

export default async function TranslationsPage({ params }: TranslationsPageProps) {
  const { groupId, wordId } = await params;

  const [group, word, existingTranslations] = await Promise.all([
    getGroupById(groupId),
    getWordById(wordId),
    getTranslationsByWord(wordId),
  ]);

  if (!group || !word) notFound();

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/admin/groups/${groupId}`}>
              {group.name}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{word.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            Translations for &ldquo;{word.name}&rdquo;
          </CardTitle>
          <CardDescription>
            Fill in the translation for each European language. Empty fields will
            not be saved.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TranslationsForm
            wordId={wordId}
            groupId={groupId}
            existingTranslations={existingTranslations.map((t) => ({
              countryCode: t.countryCode,
              translation: t.translation,
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
