
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import userDatabase from '../../../services/userDatabase';

interface AddUserDialogProps {
  onUserAdded: (newUser: any) => void;
}

export const AddUserDialog = ({ onUserAdded }: AddUserDialogProps) => {
  const { toast } = useToast();
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleAddUser = () => {
    // Validate input
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive"
      });
      return;
    }

    // In a real app, this would add to the database
    const registeredUser = userDatabase.registerUser(
      newUser.email,
      newUser.password,
      newUser.name
    );

    if (registeredUser) {
      onUserAdded(registeredUser);
      toast({
        title: "User Added",
        description: "New user has been added successfully."
      });
      setIsAddingUser(false);
      setNewUser({ name: '', email: '', password: '' });
    } else {
      toast({
        title: "Error",
        description: "Email is already in use",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isAddingUser} onOpenChange={setIsAddingUser}>
      <DialogTrigger asChild>
        <Button className="whitespace-nowrap">Add New User</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new user account with the form below.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={newUser.name}
              onChange={(e) => setNewUser({...newUser, name: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({...newUser, email: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({...newUser, password: e.target.value})}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsAddingUser(false)}>Cancel</Button>
          <Button onClick={handleAddUser}>Add User</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
