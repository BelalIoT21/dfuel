
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, WifiOff, Check } from "lucide-react";
import { MachineStatusList } from './MachineStatusList';

interface MachineStatusCardProps {
  machineData: any[];
  isServerConnected: boolean;
  isRefreshing: boolean;
  refreshMachineStatuses: () => void;
  handleUpdateMachineStatus: (machine: any) => void;
}

export const MachineStatusCard: React.FC<MachineStatusCardProps> = ({
  machineData,
  isServerConnected,
  isRefreshing,
  refreshMachineStatuses,
  handleUpdateMachineStatus
}) => {
  const sortedMachineData = [...machineData].sort((a, b) => {
    if (a.type === 'Equipment' || a.type === 'Safety Cabinet') return 1;
    if (b.type === 'Equipment' || b.type === 'Safety Cabinet') return -1;
    return 0;
  });

  return (
    <Card className="border-purple-100">
      <CardHeader className="p-4 md:p-6">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            Machine Status
          </CardTitle>
          <div className="flex items-center gap-2">
            {isServerConnected ? (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded flex items-center">
                <Check className="h-3 w-3 mr-1" />
                Server: Connected
              </span>
            ) : (
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded flex items-center">
                <WifiOff className="h-3 w-3 mr-1" />
                Server: Disconnected
              </span>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshMachineStatuses}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''} mr-2`} />
              Refresh
            </Button>
          </div>
        </div>
        <CardDescription>Current status of all machines</CardDescription>
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-0">
        <MachineStatusList 
          machineData={sortedMachineData} 
          handleUpdateMachineStatus={handleUpdateMachineStatus}
        />
      </CardContent>
    </Card>
  );
};
