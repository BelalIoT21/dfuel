import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { User } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from 'sonner';

const PersonalInfoCard = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  let auth;
  try {
    auth = useAuth();
  } catch (error) {
    console.error('Error using Auth context in PersonalInfoCard:', error);
  }
  
  const user = auth?.user || null;
  const updateProfile = auth?.updateProfile || null;
  const changePassword = auth?.changePassword || null;

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  if (!user) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
          <CardDescription>
            Unable to load user information. Please try again later.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const formatDate = (dateStr: string | Date | undefined) => {
    if (!dateStr) {
      return user?.createdAt 
        ? `Account created: ${new Date(user.createdAt).toLocaleDateString()}`
        : 'Recently joined';
    }
    
    try {
      const date = new Date(dateStr);
      
      if (isNaN(date.getTime())) {
        return user?.createdAt 
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
    if (!updateProfile) {
      toast.error("Profile update functionality is not available");
      return;
    }
    
    setIsUpdating(true);
    try {
      const success = await updateProfile({ name, email });
      if (success) {
        toast.success("Profile updated successfully");
        setIsEditing(false);
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An error occurred while updating your profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async () => {
    if (!changePassword) {
      toast.error("Password change functionality is not available");
      return;
    }
    
    // Validate passwords
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }
    
    setIsChangingPassword(true);
    try {
      const success = await changePassword(currentPassword, newPassword);
      if (success) {
        toast.success("Password changed successfully");
        setIsPasswordDialogOpen(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordError("");
      } else {
        toast.error("Failed to change password");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("An error occurred while changing your password");
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
                  setName(user?.name || '');
                  setEmail(user?.email || '');
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
                <p className="font-medium">{user?.name}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-500 text-sm">Email</Label>
                <p className="font-medium">{user?.email}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-500 text-sm">Account Created</Label>
              <p className="font-medium">{formatDate(user?.createdAt)}</p>
            </div>
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={() => setIsEditing(true)} 
                className="bg-purple-600 hover:bg-purple-700"
              >
                Edit Profile
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsPasswordDialogOpen(true)} 
                className="border-purple-200"
              >
                Change Password
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one.
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
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
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
            <Button 
              variant="outline" 
              onClick={() => {
                setIsPasswordDialogOpen(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setPasswordError('');
              }}
              className="border-purple-200"
              disabled={isChangingPassword}
            >
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
    </Card>
  );
};

export default PersonalInfoCard;
