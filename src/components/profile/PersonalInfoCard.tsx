
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { User } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const PersonalInfoCard = () => {
  const { user, updateProfile, changePassword } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  if (!user) return null;

  // Enhanced date formatting with better fallback handling
  const formatDate = (dateStr: string | Date | undefined) => {
    if (!dateStr) {
      // Use updated fallback mechanism
      return user.createdAt 
        ? `Account created: ${new Date(user.createdAt).toLocaleDateString()}`
        : 'Recently joined';
    }
    
    try {
      const date = new Date(dateStr);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return user.createdAt 
          ? `Account created: ${new Date(user.createdAt).toLocaleDateString()}`
          : 'Recently joined';
      }
      
      return date.toLocaleString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Recently joined';
    }
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    
    setIsUpdating(true);
    try {
      console.log("Attempting to update profile with:", { name, email });
      const success = await updateProfile({ name, email });
      
      if (success) {
        toast.success("Profile updated successfully");
        setIsEditing(false);
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An error occurred while updating profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    setIsChangingPassword(true);
    
    if (!currentPassword) {
      setPasswordError('Current password is required');
      setIsChangingPassword(false);
      return;
    }
    
    if (!newPassword) {
      setPasswordError('New password is required');
      setIsChangingPassword(false);
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      setIsChangingPassword(false);
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      setIsChangingPassword(false);
      return;
    }
    
    try {
      console.log("Attempting to change password in PersonalInfoCard");
      const success = await changePassword(currentPassword, newPassword);
      if (success) {
        // Close dialog and reset fields on success
        setIsPasswordDialogOpen(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        toast.success("Password changed successfully");
      }
    } catch (error) {
      console.error("Error in handleChangePassword:", error);
      if (error instanceof Error) {
        setPasswordError(error.message);
      } else {
        setPasswordError('Failed to change password');
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <Card className="border-purple-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User size={20} className="text-purple-600" />
          Personal Information
        </CardTitle>
        <CardDescription>Manage your account details</CardDescription>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button 
                onClick={handleSaveProfile} 
                className="bg-purple-600 hover:bg-purple-700"
                disabled={isUpdating}
              >
                {isUpdating ? "Saving..." : "Save"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditing(false);
                  setName(user.name || '');
                  setEmail(user.email || '');
                }} 
                className="border-purple-200"
                disabled={isUpdating}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-500 text-sm">Full Name</Label>
                <p className="font-medium">{user.name}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-500 text-sm">Email</Label>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-500 text-sm">Account Type</Label>
                <p className="font-medium">{user.isAdmin ? 'Administrator' : 'User'}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-500 text-sm">Last Login</Label>
                <p className="font-medium">{formatDate(user.lastLogin)}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(true)}
                className="border-purple-200 hover:bg-purple-50"
              >
                Edit Profile
              </Button>
              
              <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                <Button 
                  variant="outline" 
                  onClick={() => setIsPasswordDialogOpen(true)}
                  className="border-purple-200 hover:bg-purple-50"
                >
                  Change Password
                </Button>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Change Your Password</DialogTitle>
                    <DialogDescription>
                      Enter your current password and a new password below.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
                    
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
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
                          className="pr-10"
                        />
                        <button 
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)} className="border-purple-200">
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleChangePassword} 
                      className="bg-purple-600 hover:bg-purple-700"
                      disabled={isChangingPassword}
                    >
                      {isChangingPassword ? "Changing..." : "Change Password"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PersonalInfoCard;
