
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onToggleMode: () => void;
  isOfflineMode?: boolean;
}

export const LoginForm = ({ onLogin, onToggleMode, isOfflineMode }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Email is required');
      return;
    }

    if (!password) {
      setError('Password is required');
      return;
    }

    try {
      setLoading(true);
      await onLogin(email, password);
    } catch (err) {
      console.error('Login error in form:', err);
      setError(err instanceof Error ? err.message : 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async () => {
    if (isOfflineMode) {
      setEmail('admin@learnit.com');
      setPassword('admin123');
      
      // Show toast
      toast({
        title: 'Admin Credentials Set',
        description: 'Click Login to continue as admin in offline mode',
      });
    } else {
      toast({
        title: 'Admin Login',
        description: 'Admin login is only available in offline mode',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Button type="button" variant="link" className="p-0 h-auto text-xs">
                Forgot password?
              </Button>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-2 rounded-md flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {isOfflineMode && (
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={handleAdminLogin}
            >
              Use Admin Credentials
            </Button>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <Button variant="ghost" className="w-full" onClick={onToggleMode}>
          Don't have an account? Register
        </Button>
      </CardFooter>
    </Card>
  );
};
