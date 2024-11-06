import React, { useState } from 'react';
import { MessageSquare, Waves, Sliders } from 'lucide-react';

function App() {
  const [isProcessing, setIsProcessing] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="Replicator Studio" className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Replicator Studio</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isProcessing ? 'bg-yellow-400' : 'bg-green-400'}`} />
            <span className="text-sm">{isProcessing ? 'Processing' : 'Ready'}</span>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-gray-800/50 backdrop-blur-xl rounded-lg p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Waves className="w-5 h-5" />
                  Main Track
                </h2>
              </div>
              <div className="h-48 bg-gray-700/50 rounded-lg flex items-center justify-center">
                <p className="text-gray-400">Drop your audio file here or click to upload</p>
              </div>
            </section>

            <section className="bg-gray-800/50 backdrop-blur-xl rounded-lg p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Sliders className="w-5 h-5" />
                  Reference Tracks
                </h2>
                <button 
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                >
                  Add Reference
                </button>
              </div>
              <p className="text-gray-400 text-center py-8">
                Add up to three reference tracks to guide the mixing process
              </p>
            </section>
          </div>

          <div className="lg:col-span-1">
            <section className="bg-gray-800/50 backdrop-blur-xl rounded-lg p-6 shadow-xl h-full">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5" />
                <h2 className="text-xl font-semibold">Mix Assistant</h2>
              </div>
              <div className="flex flex-col h-[calc(100vh-16rem)]">
                <div className="flex-1 overflow-y-auto mb-4">
                  <p className="text-gray-400 text-center py-8">
                    Start a conversation about your mixing goals
                  </p>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask about mixing techniques..."
                    className="flex-1 bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors">
                    Send
                  </button>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;