'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';

interface Translation {
  countryCode: string;
  translation: string;
  color: string | null;
  family: string;
  language: string;
  root: string;
}

interface CountryTranslationFormProps {
  wordId: string;
  groupId: string;
  countryCode: string;
  translation: Translation;
  onSuccess: () => void;
}

export function CountryTranslationForm({
  wordId,
  groupId,
  countryCode,
  translation,
  onSuccess,
}: CountryTranslationFormProps) {
  const [formData, setFormData] = useState({
    translation: translation.translation || '',
    color: translation.color || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/translations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wordId,
          countryCode,
          translation: formData.translation,
          color: formData.color,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save translation');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="language">Language</Label>
        <div className="text-sm text-muted-foreground font-medium">
          {translation.language}
        </div>
      </div>

      {translation.family && (
        <div className="space-y-2">
          <Label htmlFor="family">Language Family</Label>
          <div className="text-sm text-muted-foreground font-medium">
            {translation.family}
          </div>
        </div>
      )}

      {translation.root && (
        <div className="space-y-2">
          <Label htmlFor="root">Root/Etymology</Label>
          <div className="text-sm text-muted-foreground font-medium break-words">
            {translation.root}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="translation">Translation</Label>
        <Textarea
          id="translation"
          name="translation"
          value={formData.translation}
          onChange={handleChange}
          placeholder="Enter the translation for this country..."
          className="min-h-24 resize-none"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="color">Background Color (Hex)</Label>
        <div className="flex gap-2">
          <Input
            id="color"
            name="color"
            type="text"
            value={formData.color}
            onChange={handleChange}
            placeholder="#000000"
            className="flex-1"
          />
          {formData.color && (
            <div
              className="w-10 h-10 rounded border"
              style={{ backgroundColor: formData.color }}
            />
          )}
        </div>
      </div>

      {error && <div className="text-sm text-destructive">{error}</div>}

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </form>
  );
}
