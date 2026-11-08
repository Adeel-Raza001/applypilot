'use client';

import { ThemeProvider, useTheme } from 'next-themes';
import { ReactNode, Suspense } from 'react';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from './Navbar';

function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      richColors
      closeButton
      position="top-right"
      theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
    />
  );
}

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <Suspense fallback={null}>
          <Navbar />
        </Suspense>
        {children}
        <ThemedToaster />
      </AuthProvider>
    </ThemeProvider>
  );
}