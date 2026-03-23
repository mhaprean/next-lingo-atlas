import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getGroupById, getWordsByGroup, deleteWord } from '@/app/admin/actions';
import { WordFormDialog } from '@/app/admin/components/WordFormDialog';
import { BulkImportDialog } from '@/app/admin/components/BulkImportDialog';
import { DeleteConfirmDialog } from '@/app/admin/components/DeleteConfirmDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Pencil, Languages, FileText } from 'lucide-react';

interface WordsPageProps {
  params: Promise<{ groupId: string }>;
}

export default async function WordsPage({ params }: WordsPageProps) {
  const { groupId } = await params;
  const group = await getGroupById(groupId);

  if (!group) notFound();

  const words = await getWordsByGroup(groupId);

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{group.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{group.name}</CardTitle>
          <CardDescription>
            {group.description || `Manage words in the "${group.name}" group.`}
          </CardDescription>
          <CardAction>
            <div className="flex gap-2">
              <BulkImportDialog groupId={groupId} />
              <WordFormDialog groupId={groupId} />
            </div>
          </CardAction>
        </CardHeader>
        <CardContent>
          {words.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="mb-3 size-10 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                No words yet. Add your first word to this group.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Word</TableHead>
                  <TableHead>Translations</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Updated By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {words.map((word) => (
                  <TableRow key={word.id}>
                    <TableCell className="font-medium">{word.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {word.translationCount} / 40
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(word.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {word.createdByName || '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {word.updatedByName || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/groups/${groupId}/words/${word.id}`}>
                          <Button variant="ghost" size="icon-sm">
                            <Languages />
                          </Button>
                        </Link>
                        <WordFormDialog
                          groupId={groupId}
                          word={word}
                          trigger={
                            <Button variant="ghost" size="icon-sm">
                              <Pencil />
                            </Button>
                          }
                        />
                        <DeleteConfirmDialog
                          title="Delete Word"
                          description={`This will permanently delete "${word.name}" and all its translations. This action cannot be undone.`}
                          onDelete={async () => {
                            'use server';
                            await deleteWord(word.id, groupId);
                          }}
                          expectedInput={word.name}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
