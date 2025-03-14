
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from '../context/AuthContext';

const Index = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      await login(email, password);
    } else {
      await register(email, password, name);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50 p-4">
      <div className="w-full max-w-md space-y-8 animate-fade-up">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Machine Master</h1>
          <p className="mt-2 text-lg text-gray-600">
            {isLogin ? 'Welcome back!' : 'Create your account'}
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>{isLogin ? 'Sign In' : 'Register'}</CardTitle>
            <CardDescription>
              {isLogin
                ? 'Enter your credentials to access your account'
                : 'Fill in your details to create a new account'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <Input
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full"
                />
              )}
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
              />
              <Button type="submit" className="w-full">
                {isLogin ? 'Sign In' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-primary hover:underline"
              >
                {isLogin
                  ? "Don't have an account? Register"
                  : 'Already have an account? Sign In'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
