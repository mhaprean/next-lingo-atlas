import { authClient } from '@/lib/auth/client'; 
import { NeonAuthUIProvider, UserButton } from '@neondatabase/auth/react'; 
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from 'next/link';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Lingo Atlas Neon',
  description: 'A Next.js application with Neon Auth',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NeonAuthUIProvider
          authClient={authClient} 
          redirectTo="/account/settings"
          emailOTP
        >
          <header className='flex justify-end items-center p-4 gap-4 h-16'>
            <Link href="/" className='text-lg font-bold text-gray-800 hover:text-gray-600 transition-colors duration-200 mr-auto'>
              Lingo Atlas admin
            </Link>
            <UserButton size="icon" />
          </header>
          {children}
        </NeonAuthUIProvider>
      </body>
    </html>
  );
}
