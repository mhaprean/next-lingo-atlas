import { notFound } from 'next/navigation';
import {
  getGroupById,
  getWordById,
  getTranslationsByWord,
} from '@/app/admin/actions';
import { TranslationsForm } from '@/app/admin/components/TranslationsForm';
import { TranslationsMapView } from '@/app/admin/components/TranslationsMapView';
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

  // Build translations and colors for the map
  const translations: Record<string, string> = {};
  const countryColors: Record<string, string> = {};
  
  existingTranslations.forEach((t) => {
    if (t.translation) {
      translations[t.countryCode] = t.translation;
    }
    if (t.color) {
      countryColors[t.countryCode] = t.color;
    }
  });

  const formTranslations = existingTranslations.map((t) => ({
    countryCode: t.countryCode,
    translation: t.translation,
    color: t.color,
    family: t.family,
    language: t.language,
    root: t.root,
  }));

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
            {word.name} - Map Overview
          </CardTitle>
          <CardDescription>
            Visual representation of translations across Europe. Click on a country to edit its translation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TranslationsMapView
            translations={translations}
            countryColors={countryColors}
            wordId={wordId}
            groupId={groupId}
            existingTranslations={formTranslations}
          />
        </CardContent>
      </Card>

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
            existingTranslations={formTranslations}
          />
        </CardContent>
      </Card>
    </div>
  );
}
