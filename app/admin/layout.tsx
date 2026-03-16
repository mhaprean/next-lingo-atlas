import { Toaster } from 'sonner';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {children}
      </div>
      <Toaster position="bottom-right" richColors />
    </div>
  );
}
