
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, AlertCircle, Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';

// Define special machine IDs
const SPECIAL_MACHINE_IDS = ["5", "6"]; // Safety Cabinet and Safety Course

const CertificationsCard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [machines, setMachines] = useState<any[]>([]);
  const [userCertifications, setUserCertifications] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Function to fetch certifications directly from MongoDB via API
  const fetchCertifications = async () => {
    if (!user?.id) return [];
    
    try {
      setRefreshing(true);
      console.log(`Fetching certifications for user ${user.id}`);
      
      // Ensure user ID is formatted correctly (as a string)
      const userId = String(user.id);
      
      // Direct API call to MongoDB - use the correct endpoint format
      try {
        console.log(`Fetching certifications directly from MongoDB API for user ID: ${userId}`);
        const apiUrl = import.meta.env.VITE_API_URL || window.location.origin.replace(':5000', ':4000');
        
        // Make sure we're using the correct URL format
        const response = await fetch(`${apiUrl}/api/certifications/user/${userId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('API response for certifications:', data);
          
          // Ensure we always have an array of strings
          if (Array.isArray(data)) {
            const certStrings = data.map(cert => String(cert));
            console.log(`Received ${certStrings.length} certifications from API:`, certStrings);
            setUserCertifications(certStrings);
            setRefreshing(false);
            return certStrings;
          } else {
            console.error('API returned non-array data:', data);
            // If data is not an array, check if it's in a response structure
            if (data && Array.isArray(data.certifications)) {
              const certStrings = data.certifications.map((cert: any) => String(cert));
              setUserCertifications(certStrings);
              setRefreshing(false);
              return certStrings;
            }
          }
        } else {
          console.error(`Failed to fetch certifications from API: ${response.status} - ${response.statusText}`);
          console.log('Response URL:', response.url);
          
          // Try falling back to user object certifications
          if (user.certifications && Array.isArray(user.certifications)) {
            const userCerts = user.certifications.map(cert => String(cert));
            console.log('Using certifications from user object:', userCerts);
            setUserCertifications(userCerts);
            setRefreshing(false);
            return userCerts;
          }
        }
      } catch (apiError) {
        console.error("Error fetching certifications from MongoDB API:", apiError);
      }
      
      // Check if user object has certifications as a final fallback
      if (user.certifications && Array.isArray(user.certifications)) {
        const userCerts = user.certifications.map(cert => String(cert));
        console.log('Using certifications from user object as fallback:', userCerts);
        setUserCertifications(userCerts);
        setRefreshing(false);
        return userCerts;
      }
      
      // Final fallback to default (empty array)
      setRefreshing(false);
      return [];
    } catch (error) {
      console.error("Error in fetchCertifications:", error);
      setRefreshing(false);
      toast({
        title: "Error",
        description: "Could not load your certifications. Please try again.",
        variant: "destructive"
      });
      return [];
    }
  };
  
  // Function to fetch machines
  const fetchMachines = async () => {
    try {
      console.log("Fetching available machines");
      const response = await fetch(`${import.meta.env.VITE_API_URL || window.location.origin.replace(':5000', ':4000')}/api/machines`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const allMachines = await response.json();
        console.log(`Fetched ${allMachines.length} machines`);
        
        // Process and standardize machine data
        const processedMachines = allMachines.map(machine => {
          const id = (machine.id || machine._id).toString();
          return {
            id,
            name: machine.name || `Machine ${id}`,
            type: machine.type || 'Machine'
          };
        });
        
        // Add special machines if they don't exist
        if (!processedMachines.some(m => m.id === "5")) {
          processedMachines.push({
            id: "5",
            name: "Safety Cabinet",
            type: "Safety Equipment"
          });
        }
        
        if (!processedMachines.some(m => m.id === "6")) {
          processedMachines.push({
            id: "6",
            name: "Machine Safety Course",
            type: "Safety Course"
          });
        }
        
        // Sort machines by ID
        const sortedMachines = processedMachines.sort((a, b) => parseInt(a.id) - parseInt(b.id));
        setMachines(sortedMachines);
      } else {
        console.error('Failed to fetch machines:', response.status);
        
        // Add fallback for special machines
        setMachines([
          { id: "5", name: "Safety Cabinet", type: "Safety Equipment" },
          { id: "6", name: "Machine Safety Course", type: "Safety Course" }
        ]);
      }
    } catch (error) {
      console.error("Error fetching machines:", error);
      toast({
        title: "Error",
        description: "Could not load machine data. Please try again.",
        variant: "destructive"
      });
      
      // Add fallback for special machines
      setMachines([
        { id: "5", name: "Safety Cabinet", type: "Safety Equipment" },
        { id: "6", name: "Machine Safety Course", type: "Safety Course" }
      ]);
    }
  };
  
  // Initial load of data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCertifications(), fetchMachines()]);
      setLoading(false);
    };
    
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);
  
  // Handle manual refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCertifications();
    setRefreshing(false);
  };
  
  // Determine if user has safety certification (required for other machines)
  const hasSafetyCertification = userCertifications.includes('6');
  
  // Filter certifications to those that the user has
  const userMachines = machines.filter(machine => {
    return userCertifications.includes(machine.id);
  });
  
  // Function to display readable time since certification
  const getTimeSince = () => {
    return "recently"; // Placeholder - could be enhanced with actual timestamps
  };
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-purple-600" />
            Your Certifications
          </CardTitle>
          <CardDescription>Machines you are certified to use</CardDescription>
        </CardHeader>
        <CardContent className="h-40 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading your certifications...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-purple-600" />
            Your Certifications
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-8 px-2"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
        <CardDescription>Machines you are certified to use</CardDescription>
      </CardHeader>
      
      <CardContent>
        {!hasSafetyCertification && (
          <Alert className="mb-4 bg-amber-50 text-amber-800 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-800" />
            <AlertTitle>Safety course required</AlertTitle>
            <AlertDescription>
              You need to complete the Machine Safety Course to get certified for other machines.
            </AlertDescription>
          </Alert>
        )}
        
        {userMachines.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">You don't have any certifications yet.</p>
            <p className="text-sm text-gray-400 mt-1">Complete the safety course to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {userMachines.map(machine => (
              <div key={machine.id} className="flex items-center justify-between p-3 border rounded-md">
                <div>
                  <div className="font-medium">{machine.name}</div>
                  <div className="text-sm text-gray-500">{machine.type}</div>
                </div>
                <div className="flex items-center text-green-600">
                  <Check className="h-4 w-4 mr-1" />
                  <span className="text-xs">{getTimeSince()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <p className="text-xs text-gray-500">
          Certifications are required to book machines.
        </p>
      </CardFooter>
    </Card>
  );
};

export default CertificationsCard;
