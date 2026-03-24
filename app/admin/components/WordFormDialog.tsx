"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Pencil } from "lucide-react";
import { createWord, updateWord } from "@/app/admin/actions";
import { toast } from "sonner";

const wordSchema = z.object({
  name: z.string().min(1, "Word is required").max(100),
});

type WordFormValues = z.infer<typeof wordSchema>;

interface WordFormDialogProps {
  groupId: string;
  word?: { id: string; name: string } | null;
  trigger?: React.ReactNode;
}

export function WordFormDialog({
  groupId,
  word,
  trigger,
}: WordFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isEditing = !!word;

  const form = useForm<WordFormValues>({
    resolver: zodResolver(wordSchema),
    defaultValues: {
      name: word?.name ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({ name: word?.name ?? "" });
    }
  }, [open, word, form]);

  const onSubmit = (values: WordFormValues) => {
    startTransition(async () => {
      try {
        if (isEditing && word) {
          await updateWord(word.id, { name: values.name, groupId });
          toast.success("Word updated");
        } else {
          await createWord({ groupId, name: values.name });
          toast.success("Word created");
        }
        setOpen(false);
      } catch {
        toast.error(
          isEditing ? "Failed to update word" : "Failed to create word",
        );
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus data-icon="inline-start" />
            Add Word
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Word" : "New Word"}</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Word (English)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. dog" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={isPending}>
                  {isPending
                    ? isEditing
                      ? "Saving…"
                      : "Creating…"
                    : isEditing
                      ? "Save Changes"
                      : "Create Word"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
