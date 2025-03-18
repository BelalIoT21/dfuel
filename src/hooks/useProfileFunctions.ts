
import { User } from '@/types/database';
import mongoDbService from '@/services/mongoDbService';
import { useToast } from '@/hooks/use-toast';
import { localStorageService } from '@/services/localStorageService';

export const useProfileFunctions = (
  user: User | null, 
  setUser: React.Dispatch<React.SetStateAction<User | null>>
) => {
  const { toast } = useToast();

  const addCertification = async (machineId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const success = await mongoDbService.updateUserCertifications(user.id, machineId);
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
    if (!user) {
      toast({
        title: "Error",
        description: "User not logged in",
        variant: "destructive"
      });
      return false;
    }
    
    try {
      console.log(`useProfileFunctions: Updating profile for user ${user.id}`, details);
      
      // Extra validation to ensure we have valid data
      if (!details.name && !details.email) {
        toast({
          title: "Error",
          description: "No changes provided for update.",
          variant: "destructive"
        });
        return false;
      }
      
      if (details.name === '') {
        toast({
          title: "Error",
          description: "Name cannot be empty.",
          variant: "destructive"
        });
        return false;
      }
      
      // Create updates object with only the fields that are provided
      const updates: { name?: string; email?: string } = {};
      if (details.name) updates.name = details.name.trim();
      if (details.email) updates.email = details.email.trim();
      
      // Skip update if nothing changed
      if ((updates.name === user.name || updates.name === undefined) && 
          (updates.email === user.email || updates.email === undefined)) {
        toast({
          title: "Info",
          description: "No changes detected."
        });
        return true;
      }

      // Create a new user object with the updated details for state update
      const updatedUser = { ...user, ...updates };
      
      // Update local state immediately for better UX
      setUser(updatedUser);
      localStorage.setItem('learnit_user', JSON.stringify(updatedUser));
      
      // Use MongoDB service directly
      console.log("Calling mongoDbService.updateUser with:", user.id, updates);
      const success = await mongoDbService.updateUser(user.id, updates);
      
      if (success) {
        console.log("Profile update successful");
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully."
        });
        return true;
      } else {
        console.log("MongoDB update failed");
        toast({
          title: "Error",
          description: "Failed to update profile in database",
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
    if (!user) {
      toast({
        title: "Error",
        description: "User not logged in",
        variant: "destructive"
      });
      return false;
    }
    
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

      // Update password in MongoDB directly
      console.log("Calling mongoDbService.updateUser for password change");
      const success = await mongoDbService.updateUser(user.id, { 
        password: newPassword,
        currentPassword: currentPassword
      });
      
      if (success) {
        // Update local storage user with new password for session continuity
        localStorageService.updateUser(user.id, { password: newPassword });
        
        toast({
          title: "Password changed",
          description: "Your password has been changed successfully."
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: "Failed to change password. Current password may be incorrect.",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error("Error in changePassword:", error);
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
