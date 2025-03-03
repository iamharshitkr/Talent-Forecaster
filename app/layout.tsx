// "use client"

import ClientLayout from '@/components/client-layout';
import { Footer } from '@/components/footer';
import Header from '@/components/header';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import config from '@/config';
import { cn } from '@/lib/utils';
import type { Metadata } from 'next';
import { Work_Sans } from 'next/font/google';

import { getAnalytics } from "firebase/analytics";
import {app, auth, analytics} from './firebase/config';
import './globals.css';


const workSans = Work_Sans({
  variable: '--font-work-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: config.appName,
  description: config.appName,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          workSans.variable,
          workSans.className,
          'antialiased bg-primary-foreground'
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ClientLayout>
            <Header />
            <main>{children}</main>
            <Footer />
            <Toaster />
          </ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
