import { Toaster } from 'sonner';
import { getStats } from '@/app/admin/actions';
import { AdminSidebar } from '@/app/admin/components/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const stats = await getStats();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-muted/30">
      <div className="flex">
        <AdminSidebar stats={stats} />
        <div className="flex-1 p-6">
          {children}
        </div>
      </div>
      <Toaster position="bottom-right" richColors />
    </div>
  );
}