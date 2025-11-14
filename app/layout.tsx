import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Inter } from 'next/font/google';
import Header from '@/components/header';
import { ClerkProvider } from '@clerk/nextjs';
import { shadcn } from '@clerk/themes';
import { Toaster } from 'sonner';

const interFont = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Jira-o',
  description: 'A project management tool inspired by Jira.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: shadcn,
      }}
    >
      <html lang="en">
        <body
          className={`${interFont.className} antialiased dotted-background`}
        >
          <ThemeProvider attribute="class">
            <Header />

            <main className="min-h-screen">{children}</main>

            <Toaster richColors />

            <footer className="w-full py-4 text-center text-sm text-gray-500">
              <p>&copy; {new Date().getFullYear()} Jira-o - Arun Gurung</p>
            </footer>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
