import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { CheckCircle, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';

export function SystemStatus() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/system/verify');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Status check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  if (!status) return null;

  return (
    <Card className="p-6 bg-gray-800/50 backdrop-blur-xl border-gray-700">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">System Status</h3>
          <button
            onClick={checkStatus}
            disabled={loading}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <RefreshCw className={`h-5 w-5 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {status.status === 'ready' && (
            <Badge variant="success">
              <CheckCircle className="h-4 w-4 mr-1" />
              All Systems Operational
            </Badge>
          )}
          {status.status === 'degraded' && (
            <Badge variant="warning">
              <AlertTriangle className="h-4 w-4 mr-1" />
              Degraded Performance
            </Badge>
          )}
          {status.status === 'failed' && (
            <Badge variant="destructive">
              <XCircle className="h-4 w-4 mr-1" />
              System Issues Detected
            </Badge>
          )}
        </div>

        {status.issues.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-white">Active Issues:</p>
            <ul className="space-y-1">
              {status.issues.map((issue: string, index: number) => (
                <li key={index} className="text-sm text-red-400">
                  • {issue}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-sm font-medium text-white">Available Features:</p>
          <div className="flex flex-wrap gap-2">
            {status.capabilities.map((capability: string) => (
              <Badge key={capability} variant="secondary">
                {capability}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}