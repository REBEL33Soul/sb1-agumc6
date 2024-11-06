import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';

interface RightsVerificationProps {
  onVerify: () => void;
  projectId: string;
}

export function RightsVerification({ onVerify, projectId }: RightsVerificationProps) {
  const [verified, setVerified] = useState(false);
  const { toast } = useToast();

  const handleVerify = async () => {
    if (!verified) {
      toast({
        title: "Verification required",
        description: "Please confirm you have rights to this recording",
        variant: "destructive",
      });
      return;
    }

    try {
      await fetch(`/api/projects/${projectId}/verify-rights`, {
        method: 'POST',
      });
      onVerify();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record verification",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6 bg-gray-800/50 backdrop-blur-xl border-gray-700">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Rights Verification</h2>
        
        <div className="space-y-4">
          <p className="text-gray-300">
            Before processing this recording, please confirm that you have the necessary rights
            and permissions to use and modify this content.
          </p>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="rights"
              checked={verified}
              onCheckedChange={(checked) => setVerified(checked as boolean)}
            />
            <label htmlFor="rights" className="text-sm text-gray-300">
              I confirm that I have the necessary rights to this recording and any included content
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleVerify}
            disabled={!verified}
            className="bg-blue-600 hover:bg-blue-500"
          >
            Confirm & Continue
          </Button>
        </div>
      </div>
    </Card>
  );
}