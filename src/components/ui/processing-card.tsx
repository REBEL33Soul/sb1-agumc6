import { Card } from './card';
import { Progress } from './progress';
import { Waveform } from './waveform';
import { theme } from './theme';

export function ProcessingCard({ 
  title, 
  progress, 
  waveform,
  status 
}: ProcessingCardProps) {
  return (
    <Card className="p-6 bg-background-secondary backdrop-blur-xl border-gray-800 
                     hover:border-accent-blue/50 transition-all duration-300">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <div className={`px-3 py-1 rounded-full text-sm
            ${status === 'processing' ? 'bg-accent-blue/20 text-accent-blue' :
              status === 'complete' ? 'bg-accent-green/20 text-accent-green' :
              'bg-accent-red/20 text-accent-red'}`}>
            {status}
          </div>
        </div>

        <Waveform data={waveform} className="h-24" />
        
        <div className="space-y-2">
          <Progress value={progress} />
          <p className="text-sm text-text-secondary text-right">
            {progress}% Complete
          </p>
        </div>
      </div>
    </Card>
  );
}