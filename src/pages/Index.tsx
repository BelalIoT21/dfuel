
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Index = () => {
  console.log("Rendering Index page");
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('login');

  useEffect(() => {
    console.log("Index page useEffect running", { user: user?.name || "null", loading });
    
    if (user && !loading) {
      console.log("User is authenticated, redirecting to appropriate dashboard");
      if (user.isAdmin) {
        console.log("Redirecting admin to /admin");
        navigate('/admin');
      } else {
        console.log("Redirecting user to /home");
        navigate('/home');
      }
    }
  }, [user, loading, navigate]);

  // Debug div to see if anything is rendering at all
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-purple-800 mb-4">Loading...</h2>
          <p className="text-gray-600">Please wait while we set up your experience.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-purple-800 mb-2">Learnit Academy</h1>
          <p className="text-gray-600">Access machine learning resources safely</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <LoginForm onRegisterClick={() => setActiveTab('register')} />
              </TabsContent>
              <TabsContent value="register">
                <RegisterForm onLoginClick={() => setActiveTab('login')} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
