import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import type { TestResults } from '@/lib/testing/types';

export function TestPanel() {
  const [results, setResults] = useState<TestResults | null>(null);
  const [running, setRunning] = useState(false);

  const runTests = async () => {
    setRunning(true);
    try {
      const response = await fetch('/api/tests/run', { method: 'POST' });
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Test execution failed:', error);
    } finally {
      setRunning(false);
    }
  };

  return (
    <Card className="p-6 bg-gray-800/50 backdrop-blur-xl border-gray-700">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">System Tests</h3>
          <Button onClick={runTests} disabled={running}>
            {running ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Running Tests...
              </>
            ) : (
              'Run Tests'
            )}
          </Button>
        </div>

        {results && (
          <div className="space-y-6">
            {Object.entries(results).map(([component, result]) => (
              <div key={component} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-medium text-white">
                    {result.component}
                  </h4>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-400">
                      {result.passed}/{result.passed + result.failed} passed
                    </span>
                    <Progress
                      value={(result.passed / (result.passed + result.failed)) * 100}
                      className="w-24"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  {result.tests.map((test) => (
                    <div
                      key={test.name}
                      className="flex items-center justify-between p-2 bg-gray-900/50 rounded-lg"
                    >
                      <div className="flex items-center space-x-2">
                        {test.passed ? (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-400" />
                        )}
                        <span className="text-sm text-gray-300">{test.name}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-xs text-gray-400">
                          {Math.round(test.duration)}ms
                        </span>
                        {test.error && (
                          <span className="text-xs text-red-400">
                            {test.error}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}