
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, RefreshControl, ScrollView } from 'react-native';
import { List, ActivityIndicator } from 'react-native-paper';
import { User } from '@/types/database';
import { machineService } from '@/services/machineService';
import { certificationService } from '@/services/certificationService';
import { toast } from '@/components/ui/use-toast';

interface CertificationsSectionProps {
  user: User;
}

// Define special machine IDs
const SPECIAL_MACHINE_IDS = ["5", "6"]; // Safety Cabinet and Safety Course

const CertificationsSection = ({ user }: CertificationsSectionProps) => {
  const [machineNames, setMachineNames] = useState<{[key: string]: string}>({});
  const [machineTypes, setMachineTypes] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userCertifications, setUserCertifications] = useState<string[]>([]);
  const [availableMachineIds, setAvailableMachineIds] = useState<string[]>([]);
  
  const fetchCertifications = async () => {
    try {
      if (user?.id) {
        console.log(`Fetching certifications for user ${user.id}`);
        const certifications = await certificationService.getUserCertifications(user.id);
        console.log(`Received ${certifications.length} certifications from API`);
        setUserCertifications(certifications);
        return certifications;
      }
      return [];
    } catch (error) {
      console.error("Error fetching certifications:", error);
      toast({
        title: "Error",
        description: "Failed to fetch certifications",
        variant: "destructive"
      });
      // Fallback to user object if API fails
      return user.certifications || [];
    }
  };
  
  const fetchMachineNames = async () => {
    setIsLoading(true);
    const names: Record<string, string> = {};
    const types: Record<string, string> = {};
    
    try {
      // Fetch all machines from database
      let databaseMachines: any[] = [];
      try {
        databaseMachines = await machineService.getMachines();
        console.log(`Got ${databaseMachines.length} machines from database`);
        
        // Process machines to get names and types
        databaseMachines.forEach(machine => {
          const id = (machine.id || machine._id).toString();
          names[id] = machine.name;
          types[id] = machine.type || 'Machine';
        });
        
        // Extract machine IDs
        const machineIds = databaseMachines.map(machine => 
          (machine.id || machine._id).toString()
        );
        
        // Add special machine IDs if they're not already in the list
        const combinedMachineIds = [...new Set([...machineIds, ...SPECIAL_MACHINE_IDS])];
        
        // Sort machine IDs numerically to ensure proper order
        const sortedMachineIds = [...combinedMachineIds].sort((a, b) => parseInt(a) - parseInt(b));
        setAvailableMachineIds(sortedMachineIds);
        console.log("Available machine IDs (sorted):", sortedMachineIds);
      } catch (error) {
        console.error("Error fetching machines:", error);
        // In case of error, use special machine IDs as fallback
        setAvailableMachineIds(SPECIAL_MACHINE_IDS);
      }
      
      // Manually add special machines
      names["5"] = "Safety Cabinet";
      types["5"] = "Safety Equipment";
      names["6"] = "Machine Safety Course";
      types["6"] = "Safety Course";
      
      // Get the latest certifications
      const certifications = await fetchCertifications();
      
      // For any certifications that don't have names yet, try to fetch individually
      if (certifications && certifications.length > 0) {
        const unknownCertIds = certifications.filter(certId => !names[certId]);
        
        if (unknownCertIds.length > 0) {
          console.log("Unknown certification IDs:", unknownCertIds);
          
          // Try to fetch each unknown machine
          for (const certId of unknownCertIds) {
            try {
              // Check if this is a special machine ID
              if (SPECIAL_MACHINE_IDS.includes(certId)) {
                continue; // Already added above
              }
              
              const machine = await machineService.getMachineById(certId);
              if (machine) {
                names[certId] = machine.name;
                types[certId] = machine.type || 'Machine';
              } else {
                // If machine not found, mark for cleanup but don't add to display
                console.log(`Machine ${certId} no longer exists, will be filtered out`);
              }
            } catch (error) {
              console.error(`Error fetching machine ${certId}:`, error);
              // Don't add to names/types - will effectively filter it out
            }
          }
        }
      }
    } catch (error) {
      console.error("Error in fetchMachineNames:", error);
    } finally {
      setMachineNames(names);
      setMachineTypes(types);
      setIsLoading(false);
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    fetchMachineNames();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMachineNames();
  };

  // Filter certifications - only show certifications for machines that exist in the database
  const filterCertifications = (certifications: string[]) => {
    if (!certifications) return [];
    
    // Filter out certifications for machines that don't exist anymore
    const validCertifications = certifications.filter(certId => {
      // Always include special machines (Safety Cabinet and Safety Course)
      if (SPECIAL_MACHINE_IDS.includes(certId)) {
        return true;
      }
      
      // Only include if machine exists AND we have a name for it
      return availableMachineIds.includes(certId) && machineNames[certId];
    });
    
    // Sort certifications by ID to ensure proper display order
    return validCertifications.sort((a, b) => parseInt(a) - parseInt(b));
  };

  console.log("User certifications in CertificationsSection:", userCertifications);
  console.log("Available machine IDs:", availableMachineIds);
  console.log("Machine names keys:", Object.keys(machineNames));

  const sortedCertifications = filterCertifications(userCertifications);

  // Check if user has safety certification
  const hasSafetyCertification = userCertifications.includes('6');

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Certifications</Text>
        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={onRefresh}
          disabled={refreshing}
        >
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
      
      {!hasSafetyCertification && (
        <View style={styles.safetyAlert}>
          <Text style={styles.safetyAlertTitle}>Safety Course Required</Text>
          <Text style={styles.safetyAlertText}>
            You need to complete the Machine Safety Course to get certified for other machines.
          </Text>
        </View>
      )}
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#7c3aed" size="small" />
          <Text style={styles.loadingText}>Loading certifications...</Text>
        </View>
      ) : sortedCertifications && sortedCertifications.length > 0 ? (
        <ScrollView 
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          style={styles.scrollContainer}
        >
          <List.Section>
            {sortedCertifications.map((certId) => (
              <List.Item
                key={certId}
                title={machineNames[certId] || `Machine ${certId}`}
                description={machineTypes[certId] || "Machine"}
                left={(props) => <List.Icon {...props} icon="certificate" color="#7c3aed" />}
              />
            ))}
          </List.Section>
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No certifications yet</Text>
          <Text style={styles.emptySubText}>Get certified to use machines in the lab</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  refreshButton: {
    padding: 4,
  },
  refreshButtonText: {
    color: '#7c3aed',
    fontSize: 14,
  },
  scrollContainer: {
    maxHeight: 300,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#6b7280',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 16,
  },
  emptySubText: {
    color: '#9ca3af',
    textAlign: 'center',
    fontSize: 14,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
  },
  safetyAlert: {
    backgroundColor: '#fff9db',
    borderColor: '#ffd43b',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  safetyAlertTitle: {
    fontWeight: 'bold',
    color: '#e67700',
    marginBottom: 4,
  },
  safetyAlertText: {
    color: '#805500',
    fontSize: 14,
  },
});

export default CertificationsSection;
