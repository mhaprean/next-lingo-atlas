import { authClient } from '@/lib/auth/client'; 
import { NeonAuthUIProvider, UserButton } from '@neondatabase/auth/react'; 
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from 'next/link';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeToggle } from '@/components/theme-toggle';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Lingo Atlas',
  description: 'Language learning application',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NeonAuthUIProvider
            authClient={authClient} 
            redirectTo="/account/settings"
            emailOTP
          >
            <header className='flex justify-end items-center px-6 py-4 gap-4 h-16 border-b backdrop-blur-sm sticky top-0 z-50'>
              <Link href="/" className='text-xl flex items-center gap-2 font-bold hover:opacity-80 transition-opacity duration-200 mr-auto'>
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Lingo</span> Atlas
              </Link>
              <Link href="/admin" className='text-sm font-medium transition-colors duration-200'>
                Dashboard
              </Link>
              <ThemeToggle />
              <UserButton size="icon" />
            </header>
            <main className="flex-1">
              {children}
            </main>
          </NeonAuthUIProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
