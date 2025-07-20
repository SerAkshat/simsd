
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Business Simulation Platform',
  description: 'Advanced business simulation platform for strategic decision-making training',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Providers session={session}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
