import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';

interface TermsOfServiceProps {
  onAccept: () => void;
  content: string;
}

export function TermsOfService({ onAccept, content }: TermsOfServiceProps) {
  const [hasRead, setHasRead] = useState(false);
  const { toast } = useToast();

  const handleAccept = async () => {
    if (!hasRead) {
      toast({
        title: "Please read the terms",
        description: "Scroll through the entire document before accepting",
        variant: "destructive",
      });
      return;
    }

    try {
      await fetch('/api/legal/accept-terms', {
        method: 'POST',
      });
      onAccept();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record acceptance",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6 bg-gray-800/50 backdrop-blur-xl border-gray-700">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Terms of Service</h2>
        
        <ScrollArea 
          className="h-[400px] rounded-md border border-gray-700 p-4"
          onScrollEndReached={() => setHasRead(true)}
        >
          <div className="prose prose-invert">
            {content}
          </div>
        </ScrollArea>

        <div className="flex justify-end">
          <Button
            onClick={handleAccept}
            disabled={!hasRead}
            className="bg-blue-600 hover:bg-blue-500"
          >
            I Accept
          </Button>
        </div>
      </div>
    </Card>
  );
}