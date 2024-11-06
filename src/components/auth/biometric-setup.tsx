import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Fingerprint, Shield, CheckCircle, XCircle } from 'lucide-react';
import { BiometricAuth } from '@/lib/auth/biometric';
import { useToast } from '@/components/ui/use-toast';

interface BiometricSetupProps {
  userId: string;
  onComplete: () => void;
}

export function BiometricSetup({ userId, onComplete }: BiometricSetupProps) {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();
  const biometricAuth = BiometricAuth.getInstance();

  const checkAvailability = async () => {
    const available = await biometricAuth.isBiometricsAvailable();
    setIsAvailable(available);
    
    if (!available) {
      toast({
        title: "Biometrics Unavailable",
        description: "Your device doesn't support biometric authentication",
        variant: "destructive",
      });
    }
  };

  const handleSetup = async () => {
    setIsRegistering(true);
    try {
      const success = await biometricAuth.register(userId);
      if (success) {
        setIsComplete(true);
        toast({
          title: "Success",
          description: "Biometric authentication enabled",
        });
        onComplete();
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      toast({
        title: "Setup Failed",
        description: "Failed to enable biometric authentication",
        variant: "destructive",
      });
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <Card className="p-6 bg-gray-800/50 backdrop-blur-xl border-gray-700">
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-500/20 rounded-full">
            <Fingerprint className="h-8 w-8 text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">
              Enable Biometric Login
            </h3>
            <p className="text-sm text-gray-400">
              Use Face ID or Touch ID for secure, quick access
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {!isAvailable ? (
            <Button
              onClick={checkAvailability}
              className="w-full"
              variant="outline"
            >
              <Shield className="h-4 w-4 mr-2" />
              Check Availability
            </Button>
          ) : !isComplete ? (
            <Button
              onClick={handleSetup}
              disabled={isRegistering}
              className="w-full"
            >
              <Fingerprint className="h-4 w-4 mr-2" />
              {isRegistering ? 'Setting up...' : 'Enable Biometric Login'}
            </Button>
          ) : (
            <div className="flex items-center justify-center space-x-2 text-green-400">
              <CheckCircle className="h-5 w-5" />
              <span>Biometric login enabled</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}