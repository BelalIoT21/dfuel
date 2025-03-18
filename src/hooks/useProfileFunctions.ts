
import { User } from '@/types/database';
import userDatabase from '@/services/userDatabase';
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

      // First update in localStorage to ensure we have a fallback
      localStorageService.updateUser(user.id, updates);
      
      // Then try database update
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
        // Even if database update failed, we still have localStorage update
        // So we can update the user state
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        localStorage.setItem('learnit_user', JSON.stringify(updatedUser));
        
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully (using local storage)."
        });
        return true;
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

      // First verify the current password against localStorage
      const storedUser = localStorageService.findUserById(user.id);
      if (!storedUser) {
        toast({
          title: "Error",
          description: "User not found in local storage.",
          variant: "destructive"
        });
        return false;
      }

      if (storedUser.password !== currentPassword) {
        toast({
          title: "Error",
          description: "Current password is incorrect.",
          variant: "destructive"
        });
        return false;
      }
      
      // Update password in localStorage first
      localStorageService.updateUser(user.id, { password: newPassword });
      
      // Try database update
      const success = await userDatabase.changePassword(user.id, currentPassword, newPassword);
      
      if (success) {
        toast({
          title: "Password changed",
          description: "Your password has been changed successfully."
        });
        return true;
      } else {
        // Even if database update failed, we've updated localStorage
        toast({
          title: "Password changed",
          description: "Your password has been changed successfully (using local storage)."
        });
        return true;
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
