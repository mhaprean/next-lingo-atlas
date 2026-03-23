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
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface DeleteConfirmDialogProps {
  title: string;
  description: string;
  onDelete: () => Promise<void>;
  trigger?: React.ReactNode;
  expectedInput?: string;
}

export function DeleteConfirmDialog({
  title,
  description,
  onDelete,
  trigger,
  expectedInput,
}: DeleteConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [inputValue, setInputValue] = useState('');

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await onDelete();
        setOpen(false);
        setInputValue('');
        toast.success('Deleted successfully');
      } catch {
        toast.error('Failed to delete');
      }
    });
  };

  const isDeleteDisabled = isPending || (expectedInput ? inputValue !== expectedInput : false);

  return (
    <Sheet open={open} onOpenChange={(val) => {
      setOpen(val);
      if (!val) setInputValue('');
    }}>
      <SheetTrigger asChild>
        {trigger ?? (
          <Button variant="destructive" size="icon-sm">
            <Trash2 />
          </Button>
        )}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        {expectedInput && (
          <div className="px-4 pt-4 flex flex-col gap-2">
            <Label htmlFor="confirm-delete" className="font-normal text-muted-foreground">
              Please type <strong className="text-foreground">{expectedInput}</strong> to confirm.
            </Label>
            <Input
              id="confirm-delete"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={expectedInput}
            />
          </div>
        )}
        <div className="p-4 mt-2 flex justify-end gap-2">
          <SheetClose asChild>
            <Button variant="outline" disabled={isPending}>Cancel</Button>
          </SheetClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleteDisabled}
          >
            {isPending ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
