'use client';

import { useRouter } from 'next/navigation';
import { TranslationsMapView } from './TranslationsMapView';

interface Translation {
  countryCode: string;
  translation: string;
  color: string | null;
  family: string | null;
  language: string | null;
  root: string | null;
}

interface TranslationsMapWrapperProps {
  translations: Record<string, string>;
  countryColors: Record<string, string>;
  wordId: string;
  groupId: string;
  existingTranslations: Translation[];
}

export function TranslationsMapWrapper({
  translations,
  countryColors,
  wordId,
  groupId,
  existingTranslations,
}: TranslationsMapWrapperProps) {
  const router = useRouter();

  const handleTranslationUpdate = () => {
    router.refresh();
  };

  return (
    <TranslationsMapView
      translations={translations}
      countryColors={countryColors}
      wordId={wordId}
      groupId={groupId}
      existingTranslations={existingTranslations}
      onTranslationUpdate={handleTranslationUpdate}
    />
  );
}
