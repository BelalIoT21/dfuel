
import { useState } from 'react';
import { SearchIcon, PlusCircle, Loader2 } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

export const UserSearch = ({ 
  searchTerm, 
  onSearchChange, 
  onUserAdded 
}: { 
  searchTerm: string, 
  onSearchChange: (term: string) => void,
  onUserAdded: (newUser: any) => void 
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: ''
  });
  const { toast } = useToast();
  const { register } = useAuth();
  
  const validateEmail = (email: string) => {
    return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };
  
  const validatePassword = (password: string) => {
    return password.length >= 6;
  };
  
  const resetForm = () => {
    setNewUser({
      name: '',
      email: '',
      password: ''
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }
    
    if (!validateEmail(newUser.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }
    
    if (!validatePassword(newUser.password)) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters",
        variant: "destructive"
      });
      return;
    }
    
    setIsAdding(true);
    
    try {
      console.log("Attempting to register new user:", newUser.email);
      
      // Use the register function from AuthContext which connects directly to MongoDB
      const success = await register(newUser.email, newUser.password, newUser.name);
      
      if (success) {
        toast({
          title: "User Added",
          description: `${newUser.name} has been added successfully.`
        });
        
        // Signal the parent component to refresh the user list from MongoDB
        onUserAdded({ 
          refresh: true,
          message: "User added successfully. Refreshing user list..."
        });
        
        setDialogOpen(false);
        resetForm();
      } else {
        toast({
          title: "Error",
          description: "This email may already be registered.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error adding user:', error);
      toast({
        title: "Error",
        description: "Failed to add user. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAdding(false);
    }
  };
  
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              className="pl-10"
              placeholder="Search users by name or email"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="whitespace-nowrap">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Create a new user account. They will be able to login with these credentials.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={newUser.name}
                      onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                      disabled={isAdding}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      disabled={isAdding}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium">Password</label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••"
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                      disabled={isAdding}
                    />
                    <p className="text-xs text-gray-500">Must be at least 6 characters.</p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => setDialogOpen(false)} disabled={isAdding}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isAdding}>
                    {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isAdding ? 'Adding...' : 'Add User'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};
