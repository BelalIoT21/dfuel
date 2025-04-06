
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Check, Mail } from "lucide-react";
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const isMobile = useIsMobile();

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
      
      // Check for specific error about user already existing
      if (error instanceof Error && error.message.includes("already exists")) {
        setFormError("A user with this email already exists. Please try logging in instead.");
        
        // Focus on the email input for better UX
        const emailInput = document.getElementById('email');
        if (emailInput) emailInput.focus();
      } else {
        setFormError(error instanceof Error ? error.message : 'Registration failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const cardHeaderClass = isMobile 
    ? "pb-1 pt-2 px-3 md:p-6" 
    : "pb-2 pt-4 px-6";
  
  const cardContentClass = isMobile
    ? "p-3 md:p-6"
    : "p-6 pt-3";

  return (
    <Card className="shadow-lg border-purple-100 w-full">
      <CardHeader className={cardHeaderClass}>
        <CardTitle className={isMobile ? "text-xl md:text-2xl" : "text-2xl"}>Register</CardTitle>
        <CardDescription className={isMobile ? "text-xs md:text-sm" : "text-sm"}>
          Fill in your details to create a new account
        </CardDescription>
      </CardHeader>
      <CardContent className={cardContentClass}>
        {formError && (
          <Alert variant="destructive" className={isMobile ? "mb-2 py-1.5" : "mb-3 py-2"}>
            <div className="flex items-center">
              {formError.includes("already exists") ? (
                <Mail className={isMobile ? "h-3 w-3 mr-1.5" : "h-4 w-4 mr-2"} />
              ) : (
                <AlertCircle className={isMobile ? "h-3 w-3 mr-1.5" : "h-4 w-4 mr-2"} />
              )}
              <AlertDescription className={isMobile ? "text-xs" : "text-sm"}>{formError}</AlertDescription>
            </div>
          </Alert>
        )}
        
        {registrationSuccess && (
          <Alert className={`mb-3 bg-green-50 border-green-200 ${isMobile ? "py-1.5" : "py-2"}`}>
            <Check className={isMobile ? "h-3 w-3 mr-1.5 text-green-500" : "h-4 w-4 mr-2 text-green-500"} />
            <AlertDescription className={`${isMobile ? "text-xs" : "text-sm"} text-green-700`}>
              Registration successful! Redirecting to login...
            </AlertDescription>
          </Alert>
        )}
        
        <motion.form 
          onSubmit={handleSubmit} 
          className="space-y-2.5"
          variants={formAnimation}
          initial="hidden"
          animate="show"
        >
          <motion.div className="space-y-1" variants={itemAnimation}>
            <Label htmlFor="name" className={isMobile ? "text-xs md:text-sm" : "text-sm"}>Full Name</Label>
            <Input
              id="name"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full ${isMobile ? 'h-7 text-xs md:text-sm' : 'h-10 text-sm'} ${nameError ? 'border-red-500' : ''}`}
              disabled={isSubmitting || registrationSuccess}
            />
            {nameError && <p className="text-xs text-red-500">{nameError}</p>}
          </motion.div>
          
          <motion.div className="space-y-1" variants={itemAnimation}>
            <Label htmlFor="email" className={isMobile ? "text-xs md:text-sm" : "text-sm"}>Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full ${isMobile ? 'h-7 text-xs md:text-sm' : 'h-10 text-sm'} ${emailError ? 'border-red-500' : ''}`}
              disabled={isSubmitting || registrationSuccess}
            />
            {emailError && <p className="text-xs text-red-500">{emailError}</p>}
          </motion.div>
          
          <motion.div className="space-y-1" variants={itemAnimation}>
            <Label htmlFor="password" className={isMobile ? "text-xs md:text-sm" : "text-sm"}>Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full ${isMobile ? 'h-7 text-xs md:text-sm' : 'h-10 text-sm'} ${passwordError ? 'border-red-500' : ''}`}
              disabled={isSubmitting || registrationSuccess}
            />
            {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
          </motion.div>
          
          <motion.div variants={itemAnimation}>
            <Button 
              type="submit" 
              className={`w-full ${isMobile ? 'h-7 text-xs md:text-sm mt-1' : 'h-10 text-sm mt-2'} bg-purple-600 hover:bg-purple-700`}
              disabled={isSubmitting || registrationSuccess}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </Button>
          </motion.div>
        </motion.form>

        <motion.div 
          className="mt-3 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={onToggleMode}
            className={`${isMobile ? 'text-[10px] md:text-xs' : 'text-sm'} text-purple-600 hover:underline`}
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
