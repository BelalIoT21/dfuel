
import { useToast } from '@/hooks/use-toast';

export const useLogoutFunction = (
  setUser: React.Dispatch<React.SetStateAction<any | null>>
) => {
  const { toast } = useToast();

  const logout = () => {
    localStorage.removeItem('learnit_user');
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out."
    });
  };

  return {
    logout
  };
};
