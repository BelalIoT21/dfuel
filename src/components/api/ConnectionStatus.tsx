
import React, { useState, useEffect } from 'react';
import { RefreshCw, Server, Database, AlertCircle, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiConnection } from '@/services/api/apiConnection';
import { toast } from '@/components/ui/use-toast';
import mongoConnectionService from '@/services/mongodb/connectionService';
import { Tooltip } from '@/components/ui/tooltip';
import { getEnv } from '@/utils/env';

export function ConnectionStatus() {
  const [serverStatus, setServerStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [connectionDetails, setConnectionDetails] = useState<any>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  // Check server connection
  const checkServer = async () => {
    try {
      console.log("Checking server health...");
      setIsRetrying(true);
      setServerStatus('checking');
      
      // Check API connection first
      const connected = await apiConnection.checkConnection(true);
      
      if (!connected) {
        console.error("API connection failed");
        setServerStatus('disconnected');
        setConnectionDetails(null);
        setIsRetrying(false);
        
        toast({
          title: 'Server Connection Failed',
          description: `Could not connect to the backend server at ${apiConnection.getBaseUrl()}. Please configure the API URL if needed.`,
          variant: 'destructive'
        });
        return;
      }
      
      // Get detailed server info
      const serverInfo = await apiConnection.getServerInfo();
      
      if (serverInfo) {
        console.log("Server health check:", serverInfo);
        setServerStatus('connected');
        setConnectionDetails(serverInfo);
        
        toast({
          title: 'Server Connected',
          description: 'Successfully connected to the backend server',
        });
        
        // Check MongoDB connection through the server
        await mongoConnectionService.checkServerConnection();
      } else {
        console.error("Server connection error: No detailed info available");
        setServerStatus('disconnected');
        setConnectionDetails(null);
        
        toast({
          title: 'Server Connection Failed',
          description: 'Could not get detailed server information',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error("Server connection error:", error);
      setServerStatus('disconnected');
      setConnectionDetails(null);
      
      toast({
        title: 'Server Connection Failed',
        description: 'Could not connect to the backend server. Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setIsRetrying(false);
    }
  };
  
  // Check server on component mount
  useEffect(() => {
    checkServer();
  }, []);
  
  return (
    <div className="flex flex-col items-center">
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm 
        ${serverStatus === 'connected' 
          ? 'bg-green-100 text-green-800' 
          : serverStatus === 'disconnected' 
            ? 'bg-red-100 text-red-800' 
            : 'bg-yellow-100 text-yellow-800'}`}
      >
        <Server size={16} className={serverStatus === 'checking' ? 'animate-pulse' : ''} />
        Server: {serverStatus === 'connected' 
          ? 'Connected' 
          : serverStatus === 'disconnected' 
            ? 'Disconnected' 
            : 'Checking...'}
            
        <Tooltip>
          <Tooltip.Trigger asChild>
            <Button variant="ghost" size="icon" className="h-4 w-4 p-0">
              <HelpCircle size={12} />
              <span className="sr-only">Server connection info</span>
            </Button>
          </Tooltip.Trigger>
          <Tooltip.Content>
            <p className="max-w-xs text-xs">
              {serverStatus === 'connected' 
                ? 'Connected to the backend server successfully.' 
                : 'Unable to connect to the server. You may need to start the server locally or configure the API URL.'}
            </p>
          </Tooltip.Content>
        </Tooltip>
      </div>
      
      {/* Display API URL */}
      <div className="mt-2 text-xs text-gray-500">
        API URL: {apiConnection.getBaseUrl()}
      </div>
      
      {connectionDetails && connectionDetails.database && (
        <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm 
          bg-green-100 text-green-800"
        >
          <Database size={16} />
          Database: {connectionDetails.database.status}
          {connectionDetails.database.name ? ` (${connectionDetails.database.name})` : ''}
        </div>
      )}
      
      {serverStatus === 'disconnected' && (
        <div className="mt-2 text-xs text-red-500 max-w-xs text-center">
          <p>The server is not running or not accessible. If using localhost, make sure to start your server with <code>npm run server</code> in the server directory.</p>
        </div>
      )}
      
      <div className="flex gap-2 mt-3">
        <Button 
          size="sm" 
          variant={serverStatus === 'disconnected' ? "default" : "outline"}
          className="gap-2"
          onClick={checkServer}
          disabled={isRetrying}
        >
          <RefreshCw size={16} className={isRetrying ? 'animate-spin' : ''} />
          {isRetrying ? 'Connecting...' : 'Check Connection'}
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          className="gap-2"
          onClick={() => setShowDetails(!showDetails)}
        >
          <AlertCircle size={16} />
          {showDetails ? 'Hide Details' : 'Show Details'}
        </Button>
      </div>
      
      {showDetails && (
        <div className="mt-4 p-3 bg-gray-50 rounded text-xs w-full max-w-xs overflow-auto">
          <h4 className="font-medium">Connection Details:</h4>
          {connectionDetails ? (
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(connectionDetails, null, 2)}
            </pre>
          ) : (
            <div>
              <p>No connection details available.</p>
              <p className="mt-2">Default API URL: {getEnv('API_URL')}</p>
              <p className="mt-1">Current API URL: {apiConnection.getBaseUrl()}</p>
              <p className="mt-1">Connection Status: {serverStatus}</p>
              <p className="mt-1">Connection Checked: {apiConnection.hasConnectionBeenChecked() ? 'Yes' : 'No'}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ConnectionStatus;
