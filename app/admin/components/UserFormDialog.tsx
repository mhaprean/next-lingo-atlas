'use client';

import { useState, useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { updateUser } from '@/app/admin/actions';
import { toast } from 'sonner';

const userSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  role: z.string().max(50).optional(),
});

type UserFormValues = z.infer<typeof userSchema>;

interface UserFormDialogProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string | null;
  };
  trigger?: React.ReactNode;
}

export function UserFormDialog({ user, trigger }: UserFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: user.name,
      role: user.role ?? '',
    },
  });

  // Reset form when dialog opens/closes or user changes
  useEffect(() => {
    if (open) {
      form.reset({
        name: user.name,
        role: user.role ?? '',
      });
    }
  }, [open, user, form]);

  const onSubmit = (values: UserFormValues) => {
    startTransition(async () => {
      try {
        await updateUser(user.id, {
          name: values.name,
          role: values.role || undefined,
        });
        toast.success('User updated');
        setOpen(false);
      } catch {
        toast.error('Failed to update user');
      }
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" size="icon-sm">
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Edit User</SheetTitle>
        </SheetHeader>
        <div className="p-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input value={user.email} disabled />
                </FormControl>
                <FormDescription>
                  Email cannot be changed
                </FormDescription>
              </FormItem>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="User name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. admin, moderator" {...field} />
                    </FormControl>
                    <FormDescription>
                      Optional role for access control
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <SheetFooter>
                <Button type="submit" disabled={isPending}>
                  {isPending ? 'Saving…' : 'Save Changes'}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
