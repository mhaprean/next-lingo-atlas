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
  existingTranslations: {
    countryCode: string;
    translation: string;
    color?: string | null;
    family?: string | null;
    language?: string | null;
    root?: string | null;
  }[];
}

type FormValues = Record<
  string,
  {
    translation: string;
    color: string;
    family: string;
    root: string;
    language: string;
  }
>;

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
    defaults[code] = {
      translation: existing?.translation ?? '',
      color: existing?.color ?? '',
      family: existing?.family ?? '',
      root: existing?.root ?? '',
      language: existing?.language ?? '',
    };
  }

  const { register, handleSubmit, watch, setValue } = useForm<FormValues>({
    defaultValues: defaults,
  });

  const handleGroupUpdate = (
    countries: EuropeanCountryCode[],
    field: keyof FormValues[string],
    value: string
  ) => {
    for (const code of countries) {
      setValue(`${code}.${field}`, value);
    }
  };

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        const items = EUROPEAN_COUNTRY_CODES.map((code) => ({
          countryCode: code,
          translation: values[code].translation ?? '',
          color: values[code].color || null,
          family: values[code].family || null,
          language: values[code].language || null,
          root: values[code].root || null,
        }));
        await upsertTranslations(wordId, groupId, items);
        toast.success('Translations saved');
      } catch {
        toast.error('Failed to save translations');
      }
    });
  };

  // Group countries by their initial color for display
  const colorGroups = EUROPEAN_COUNTRY_CODES.reduce((acc, code) => {
    const color = defaults[code].color || 'none';
    if (!acc[color]) acc[color] = [];
    acc[color].push(code);
    return acc;
  }, {} as Record<string, EuropeanCountryCode[]>);

  // Sort groups: 'none' last, others by name
  const sortedColors = Object.keys(colorGroups).sort((a, b) => {
    if (a === 'none') return 1;
    if (b === 'none') return -1;
    return a.localeCompare(b);
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
      {sortedColors.map((color) => (
        <div key={color} className="space-y-6">
          <div className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-center gap-3">
              <div
                className="h-5 w-5 rounded-full border shadow-sm"
                style={{ backgroundColor: color === 'none' ? 'transparent' : color }}
              />
              <h3 className="text-base font-bold uppercase tracking-tight text-foreground/80">
                {color === 'none' ? 'General / Ungrouped' : `Group: ${color}`}
              </h3>
            </div>

            {color !== 'none' && (
              <div className="flex flex-wrap items-end gap-3 rounded-xl bg-muted/50 p-3 ring-1 ring-border">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground/70">
                    Group Color
                  </Label>
                  <Input
                    className="h-8 w-24 font-mono text-xs"
                    defaultValue={color}
                    onChange={(e) =>
                      handleGroupUpdate(colorGroups[color], 'color', e.target.value)
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground/70">
                    Group Family
                  </Label>
                  <Input
                    className="h-8 w-32 text-xs"
                    placeholder="Set family for all..."
                    onChange={(e) =>
                      handleGroupUpdate(colorGroups[color], 'family', e.target.value)
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground/70">
                    Group Root
                  </Label>
                  <Input
                    className="h-8 w-32 text-xs"
                    placeholder="Set root for all..."
                    onChange={(e) =>
                      handleGroupUpdate(colorGroups[color], 'root', e.target.value)
                    }
                  />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-x-8 gap-y-8 lg:grid-cols-2 xl:grid-cols-3">
            {colorGroups[color].map((code) => (
              <div
                key={code}
                className="flex flex-col gap-3 rounded-lg border p-4 shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex items-center justify-between border-b pb-2">
                  <Label
                    htmlFor={`translation-${code}`}
                    className="font-semibold"
                  >
                    {COUNTRY_LABELS[code]}
                  </Label>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {code}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 space-y-1.5">
                    <Label className="text-[10px] uppercase text-muted-foreground">
                      Translation
                    </Label>
                    <Input
                      id={`translation-${code}`}
                      placeholder="Translation"
                      {...register(`${code}.translation`)}
                      className="h-9 text-sm font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase text-muted-foreground">
                      Language
                    </Label>
                    <Input
                      placeholder="e.g. German"
                      {...register(`${code}.language`)}
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase text-muted-foreground">
                      Color
                    </Label>
                    <div className="flex gap-1.5">
                      <div
                        className="h-8 w-8 shrink-0 rounded border"
                        style={{
                          backgroundColor:
                            watch(`${code}.color`) || 'transparent',
                        }}
                      />
                      <Input
                        placeholder="#hex"
                        {...register(`${code}.color`)}
                        className="h-8 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase text-muted-foreground">
                      Family
                    </Label>
                    <Input
                      placeholder="Family"
                      {...register(`${code}.family`)}
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase text-muted-foreground">
                      Root Pattern
                    </Label>
                    <Input
                      placeholder="Root"
                      {...register(`${code}.root`)}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex justify-end border-t pt-4">
        <Button type="submit" disabled={isPending} size="lg">
          <Save data-icon="inline-start" />
          {isPending ? 'Saving…' : 'Save All Translations'}
        </Button>
      </div>
    </form>
  );
}
