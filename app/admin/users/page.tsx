import { getUsers, deleteUser, banUser } from '@/app/admin/actions';
import { UserFormDialog } from '@/app/admin/components/UserFormDialog';
import { DeleteConfirmDialog } from '@/app/admin/components/DeleteConfirmDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
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
import { Pencil, Ban, ShieldCheck } from 'lucide-react';

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Users</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Users</CardTitle>
          <CardDescription>
            Manage registered users and their permissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Pencil className="mb-3 size-10 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                No users found.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {user.image && (
                          <img
                            src={user.image}
                            alt={user.name}
                            className="h-6 w-6 rounded-full"
                          />
                        )}
                        {user.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      {user.emailVerified ? (
                        <Badge variant="outline" className="text-xs">
                          Yes
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">No</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.role ? (
                        <Badge variant="secondary">{user.role}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.banned ? (
                        <div className="flex flex-col gap-1">
                          <Badge variant="destructive" className="w-fit">
                            <Ban className="mr-1 h-3 w-3" />
                            Banned
                          </Badge>
                          {user.banReason && (
                            <span className="text-xs text-muted-foreground">
                              {user.banReason}
                            </span>
                          )}
                        </div>
                      ) : (
                        <Badge variant="outline" className="w-fit">
                          <ShieldCheck className="mr-1 h-3 w-3" />
                          Active
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <UserFormDialog
                          user={{
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            role: user.role,
                          }}
                        />
                        {user.banned ? (
                          <form
                            action={async () => {
                              'use server';
                              await banUser(user.id, {
                                banned: false,
                              });
                            }}
                          >
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              title="Unban user"
                            >
                              <ShieldCheck className="h-4 w-4 text-green-600" />
                            </Button>
                          </form>
                        ) : (
                          <form
                            action={async () => {
                              'use server';
                              await banUser(user.id, {
                                banned: true,
                                banReason: 'Banned by admin',
                              });
                            }}
                          >
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              title="Ban user"
                            >
                              <Ban className="h-4 w-4 text-destructive" />
                            </Button>
                          </form>
                        )}
                        <DeleteConfirmDialog
                          title="Delete User"
                          description={`This will permanently delete "${user.name}" (${user.email}). This action cannot be undone.`}
                          onDelete={async () => {
                            'use server';
                            await deleteUser(user.id);
                          }}
                          expectedInput={user.email}
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
