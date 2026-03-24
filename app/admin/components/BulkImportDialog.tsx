'use client';

import { useState, useTransition } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { bulkImportWords } from '@/app/admin/actions';
import { toast } from 'sonner';

const EXAMPLE_JSON = `[
  {
    "name": "dog",
    "translations": {
      "GB": "dog",
      "ES": "perro",
      "RO": "câine",
      "FR": "chien",
      "DE": "Hund"
    }
  },
  {
    "name": "cat",
    "translations": {
      "GB": "cat",
      "ES": "gato",
      "RO": "pisică",
      "FR": "chat",
      "DE": "Katze"
    }
  }
]`;

interface BulkImportDialogProps {
  groupId: string;
}

export function BulkImportDialog({ groupId }: BulkImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleImport = () => {
    setError(null);

    // Try to parse
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      setError('Invalid JSON. Please check your syntax and try again.');
      return;
    }

    // Normalize: accept either an array directly or { words: [...] }
    let entries: { name: string; translations: Record<string, string> }[];

    if (Array.isArray(parsed)) {
      entries = parsed;
    } else if (
      parsed &&
      typeof parsed === 'object' &&
      'words' in parsed &&
      Array.isArray((parsed as { words: unknown }).words)
    ) {
      entries = (parsed as { words: typeof entries }).words;
    } else {
      setError(
        'Expected a JSON array of words, or an object with a "words" array.'
      );
      return;
    }

    // Validate entries
    const valid = entries.filter(
      (e) =>
        e &&
        typeof e === 'object' &&
        typeof e.name === 'string' &&
        e.name.trim() !== ''
    );

    if (valid.length === 0) {
      setError('No valid word entries found. Each entry needs at least a "name" field.');
      return;
    }

    startTransition(async () => {
      try {
        const result = await bulkImportWords(groupId, valid);
        const parts = [];
        if (result.wordsCreated > 0) parts.push(`${result.wordsCreated} created`);
        if (result.wordsUpdated > 0) parts.push(`${result.wordsUpdated} updated`);
        toast.success(
          `${parts.join(', ')} — ${result.translationsCreated} translations saved`
        );
        setJsonText('');
        setOpen(false);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Import failed';
        toast.error(message);
      }
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline">
          <Upload data-icon="inline-start" />
          Bulk Import
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Bulk Import Words</SheetTitle>
          <SheetDescription>
            Paste a JSON array of words with their translations. Each entry
            needs a <code className="rounded bg-muted px-1 text-xs">name</code>{' '}
            and optional{' '}
            <code className="rounded bg-muted px-1 text-xs">translations</code>{' '}
            object.

            <br />
            <pre className="mt-2 rounded bg-muted p-2 text-xs">
              <span>{'// example json'}</span>
              <br />
              {EXAMPLE_JSON}
            </pre>
          </SheetDescription>
        </SheetHeader>

        <div className="p-4">
          <Textarea
            placeholder={EXAMPLE_JSON}
            value={jsonText}
            onChange={(e) => {
              setJsonText(e.target.value);
              setError(null);
            }}
            rows={14}
            className="font-mono text-xs"
          />
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <SheetFooter>
          <Button
            variant="outline"
            type="button"
            onClick={() => setJsonText(EXAMPLE_JSON)}
            disabled={isPending}
          >
            Load Example
          </Button>
          <Button
            onClick={handleImport}
            disabled={isPending || !jsonText.trim()}
          >
            {isPending ? 'Importing…' : 'Import'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
