import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { ResourceManager } from '@/lib/core/ResourceManager';
import { MemoryManager } from '@/lib/core/MemoryManager';
import { cn } from '@/lib/utils';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

// Initialize managers
const resourceManager = ResourceManager.getInstance();
const memoryManager = MemoryManager.getInstance();

export const metadata = {
  title: 'Replicator Studio',
  description: 'AI-powered Music Restoration and Replication',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          {/* Preload critical assets */}
          <link 
            rel="preload" 
            href="/fonts/inter.woff2" 
            as="font" 
            type="font/woff2" 
            crossOrigin="anonymous" 
          />
          <link 
            rel="preload" 
            href="/static/css/main.css" 
            as="style" 
          />
          <link 
            rel="preload" 
            href="/static/js/main.js" 
            as="script" 
          />
        </head>
        <body className={cn(
          inter.className,
          'min-h-screen bg-background antialiased cursor-glow'
        )}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}