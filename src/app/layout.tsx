import type { Metadata } from 'next';
import './globals.css';
import { MobileLayout } from '@/components/MobileLayout';
import { Toaster } from '@/components/ui/toaster';
import { AppFooter } from '@/components/AppFooter';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'AgendaFácil',
  description: 'Seu assistente de eventos pessoal.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&family=Space+Grotesk:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <MobileLayout>
            <div className="flex-1 flex flex-col pb-16">{children}</div>
            <AppFooter />
          </MobileLayout>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
