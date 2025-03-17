
import React from 'react';
import { AlertTriangle } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StatusUpdateDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  selectedMachine: any;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  maintenanceNote: string;
  setMaintenanceNote: (note: string) => void;
  updateError: string | null;
  isLoading: boolean;
  onSave: () => void;
}

export const StatusUpdateDialog: React.FC<StatusUpdateDialogProps> = ({
  isOpen,
  setIsOpen,
  selectedMachine,
  selectedStatus,
  setSelectedStatus,
  maintenanceNote,
  setMaintenanceNote,
  updateError,
  isLoading,
  onSave
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle>Update Machine Status</DialogTitle>
          <DialogDescription>
            Change the current status of {selectedMachine?.name}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="machine-status">Status</Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger id="machine-status" className="bg-white">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="available">
                  <span className="flex items-center">
                    <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                    Available
                  </span>
                </SelectItem>
                <SelectItem value="maintenance">
                  <span className="flex items-center">
                    <span className="h-2 w-2 rounded-full bg-red-500 mr-2"></span>
                    Maintenance
                  </span>
                </SelectItem>
                <SelectItem value="in-use">
                  <span className="flex items-center">
                    <span className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></span>
                    In Use
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {selectedStatus === 'maintenance' && (
            <div className="space-y-2">
              <Label htmlFor="maintenance-note">Maintenance Note</Label>
              <Input
                id="maintenance-note"
                value={maintenanceNote}
                onChange={(e) => setMaintenanceNote(e.target.value)}
                placeholder="Optional: Describe the maintenance issue"
              />
            </div>
          )}
          
          {updateError && (
            <div className="bg-red-50 text-red-800 p-3 rounded-md flex items-start">
              <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{updateError}</span>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)} 
            className="border-purple-200 bg-purple-50 hover:bg-purple-100"
          >
            Cancel
          </Button>
          <Button 
            onClick={onSave} 
            className="bg-purple-600 hover:bg-purple-700"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
