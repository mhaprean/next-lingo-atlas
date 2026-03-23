'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';
import { EUROPEAN_COUNTRY_CODES, type EuropeanCountryCode } from '@/app/db/schema';
import { upsertTranslations } from '@/app/admin/actions';
import { toast } from 'sonner';

/** Readable country labels for each code */
const COUNTRY_LABELS: Record<EuropeanCountryCode, string> = {
  GB: '🇬🇧 United Kingdom',
  ES: '🇪🇸 Spain',
  RO: '🇷🇴 Romania',
  FR: '🇫🇷 France',
  DE: '🇩🇪 Germany',
  IT: '🇮🇹 Italy',
  PT: '🇵🇹 Portugal',
  NL: '🇳🇱 Netherlands',
  PL: '🇵🇱 Poland',
  SE: '🇸🇪 Sweden',
  NO: '🇳🇴 Norway',
  DK: '🇩🇰 Denmark',
  FI: '🇫🇮 Finland',
  CZ: '🇨🇿 Czechia',
  SK: '🇸🇰 Slovakia',
  HU: '🇭🇺 Hungary',
  HR: '🇭🇷 Croatia',
  BG: '🇧🇬 Bulgaria',
  GR: '🇬🇷 Greece',
  TR: '🇹🇷 Turkey',
  UA: '🇺🇦 Ukraine',
  RU: '🇷🇺 Russia',
  RS: '🇷🇸 Serbia',
  IE: '🇮🇪 Ireland',
  IS: '🇮🇸 Iceland',
  AL: '🇦🇱 Albania',
  LT: '🇱🇹 Lithuania',
  LV: '🇱🇻 Latvia',
  EE: '🇪🇪 Estonia',
  SI: '🇸🇮 Slovenia',
  BA: '🇧🇦 Bosnia',
  ME: '🇲🇪 Montenegro',
  MK: '🇲🇰 N. Macedonia',
  BY: '🇧🇾 Belarus',
  MD: '🇲🇩 Moldova',
  AT: '🇦🇹 Austria',
  BE: '🇧🇪 Belgium',
  CH: '🇨🇭 Switzerland',
  LU: '🇱🇺 Luxembourg',
  GE: '🇬🇪 Georgia',
};

interface TranslationsFormProps {
  wordId: string;
  groupId: string;
  existingTranslations: { countryCode: string; translation: string }[];
}

type FormValues = Record<string, string>;

export function TranslationsForm({
  wordId,
  groupId,
  existingTranslations,
}: TranslationsFormProps) {
  const [isPending, startTransition] = useTransition();

  // Build default values from existing translations
  const defaults: FormValues = {};
  for (const code of EUROPEAN_COUNTRY_CODES) {
    const existing = existingTranslations.find((t) => t.countryCode === code);
    defaults[code] = existing?.translation ?? '';
  }

  const { register, handleSubmit } = useForm<FormValues>({
    defaultValues: defaults,
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        const items = EUROPEAN_COUNTRY_CODES.map((code) => ({
          countryCode: code,
          translation: values[code] ?? '',
        }));
        await upsertTranslations(wordId, groupId, items);
        toast.success('Translations saved');
      } catch {
        toast.error('Failed to save translations');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
        {EUROPEAN_COUNTRY_CODES.map((code) => (
          <div key={code} className="flex items-center gap-2">
            <Label
              htmlFor={`translation-${code}`}
              className="w-40 shrink-0 text-xs"
            >
              {COUNTRY_LABELS[code]}
            </Label>
            <Input
              id={`translation-${code}`}
              placeholder={code}
              {...register(code)}
              className="h-8 text-sm"
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end border-t pt-4">
        <Button type="submit" disabled={isPending} size="lg">
          <Save data-icon="inline-start" />
          {isPending ? 'Saving…' : 'Save All Translations'}
        </Button>
      </div>
    </form>
  );
}
