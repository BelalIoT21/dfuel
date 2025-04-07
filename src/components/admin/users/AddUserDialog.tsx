import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/apiService';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface AddUserDialogProps {
  onUserAdded: (newUser: any) => void;
}

export const AddUserDialog = ({ onUserAdded }: AddUserDialogProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleClose = () => {
    if (!isSubmitting) {
      setIsOpen(false);
      setError(null);
      setNewUser({ name: '', email: '', password: '' });
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted!");
    setError(null);
    setIsSubmitting(true);
    
    // Test code - always show error for admin@dfuel.com
    if (newUser.email === "admin@dfuel.com") {
      console.log("Setting test error for admin@dfuel.com");
      setError("A user with this email already exists");
      console.log("Error state should be set now:", "A user with this email already exists");
      setIsSubmitting(false);
      return;
    }

    // Validate input
    if (!newUser.name || !newUser.email || !newUser.password) {
      setError("All fields are required");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await apiService.register(
        newUser.email,
        newUser.password,
        newUser.name
      );

      // Success case
      onUserAdded(response.data);
      toast({
        title: "Success",
        description: "New user has been added successfully."
      });
      handleClose();
      
    } catch (error: any) {
      console.log("Registration error:", error);
      setError("A user with this email already exists");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        console.log("Dialog open state changed:", open);
        if (open) {
          setIsOpen(true);
        } else {
          handleClose();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button 
          className="whitespace-nowrap" 
          onClick={() => {
            setError(null);
            setIsOpen(true);
          }}
        >
          Add New User
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new user account. The user will be able to log in with these credentials.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleAddUser} className="space-y-4 py-4">
          {console.log("Rendering form, error state:", error)}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={newUser.name}
              onChange={(e) => setNewUser({...newUser, name: e.target.value})}
              placeholder="Enter full name"
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({...newUser, email: e.target.value})}
              placeholder="Enter email address"
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({...newUser, password: e.target.value})}
              placeholder="Enter password"
              disabled={isSubmitting}
            />
            <p className="text-sm text-muted-foreground">Password must be at least 6 characters</p>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
