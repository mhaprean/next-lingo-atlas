import Link from 'next/link';
import { getGroups } from '@/app/admin/actions';
import { GroupFormDialog } from '@/app/admin/components/GroupFormDialog';
import { DeleteConfirmDialog } from '@/app/admin/components/DeleteConfirmDialog';
import { deleteGroup } from '@/app/admin/actions';
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
import { Pencil, FolderOpen } from 'lucide-react';

export default async function AdminPage() {
  const groups = await getGroups();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Word Groups</CardTitle>
          <CardDescription>
            Manage categories of words for the map comparison app.
          </CardDescription>
          <CardAction>
            <GroupFormDialog />
          </CardAction>
        </CardHeader>
        <CardContent>
          {groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FolderOpen className="mb-3 size-10 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                No groups yet. Create your first category to get started.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Words</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Updated By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/admin/groups/${group.id}`}
                        className="text-foreground hover:underline"
                      >
                        {group.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{group.slug}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{group.wordCount}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(group.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {group.createdByName || '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {group.updatedByName || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <GroupFormDialog
                          group={group}
                          trigger={
                            <Button variant="ghost" size="icon-sm">
                              <Pencil />
                            </Button>
                          }
                        />
                        <DeleteConfirmDialog
                          title="Delete Group"
                          description={`This will permanently delete "${group.name}" and all its words and translations. This action cannot be undone.`}
                          onDelete={async () => {
                            'use server';
                            await deleteGroup(group.id);
                          }}
                          expectedInput={group.slug}
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
