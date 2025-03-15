import userDatabase from '@/services/userDatabase';
import { useToast } from '@/hooks/use-toast';

export const usePasswordResetFunctions = () => {
  const { toast } = useToast();

  const requestPasswordReset = async (email: string): Promise<boolean> => {
    try {
      const success = await userDatabase.requestPasswordReset(email);
      if (success) {
        toast({
          title: "Password reset requested",
          description: "Check your email for a reset code."
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: "Failed to request password reset. Email not found.",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error("Error requesting password reset:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
      return false;
    }
  };

  const resetPassword = async (email: string, resetCode: string, newPassword: string): Promise<boolean> => {
    try {
      const success = await userDatabase.resetPassword(email, resetCode, newPassword);
      if (success) {
        toast({
          title: "Password reset successful",
          description: "Your password has been reset."
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: "Failed to reset password. Invalid code or email.",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    requestPasswordReset,
    resetPassword
  };
};
