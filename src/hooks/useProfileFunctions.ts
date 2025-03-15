
import { User } from '@/types/database';
import userDatabase from '@/services/userDatabase';
import { useToast } from '@/hooks/use-toast';

export const useProfileFunctions = (
  user: User | null, 
  setUser: React.Dispatch<React.SetStateAction<User | null>>
) => {
  const { toast } = useToast();

  const addCertification = async (machineId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const success = await userDatabase.addCertification(user.id, machineId);
      if (success) {
        // Update user context with new certification
        const updatedUser = { ...user, certifications: [...user.certifications, machineId] };
        setUser(updatedUser);
        return true;
      } else {
        toast({
          title: "Error",
          description: "Failed to add certification.",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error("Error adding certification:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateProfile = async (details: { name?: string; email?: string }): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const success = await userDatabase.updateUserProfile(user.id, details);
      if (success) {
        const updatedUser = { ...user, ...details };
        setUser(updatedUser);
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully."
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: "Failed to update profile.",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
      return false;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const success = await userDatabase.changePassword(user.id, currentPassword, newPassword);
      if (success) {
        toast({
          title: "Password changed",
          description: "Your password has been changed successfully."
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: "Failed to change password. Please check your current password.",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    addCertification,
    updateProfile,
    changePassword
  };
};
