import Link from 'next/link';
import { Music, Wand2 } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <main className="flex-1">
        <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <Music className="h-16 w-16 text-blue-500 animate-pulse" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                Replicator Studio
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              AI-powered music restoration and replication platform
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/sign-up"
                className="rounded-md bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 transition-colors"
              >
                Get started
              </Link>
              <Link
                href="/sign-in"
                className="text-sm font-semibold leading-6 text-white hover:text-blue-400 transition-colors"
              >
                Sign in <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}