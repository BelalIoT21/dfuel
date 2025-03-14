
import { User } from '@/types/database';
import userDatabase from '@/services/userDatabase';
import { useToast } from '@/hooks/use-toast';
import { GoogleLoginData } from '@/types/auth';

export const useLoginFunctions = (
  setUser: React.Dispatch<React.SetStateAction<User | null>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const { toast } = useToast();

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log("Login attempt:", email);
    try {
      setLoading(true);
      const user = await userDatabase.authenticate(email, password);
      
      if (user) {
        console.log("Login successful:", user.name);
        setUser(user);
        localStorage.setItem('learnit_user', JSON.stringify(user));
        toast({
          title: "Login successful",
          description: `Welcome back, ${user.name}!`
        });
        return true;
      } else {
        console.log("Login failed: Invalid credentials");
        toast({
          title: "Login failed",
          description: "Invalid email or password",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (googleData: GoogleLoginData): Promise<boolean> => {
    console.log("Google login attempt");
    try {
      setLoading(true);
      
      // Validate required data from Google
      if (!googleData.email || !googleData.name || !googleData.sub) {
        console.log("Google login failed: Incomplete data", googleData);
        toast({
          title: "Login failed",
          description: "Incomplete information from Google",
          variant: "destructive"
        });
        return false;
      }
      
      // This would need to call a backend API endpoint for Google authentication
      // For now, we'll mock it by registering the user if they don't exist
      let user = await userDatabase.findUserByEmail(googleData.email);
      
      if (!user) {
        console.log("User not found, auto-registering from Google data");
        // Auto-register user from Google data
        user = await userDatabase.registerUser(
          googleData.email,
          Math.random().toString(36).slice(-10), // Generate random password (not actually used)
          googleData.name
        );
        
        if (!user) {
          console.log("Failed to auto-register Google user");
          toast({
            title: "Registration failed",
            description: "Failed to create account with Google",
            variant: "destructive"
          });
          return false;
        }
      }
      
      console.log("Google login successful:", user.name);
      setUser(user);
      localStorage.setItem('learnit_user', JSON.stringify(user));
      toast({
        title: "Google login successful",
        description: `Welcome, ${user.name}!`
      });
      return true;
      
    } catch (error) {
      console.error("Google login error:", error);
      toast({
        title: "Login error",
        description: "An unexpected error occurred with Google login",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    login,
    googleLogin
  };
};
