import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { AlertTriangle, AlertCircle, AlertOctagon } from 'lucide-react';

interface ErrorLog {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
}

export function ErrorLog() {
  const [errors, setErrors] = useState<ErrorLog[]>([]);

  useEffect(() => {
    const fetchErrors = async () => {
      const response = await fetch('/api/monitoring/alerts');
      const data = await response.json();
      setErrors(data);
    };

    fetchErrors();
    const interval = setInterval(fetchErrors, 30000);
    return () => clearInterval(interval);
  }, []);

  const getSeverityIcon = (severity: ErrorLog['severity']) => {
    switch (severity) {
      case 'critical':
        return <AlertOctagon className="h-5 w-5 text-red-400" />;
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-orange-400" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-400" />;
    }
  };

  return (
    <Card className="p-6 bg-gray-800/50 backdrop-blur-xl border-gray-700">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Error Log</h3>
        
        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {errors.map((error) => (
            <div
              key={error.id}
              className="flex items-start space-x-3 p-3 bg-gray-900/50 rounded-lg"
            >
              {getSeverityIcon(error.severity)}
              <div>
                <p className="text-white">{error.message}</p>
                <p className="text-sm text-gray-400">
                  {new Date(error.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}

          {errors.length === 0 && (
            <p className="text-center text-gray-400 py-4">No errors logged</p>
          )}
        </div>
      </div>
    </Card>
  );
}