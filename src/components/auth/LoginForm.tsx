
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
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

export const LoginForm = ({ onLogin, onToggleMode }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const validateForm = () => {
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    
    setEmailError(emailErr);
    setPasswordError(passwordErr);
    
    return !emailErr && !passwordErr;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login form submitted", { email, password });
    setFormError('');
    
    if (!validateForm()) return;
    
    try {
      setIsSubmitting(true);
      await onLogin(email, password);
    } catch (error) {
      console.error("Authentication error:", error);
      setFormError('Invalid email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const cardHeaderClass = isMobile 
    ? "pb-0.5 pt-1.5 px-3 md:p-6" 
    : "pb-2 pt-4 px-6";
  
  const cardContentClass = isMobile
    ? "p-3 pt-0.5 md:p-6" // Reduced pt-1.5 to pt-0.5 for mobile
    : "p-6 pt-3";

  return (
    <Card className="shadow-lg border-purple-100 w-full">
      <CardHeader className={cardHeaderClass}>
        <CardTitle className={isMobile ? "text-lg md:text-2xl" : "text-2xl"}>Sign In</CardTitle>
        <CardDescription className={isMobile ? "text-xs md:text-sm" : "text-sm"}>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent className={cardContentClass}>
        {formError && (
          <Alert variant="destructive" className={isMobile ? "mb-1 py-1" : "mb-3 py-2"}> {/* Reduced mb-1.5 to mb-1 */}
            <div className="flex items-center">
              <AlertCircle className={isMobile ? "h-3 w-3 mr-1.5" : "h-4 w-4 mr-2"} />
              <AlertDescription className={isMobile ? "text-xs" : "text-sm"}>{formError}</AlertDescription>
            </div>
          </Alert>
        )}
        
        <motion.form 
          onSubmit={handleSubmit} 
          className={isMobile ? "space-y-1.5" : "space-y-2.5"} // Reduced space-y-2 to space-y-1.5
          variants={formAnimation}
          initial="hidden"
          animate="show"
        >
          <motion.div className="space-y-0.5" variants={itemAnimation}>
            <Label htmlFor="email" className={isMobile ? "text-xs md:text-sm" : "text-sm"}>Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full ${isMobile ? 'h-7 text-xs md:text-sm' : 'h-10 text-sm'} ${emailError ? 'border-red-500' : ''}`}
            />
            {emailError && <p className="text-xs text-red-500">{emailError}</p>}
          </motion.div>
          
          <motion.div className="space-y-0.5" variants={itemAnimation}>
            <Label htmlFor="password" className={isMobile ? "text-xs md:text-sm" : "text-sm"}>Password</Label>
            <div className="relative">
              <Input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full ${isMobile ? 'h-7 text-xs md:text-sm' : 'h-10 text-sm'} ${passwordError ? 'border-red-500' : ''}`}
              />
            </div>
            {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
          </motion.div>
          
          <motion.div variants={itemAnimation}>
            <Button 
              type="submit" 
              className={`w-full ${isMobile ? 'h-7 text-xs md:text-sm mt-1' : 'h-10 text-sm mt-2'} bg-purple-600 hover:bg-purple-700`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </Button>
          </motion.div>
        </motion.form>

        <motion.div 
          className={isMobile ? "mt-1.5 text-center" : "mt-3 text-center"} // Changed from mt-2 to mt-1.5
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={onToggleMode}
            className={`${isMobile ? 'text-[10px] md:text-xs' : 'text-sm'} text-purple-600 hover:underline`}
            type="button"
          >
            Don't have an account? Register
          </button>
        </motion.div>
      </CardContent>
    </Card>
  );
};
