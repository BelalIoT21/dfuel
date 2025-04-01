
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
  keyboardVisible?: boolean;
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

export const LoginForm = ({ onLogin, onToggleMode, keyboardVisible = false }: LoginFormProps) => {
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
      console.log("Login successful");
    } catch (error) {
      console.error("Authentication error:", error);
      setFormError('Invalid email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Apply more compact styles when keyboard is visible on mobile
  const compactMode = keyboardVisible && isMobile;

  return (
    <Card className={`shadow-md border-purple-100 ${compactMode ? 'py-0 mb-0 scale-95' : isMobile ? 'py-2' : ''}`}>
      <CardHeader className={compactMode ? "pb-0 pt-1 px-3" : isMobile ? "pb-1 pt-3 px-4" : "pb-2"}>
        <CardTitle className={compactMode ? "text-base" : isMobile ? "text-xl" : ""}>Sign In</CardTitle>
        {!compactMode && (
          <CardDescription className={isMobile ? "text-sm" : ""}>
            Enter your credentials to access your account
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className={compactMode ? "px-3 py-1" : isMobile ? "px-4 py-2" : ""}>
        {formError && (
          <Alert variant="destructive" className={`${compactMode ? 'mb-1 py-0.5' : isMobile ? 'py-2 mb-2' : 'mb-4'}`}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className={isMobile ? "text-xs" : ""}>{formError}</AlertDescription>
          </Alert>
        )}
        
        <motion.form 
          onSubmit={handleSubmit} 
          className={compactMode ? "space-y-1" : isMobile ? "space-y-3" : "space-y-4"}
          variants={formAnimation}
          initial="hidden"
          animate="show"
        >
          <motion.div className={compactMode ? "space-y-0.5" : isMobile ? "space-y-1" : "space-y-2"} variants={itemAnimation}>
            <Label htmlFor="email" className={compactMode ? "text-xs" : isMobile ? "text-sm" : ""}>Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full ${emailError ? 'border-red-500' : ''} ${compactMode ? 'h-7 text-xs py-1' : isMobile ? 'h-9 text-sm' : ''}`}
            />
            {emailError && <p className={`text-red-500 ${compactMode ? 'text-xs mt-0' : isMobile ? 'text-xs mt-0.5' : 'text-sm'}`}>{emailError}</p>}
          </motion.div>
          
          <motion.div className={compactMode ? "space-y-0.5" : isMobile ? "space-y-1" : "space-y-2"} variants={itemAnimation}>
            <Label htmlFor="password" className={compactMode ? "text-xs" : isMobile ? "text-sm" : ""}>Password</Label>
            <div className="relative">
              <Input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full ${passwordError ? 'border-red-500' : ''} ${compactMode ? 'h-7 text-xs py-1' : isMobile ? 'h-9 text-sm' : ''}`}
              />
            </div>
            {passwordError && <p className={`text-red-500 ${compactMode ? 'text-xs mt-0' : isMobile ? 'text-xs mt-0.5' : 'text-sm'}`}>{passwordError}</p>}
          </motion.div>
          
          <motion.div variants={itemAnimation}>
            <Button 
              type="submit" 
              className={`w-full bg-purple-600 hover:bg-purple-700 ${compactMode ? 'h-7 text-xs mt-0.5 py-0' : isMobile ? 'h-9 text-sm mt-1' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </Button>
          </motion.div>
        </motion.form>

        <motion.div 
          className={`text-center ${compactMode ? 'mt-0.5' : isMobile ? 'mt-2' : 'mt-4'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={onToggleMode}
            className={`text-purple-600 hover:underline ${compactMode ? 'text-xs' : isMobile ? 'text-xs' : 'text-sm'}`}
            type="button"
          >
            Don't have an account? Register
          </button>
        </motion.div>
      </CardContent>
    </Card>
  );
};
