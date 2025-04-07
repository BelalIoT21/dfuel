
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
    console.debug("Registration form submitted", { email, password, name });
    setFormError('');
    setRegistrationSuccess(false);
    
    if (!validateForm()) return;
    
    if (isSubmitting) {
      console.debug("Form already submitting, preventing duplicate submission");
      return;
    }
    
    try {
      setIsSubmitting(true);
      console.debug("Attempting registration with:", { email, password, name });
      
      // Always display the error when a user exists
      try {
        await onRegister(email, password, name);
        
        // If we got here, registration was successful
        console.debug("Registration successful");
        
        setRegistrationSuccess(true);
        
        // Clear form after successful registration
        setEmail('');
        setPassword('');
        setName('');
        
        // Redirect to login after a short delay
        setTimeout(() => {
          onToggleMode();
        }, 2000);
      } catch (error: any) {
        // This is where the user already exists error is handled
        if (error.name === 'UserExistsError' || 
            error.message === 'User already exists' || 
            (typeof error.message === 'string' && error.message.includes('User already exists'))) {
          setFormError('This email is already registered. Please try logging in instead.');
          
          // Focus on email field
          const emailInput = document.getElementById('email') as HTMLInputElement;
          if (emailInput) {
            emailInput.focus();
          }
        } else {
          throw error; // Re-throw to be caught by the outer catch block
        }
      }
    } catch (error: any) {
      // Handle other errors
      if (error.message === 'Server error' || 
         (typeof error.message === 'string' && error.message.includes('Server error'))) {
        setFormError('Unable to connect to the server. Please try again later.');
      } else {
        // Only log for unexpected errors
        console.error("Authentication error:", error);
        setFormError('Registration failed. Please try again later.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const cardHeaderClass = isMobile 
    ? "pb-0.5 pt-1 px-3 md:p-6" // Reduced pt-1.5 to pt-1
    : "pb-2 pt-4 px-6";
  
  const cardContentClass = isMobile
    ? "p-3 pt-0.5 md:p-6" // Reduced pt-1.5 to pt-0.5
    : "p-6 pt-3";

  return (
    <Card className="shadow-lg border-purple-100 w-full">
      <CardHeader className={cardHeaderClass}>
        <CardTitle className={isMobile ? "text-lg md:text-2xl" : "text-2xl"}>Register</CardTitle>
        <CardDescription className={isMobile ? "text-xs md:text-sm" : "text-sm"}>
          Fill in your details to create a new account
        </CardDescription>
      </CardHeader>
      <CardContent className={cardContentClass}>
        {formError && (
          <Alert variant="destructive" className={`${isMobile ? "mb-1 py-1" : "mb-4 py-3"} border-2 border-red-500`}> {/* Reduced from mb-1.5 to mb-1 */}
            <div className="flex items-center">
              {formError.includes("already exists") ? (
                <Mail className={isMobile ? "h-3 w-3 mr-1.5" : "h-5 w-5 mr-2"} />
              ) : (
                <AlertCircle className={isMobile ? "h-3 w-3 mr-1.5" : "h-5 w-5 mr-2"} />
              )}
              <AlertDescription className={`${isMobile ? "text-xs" : "text-base"} font-medium`}>{formError}</AlertDescription>
            </div>
          </Alert>
        )}
        
        {registrationSuccess && (
          <Alert className={`mb-1 bg-green-50 border-green-200 ${isMobile ? "py-1" : "py-2"}`}> {/* Reduced from mb-1.5 to mb-1 */}
            <Check className={isMobile ? "h-3 w-3 mr-1.5 text-green-500" : "h-4 w-4 mr-2 text-green-500"} />
            <AlertDescription className={`${isMobile ? "text-xs" : "text-sm"} text-green-700`}>
              Registration successful! Redirecting to login...
            </AlertDescription>
          </Alert>
        )}
        
        <motion.form 
          onSubmit={handleSubmit} 
          className={isMobile ? "space-y-1" : "space-y-2.5"} // Reduced space-y-1.5 to space-y-1
          variants={formAnimation}
          initial="hidden"
          animate="show"
        >
          <motion.div className="space-y-0.5" variants={itemAnimation}>
            <Label htmlFor="name" className={isMobile ? "text-xs md:text-sm" : "text-sm"}>Full Name</Label>
            <Input
              id="name"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full ${isMobile ? 'h-6 text-xs md:text-sm' : 'h-10 text-sm'} ${nameError ? 'border-red-500' : ''}`}
              disabled={isSubmitting || registrationSuccess}
            />
            {nameError && <p className="text-xs text-red-500">{nameError}</p>}
          </motion.div>
          
          <motion.div className="space-y-0.5" variants={itemAnimation}>
            <Label htmlFor="email" className={isMobile ? "text-xs md:text-sm" : "text-sm"}>Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full ${isMobile ? 'h-6 text-xs md:text-sm' : 'h-10 text-sm'} ${emailError ? 'border-red-500' : ''}`}
              disabled={isSubmitting || registrationSuccess}
            />
            {emailError && <p className="text-xs text-red-500">{emailError}</p>}
          </motion.div>
          
          <motion.div className="space-y-0.5" variants={itemAnimation}>
            <Label htmlFor="password" className={isMobile ? "text-xs md:text-sm" : "text-sm"}>Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full ${isMobile ? 'h-6 text-xs md:text-sm' : 'h-10 text-sm'} ${passwordError ? 'border-red-500' : ''}`}
              disabled={isSubmitting || registrationSuccess}
            />
            {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
          </motion.div>
          
          <motion.div variants={itemAnimation}>
            <Button 
              type="submit" 
              className={`w-full ${isMobile ? 'h-6 text-xs md:text-sm mt-0.5' : 'h-10 text-sm mt-2'} bg-purple-600 hover:bg-purple-700`}
              disabled={isSubmitting || registrationSuccess}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </Button>
          </motion.div>
        </motion.form>

        <motion.div 
          className={isMobile ? "mt-1 text-center" : "mt-3 text-center"} // Reduced from mt-1.5 to mt-1
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
