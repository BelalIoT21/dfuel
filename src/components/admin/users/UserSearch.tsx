
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card";
import { AddUserDialog } from './AddUserDialog';

interface UserSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onUserAdded: (newUser: any) => void;
}

export const UserSearch = ({ searchTerm, onSearchChange, onUserAdded }: UserSearchProps) => {
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="w-full md:w-1/3">
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="whitespace-nowrap">
              Export Users
            </Button>
            <AddUserDialog onUserAdded={onUserAdded} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
