
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
        localStorage.setItem('learnit_user', JSON.stringify(updatedUser));
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
      console.log(`useProfileFunctions: Updating profile for user ${user.id}`, details);
      
      // Validate input - ensure at least one field is provided
      if (!details.name && !details.email) {
        toast({
          title: "Error",
          description: "No changes provided for update.",
          variant: "destructive"
        });
        return false;
      }
      
      // Create updates object with only the fields that are provided
      const updates: { name?: string; email?: string } = {};
      if (details.name) updates.name = details.name;
      if (details.email) updates.email = details.email;
      
      const success = await userDatabase.updateUserProfile(user.id, updates);
      
      if (success) {
        console.log("Profile update successful, updating user state in hook");
        // Create a new user object with the updated details
        const updatedUser = { ...user, ...updates };
        
        // Update the state and local storage
        setUser(updatedUser);
        localStorage.setItem('learnit_user', JSON.stringify(updatedUser));
        
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully."
        });
        return true;
      } else {
        console.error("Profile update failed in database");
        toast({
          title: "Error",
          description: "Failed to update profile. Please try again.",
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
      console.log(`useProfileFunctions: Changing password for user ${user.id}`);
      
      if (!currentPassword || !newPassword) {
        toast({
          title: "Error",
          description: "Both current and new passwords are required.",
          variant: "destructive"
        });
        return false;
      }
      
      if (newPassword.length < 6) {
        toast({
          title: "Error",
          description: "New password must be at least 6 characters long.",
          variant: "destructive"
        });
        return false;
      }
      
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
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
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
