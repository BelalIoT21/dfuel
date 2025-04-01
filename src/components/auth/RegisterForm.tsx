
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Eye, EyeOff, Check } from "lucide-react";
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface RegisterFormProps {
  onRegister: (email: string, password: string, name: string) => Promise<void>;
  onToggleMode: () => void;
}

const formAnimation = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemAnimation = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

export const RegisterForm = ({ onRegister, onToggleMode }: RegisterFormProps) => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [nameError, setNameError] = useState('');
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

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
    const nameErr = validateName(name);
    
    setEmailError(emailErr);
    setPasswordError(passwordErr);
    setNameError(nameErr);
    
    return !emailErr && !passwordErr && !nameErr;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Registration form submitted", { email, password, name });
    setFormError('');
    
    if (!validateForm()) return;
    
    if (isSubmitting) {
      console.log("Form already submitting, preventing duplicate submission");
      return;
    }
    
    try {
      setIsSubmitting(true);
      console.log("Attempting registration with:", { email, password, name });
      await onRegister(email, password, name);
      console.log("Registration successful");
      
      setRegistrationSuccess(true);
      
      // Show success toast
      toast({
        title: "Registration successful!",
        description: "Your account has been created. Redirecting to login...",
        variant: "default"
      });
      
      // Clear form after successful registration
      setEmail('');
      setPassword('');
      setName('');
      
      // Redirect to login after a short delay
      setTimeout(() => {
        onToggleMode();
      }, 2000);
      
    } catch (error) {
      console.error("Authentication error:", error);
      setFormError(error instanceof Error ? error.message : 'Registration failed. Please try again.');
      
      // Show error toast
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : 'Please try again with different information.',
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-lg border-purple-100">
      <CardHeader className="pb-2">
        <CardTitle>Register</CardTitle>
        <CardDescription>
          Fill in your details to create a new account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {formError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}
        
        {registrationSuccess && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <Check className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-700">
              Registration successful! Redirecting to login...
            </AlertDescription>
          </Alert>
        )}
        
        <motion.form 
          onSubmit={handleSubmit} 
          className="space-y-4"
          variants={formAnimation}
          initial="hidden"
          animate="show"
        >
          <motion.div className="space-y-2" variants={itemAnimation}>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full ${nameError ? 'border-red-500' : ''}`}
              disabled={isSubmitting || registrationSuccess}
            />
            {nameError && <p className="text-sm text-red-500">{nameError}</p>}
          </motion.div>
          
          <motion.div className="space-y-2" variants={itemAnimation}>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full ${emailError ? 'border-red-500' : ''}`}
              disabled={isSubmitting || registrationSuccess}
            />
            {emailError && <p className="text-sm text-red-500">{emailError}</p>}
          </motion.div>
          
          <motion.div className="space-y-2" variants={itemAnimation}>
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pr-10 ${passwordError ? 'border-red-500' : ''}`}
                disabled={isSubmitting || registrationSuccess}
              />
              <button 
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                disabled={isSubmitting || registrationSuccess}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
          </motion.div>
          
          <motion.div variants={itemAnimation}>
            <Button 
              type="submit" 
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={isSubmitting || registrationSuccess}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </Button>
          </motion.div>
        </motion.form>

        <motion.div 
          className="mt-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={onToggleMode}
            className="text-sm text-purple-600 hover:underline"
            type="button"
            disabled={isSubmitting}
          >
            Already have an account? Sign In
          </button>
        </motion.div>
      </CardContent>
    </Card>
  );
};
