"use client";

import { useState } from "react";
import EuropeMap from "@/components/EuropeMap";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { EUROPE_COUNTRIES } from "@/data/europeCountries";
import { CountryTranslationForm } from "./CountryTranslationForm";

interface Translation {
  countryCode: string;
  translation: string;
  color: string | null;
  family: string | null;
  language: string | null;
  root: string | null;
}

interface TranslationsMapViewProps {
  translations: Record<string, string>;
  countryColors: Record<string, string>;
  wordId: string;
  groupId: string;
  existingTranslations: Translation[];
  onTranslationUpdate?: () => void;
}

export function TranslationsMapView({
  translations,
  countryColors,
  wordId,
  groupId,
  existingTranslations,
  onTranslationUpdate,
}: TranslationsMapViewProps) {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const handleSelectCountry = (code: string | null) => {
    setSelectedCountry(code);
  };

  const selectedTranslation = selectedCountry
    ? existingTranslations.find((t) => t.countryCode === selectedCountry) || {
        countryCode: selectedCountry,
        translation: "",
        color: "",
        family: "",
        language: "",
        root: "",
      }
    : null;

  const selectedCountryName = selectedCountry
    ? EUROPE_COUNTRIES[selectedCountry]
    : null;

  return (
    <>
      <div className="w-full h-[550px] rounded-lg border">
        <EuropeMap
          translations={translations}
          countryColors={countryColors}
          fontSize={14}
          textColor="hsl(var(--foreground))"
          selectedCountry={selectedCountry}
          onSelectCountry={handleSelectCountry}
        />
      </div>

      <Sheet
        open={!!selectedCountry}
        onOpenChange={(open) => !open && setSelectedCountry(null)}
      >
        <SheetContent side="right" className="w-full sm:w-96">
          <SheetHeader>
            <SheetTitle className="text-lg">
              {selectedCountryName
                ? `Edit: ${selectedCountryName}`
                : "Country Translation"}
            </SheetTitle>
          </SheetHeader>
          {selectedCountry && (
            <div className="mt-6 p-4">
              <CountryTranslationForm
                wordId={wordId}
                groupId={groupId}
                countryCode={selectedCountry}
                translation={{
                  countryCode: selectedCountry,
                  translation: selectedTranslation?.translation || "",
                  color: selectedTranslation?.color || "",
                  family: selectedTranslation?.family || "",
                  language: selectedTranslation?.language || "",
                  root: selectedTranslation?.root || "",
                }}
                onSuccess={() => {
                  setSelectedCountry(null);
                  onTranslationUpdate?.();
                }}
              />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
