import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Fingerprint, Loader2 } from 'lucide-react';
import { BiometricAuth } from '@/lib/auth/biometric';
import { useToast } from '@/components/ui/use-toast';

interface BiometricPromptProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function BiometricPrompt({ onSuccess, onCancel }: BiometricPromptProps) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { toast } = useToast();
  const biometricAuth = BiometricAuth.getInstance();

  const handleAuthenticate = async () => {
    setIsAuthenticating(true);
    try {
      const success = await biometricAuth.authenticate();
      if (success) {
        toast({
          title: "Success",
          description: "Biometric authentication successful",
        });
        onSuccess();
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      toast({
        title: "Authentication Failed",
        description: "Please try again or use password",
        variant: "destructive",
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <Card className="p-6 bg-gray-800/50 backdrop-blur-xl border-gray-700">
      <div className="space-y-6">
        <div className="flex flex-col items-center text-center">
          <div className="p-4 bg-blue-500/20 rounded-full mb-4">
            <Fingerprint className="h-12 w-12 text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-white">
            Biometric Authentication
          </h3>
          <p className="text-sm text-gray-400">
            Use Face ID or Touch ID to sign in
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleAuthenticate}
            disabled={isAuthenticating}
            className="w-full"
          >
            {isAuthenticating ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Fingerprint className="h-4 w-4 mr-2" />
            )}
            {isAuthenticating ? 'Authenticating...' : 'Authenticate'}
          </Button>
          
          <Button
            onClick={onCancel}
            variant="ghost"
            className="w-full"
          >
            Use Password Instead
          </Button>
        </div>
      </div>
    </Card>
  );
}