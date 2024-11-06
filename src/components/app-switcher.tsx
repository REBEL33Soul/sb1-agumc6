import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { SUITE_APPS } from '@/lib/shared/constants';
import { Wand2, Music, Sliders } from 'lucide-react';

export function AppSwitcher() {
  const pathname = usePathname();
  const currentApp = pathname.split('/')[1];

  return (
    <div className="flex items-center space-x-2 px-4 py-2">
      <Link
        href="/restoration"
        className={cn(
          "flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors",
          currentApp === 'restoration' 
            ? "bg-blue-500/20 text-blue-400" 
            : "hover:bg-gray-800 text-gray-400"
        )}
      >
        <Wand2 className="h-5 w-5" />
        <span className="hidden lg:inline">Restoration</span>
      </Link>

      <Link
        href="/mastering"
        className={cn(
          "flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors",
          currentApp === 'mastering' 
            ? "bg-green-500/20 text-green-400" 
            : "hover:bg-gray-800 text-gray-400"
        )}
      >
        <Sliders className="h-5 w-5" />
        <span className="hidden lg:inline">Mastering</span>
      </Link>

      <Link
        href="/generation"
        className={cn(
          "flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors",
          currentApp === 'generation' 
            ? "bg-purple-500/20 text-purple-400" 
            : "hover:bg-gray-800 text-gray-400"
        )}
      >
        <Music className="h-5 w-5" />
        <span className="hidden lg:inline">Generation</span>
      </Link>
    </div>
  );
}