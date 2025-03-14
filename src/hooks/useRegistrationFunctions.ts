
import { User } from '@/types/database';
import userDatabase from '@/services/userDatabase';
import { useToast } from '@/hooks/use-toast';

export const useRegistrationFunctions = (
  setUser: React.Dispatch<React.SetStateAction<User | null>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const { toast } = useToast();

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Check if user already exists
      const existingUser = await userDatabase.findUserByEmail(email);
      if (existingUser) {
        toast({
          title: "Registration failed",
          description: "Email is already registered",
          variant: "destructive"
        });
        return false;
      }
      
      // Register new user
      const user = await userDatabase.registerUser(email, password, name);
      
      if (user) {
        setUser(user);
        localStorage.setItem('learnit_user', JSON.stringify(user));
        toast({
          title: "Registration successful",
          description: `Welcome, ${user.name}!`
        });
        return true;
      } else {
        toast({
          title: "Registration failed",
          description: "Failed to create account",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    register
  };
};
