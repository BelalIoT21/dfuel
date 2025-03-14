
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import userDatabase from '../../../services/userDatabase';
import { machines } from '../../../utils/data';

interface UserCertificationManagerProps {
  user: any;
  onCertificationAdded: () => void;
}

export const UserCertificationManager = ({ user, onCertificationAdded }: UserCertificationManagerProps) => {
  const { toast } = useToast();

  const handleAddCertification = async (userId: string, machineId: string) => {
    // In a real app, this would update the database
    const success = await userDatabase.addCertification(userId, machineId);
    
    if (success) {
      onCertificationAdded();
      
      toast({
        title: "Certification Added",
        description: "User certification has been updated."
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Manage</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage User: {user.name}</DialogTitle>
          <DialogDescription>
            Manage certifications and settings for this user.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <h4 className="text-sm font-medium mb-2">Add Certification</h4>
          <div className="grid grid-cols-2 gap-2">
            {machines.map(machine => (
              <Button
                key={machine.id}
                variant="outline"
                size="sm"
                className={user.certifications.includes(machine.id) ? "bg-green-50" : ""}
                onClick={() => handleAddCertification(user.id, machine.id)}
              >
                {machine.name}
                {user.certifications.includes(machine.id) && " ✓"}
              </Button>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline">Reset Password</Button>
          <Button variant="destructive">Delete User</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
