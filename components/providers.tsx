
'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { GameContextProvider } from '@/lib/contexts/game-context';
import { useState, useEffect } from 'react';

interface ProvidersProps {
  children: React.ReactNode;
  session: any;
}

export function Providers({ children, session }: ProvidersProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <SessionProvider session={session}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <GameContextProvider>
          {children}
          <Toaster />
        </GameContextProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
