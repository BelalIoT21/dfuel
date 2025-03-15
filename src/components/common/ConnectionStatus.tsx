
import { useState, useEffect } from 'react';
import { connectionManager } from '@/services/api/connectionManager';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { RefreshCcw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ConnectionStatus = () => {
  const [isConnected, setIsConnected] = useState(connectionManager.getConnectionStatus());
  const [isChecking, setIsChecking] = useState(false);
  const [apiUrl, setApiUrl] = useState(connectionManager.getApiUrl());
  const [showUrlEdit, setShowUrlEdit] = useState(false);
  const [editUrl, setEditUrl] = useState(apiUrl);
  
  useEffect(() => {
    // Subscribe to connection status changes
    const unsubscribe = connectionManager.addConnectionListener((status) => {
      setIsConnected(status);
    });
    
    return () => unsubscribe();
  }, []);
  
  const handleRefreshConnection = async () => {
    setIsChecking(true);
    await connectionManager.checkConnection();
    setIsChecking(false);
  };
  
  const handleSaveUrl = () => {
    connectionManager.setApiUrl(editUrl);
    setApiUrl(editUrl);
    setShowUrlEdit(false);
    handleRefreshConnection();
  };
  
  const handleReset = () => {
    connectionManager.resetToDefault();
    setEditUrl(connectionManager.getApiUrl());
    setApiUrl(connectionManager.getApiUrl());
    handleRefreshConnection();
  };
  
  return (
    <div className="rounded-md border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h4 className="text-sm font-medium">Server Connection</h4>
          {isConnected ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Connected
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Server is running and responding to API requests</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Disconnected
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Cannot connect to server. Make sure:</p>
                  <ul className="list-disc pl-4 mt-2 text-xs">
                    <li>The server is running at the URL below</li>
                    <li>You've started the server with 'npm run dev' in the server directory</li>
                    <li>No firewall is blocking the connection</li>
                    <li>If using a different URL, it includes the /api path</li>
                  </ul>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefreshConnection}
          disabled={isChecking}
        >
          <RefreshCcw className={`h-3.5 w-3.5 mr-1 ${isChecking ? 'animate-spin' : ''}`} />
          Check
        </Button>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">API URL:</label>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowUrlEdit(!showUrlEdit)}
          >
            {showUrlEdit ? 'Cancel' : 'Edit'}
          </Button>
        </div>
        
        {showUrlEdit ? (
          <div className="space-y-2">
            <input
              type="text"
              value={editUrl}
              onChange={(e) => setEditUrl(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="http://localhost:4000/api"
            />
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleReset}
              >
                Reset to Default
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleSaveUrl}
              >
                Save & Connect
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500 break-all">{apiUrl}</p>
        )}
      </div>
    </div>
  );
};
