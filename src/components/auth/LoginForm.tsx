
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordResetDialog } from './PasswordResetDialog';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onGoogleLogin?: (googleData: any) => Promise<void>;
  onToggleMode: () => void;
}

export const LoginForm = ({ 
  onLogin, 
  onGoogleLogin, 
  onToggleMode 
}: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onLogin(email, password);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (!onGoogleLogin) return;
    
    try {
      setIsLoading(true);
      const decodedToken = jwtDecode(credentialResponse.credential);
      await onGoogleLogin(decodedToken);
    } catch (error) {
      console.error("Google login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="password">Password</Label>
            <Button 
              type="button" 
              variant="link" 
              size="sm" 
              className="text-xs text-purple-600 p-0 h-auto"
              onClick={() => setResetOpen(true)}
            >
              Forgot password?
            </Button>
          </div>
          <Input 
            id="password" 
            type="password" 
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-purple-600 hover:bg-purple-700"
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </Button>
      </form>
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t"></span>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">Or continue with</span>
        </div>
      </div>
      
      <div className="flex justify-center">
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => console.log('Google login failed')}
            useOneTap
          />
        </GoogleOAuthProvider>
      </div>
      
      <div className="text-center">
        <Button 
          type="button" 
          variant="link" 
          onClick={onToggleMode}
          className="text-purple-600"
        >
          Don't have an account? Register
        </Button>
      </div>
      
      <PasswordResetDialog open={resetOpen} onOpenChange={setResetOpen} />
    </div>
  );
};
