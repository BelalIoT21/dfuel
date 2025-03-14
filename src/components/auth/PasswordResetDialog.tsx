
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { useAuth } from '@/context/AuthContext';

interface PasswordResetDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PasswordResetDialog = ({ isOpen, onOpenChange }: PasswordResetDialogProps) => {
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetStage, setResetStage] = useState<'request' | 'reset'>('request');
  const [formError, setFormError] = useState('');
  
  const { requestPasswordReset, resetPassword } = useAuth();

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
      handleClose();
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setResetStage('request');
      setResetEmail('');
      setResetCode('');
      setNewPassword('');
      setFormError('');
    }, 300);
  };

  return (
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
        <Button variant="outline" onClick={handleClose}>
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
  );
};
