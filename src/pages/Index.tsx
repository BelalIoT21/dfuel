
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '../context/AuthContext';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogTrigger 
} from "@/components/ui/dialog";

const Index = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [nameError, setNameError] = useState('');
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetStage, setResetStage] = useState<'request' | 'reset'>('request');
  
  const { user, login, register, requestPasswordReset, resetPassword } = useAuth();
  const navigate = useNavigate();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      console.log("User is logged in, redirecting:", user);
      navigate(user.isAdmin ? '/admin' : '/home');
    }
  }, [user, navigate]);

  const validateEmail = (email: string) => {
    if (!email) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const validateName = (name: string) => {
    if (!name) return 'Name is required';
    if (name.length < 2) return 'Name must be at least 2 characters';
    return '';
  };

  const validateForm = () => {
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    let nameErr = '';
    
    if (!isLogin) {
      nameErr = validateName(name);
    }
    
    setEmailError(emailErr);
    setPasswordError(passwordErr);
    setNameError(nameErr);
    
    return !emailErr && !passwordErr && (isLogin || !nameErr);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted", { email, password, name, isLogin });
    setFormError('');
    
    if (!validateForm()) return;
    
    try {
      if (isLogin) {
        await login(email, password);
        console.log("Login successful");
      } else {
        await register(email, password, name);
        console.log("Registration successful");
      }
    } catch (error) {
      console.error("Authentication error:", error);
      setFormError('Authentication failed. Please try again.');
    }
  };

  const clearErrors = () => {
    setEmailError('');
    setPasswordError('');
    setNameError('');
    setFormError('');
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    clearErrors();
  };

  const handleRequestPasswordReset = async () => {
    const emailError = validateEmail(resetEmail);
    if (emailError) {
      setFormError(emailError);
      return;
    }
    
    const success = await requestPasswordReset(resetEmail);
    if (success) {
      setResetStage('reset');
      setFormError('');
    }
  };

  const handleResetPassword = async () => {
    if (!resetCode) {
      setFormError('Reset code is required');
      return;
    }
    
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setFormError(passwordError);
      return;
    }
    
    const success = await resetPassword(resetEmail, resetCode, newPassword);
    if (success) {
      setIsForgotPasswordOpen(false);
      setResetStage('request');
      setResetEmail('');
      setResetCode('');
      setNewPassword('');
    }
  };

  const handleCloseForgotPassword = () => {
    setIsForgotPasswordOpen(false);
    setTimeout(() => {
      setResetStage('request');
      setResetEmail('');
      setResetCode('');
      setNewPassword('');
      setFormError('');
    }, 300);
  };

  // Debug rendering
  console.log("Rendering Index component");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white p-4">
      <div className="w-full max-w-md space-y-6 animate-fade-up">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-purple-800 tracking-tight">Learnit</h1>
          <p className="mt-2 text-md md:text-lg text-gray-600">
            {isLogin ? 'Welcome back!' : 'Create your account'}
          </p>
        </div>

        <Card className="shadow-lg border-purple-100">
          <CardHeader className="pb-2">
            <CardTitle>{isLogin ? 'Sign In' : 'Register'}</CardTitle>
            <CardDescription>
              {isLogin
                ? 'Enter your credentials to access your account'
                : 'Fill in your details to create a new account'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {formError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full ${nameError ? 'border-red-500' : ''}`}
                  />
                  {nameError && <p className="text-sm text-red-500">{nameError}</p>}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full ${emailError ? 'border-red-500' : ''}`}
                />
                {emailError && <p className="text-sm text-red-500">{emailError}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pr-10 ${passwordError ? 'border-red-500' : ''}`}
                  />
                  <button 
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
              </div>
              
              {isLogin && (
                <div className="text-right">
                  <Dialog open={isForgotPasswordOpen} onOpenChange={setIsForgotPasswordOpen}>
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        className="text-sm text-purple-600 hover:underline"
                      >
                        Forgot your password?
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Reset your password</DialogTitle>
                        <DialogDescription>
                          {resetStage === 'request' 
                            ? 'Enter your email to receive a password reset code.' 
                            : 'Enter the code sent to your email and your new password.'}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        {formError && (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{formError}</AlertDescription>
                          </Alert>
                        )}
                        
                        {resetStage === 'request' ? (
                          <div className="space-y-2">
                            <Label htmlFor="reset-email">Email</Label>
                            <Input
                              id="reset-email"
                              type="email"
                              value={resetEmail}
                              onChange={(e) => setResetEmail(e.target.value)}
                              placeholder="Enter your email"
                            />
                          </div>
                        ) : (
                          <>
                            <div className="space-y-2">
                              <Label htmlFor="reset-code">Reset Code</Label>
                              <Input
                                id="reset-code"
                                value={resetCode}
                                onChange={(e) => setResetCode(e.target.value)}
                                placeholder="Enter the 6-digit code"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="new-password">New Password</Label>
                              <div className="relative">
                                <Input
                                  id="new-password"
                                  type={showNewPassword ? "text" : "password"}
                                  value={newPassword}
                                  onChange={(e) => setNewPassword(e.target.value)}
                                  placeholder="New password (min 6 characters)"
                                  className="pr-10"
                                />
                                <button 
                                  type="button"
                                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                  onClick={() => setShowNewPassword(!showNewPassword)}
                                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                                >
                                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={handleCloseForgotPassword}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={resetStage === 'request' ? handleRequestPasswordReset : handleResetPassword}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          {resetStage === 'request' ? 'Send Reset Code' : 'Reset Password'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
              
              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
                {isLogin ? 'Sign In' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={toggleMode}
                className="text-sm text-purple-600 hover:underline"
                type="button"
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
