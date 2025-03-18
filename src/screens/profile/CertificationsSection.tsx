
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, RefreshControl, ScrollView } from 'react-native';
import { List, ActivityIndicator } from 'react-native-paper';
import { User } from '@/types/database';
import { machineService } from '@/services/machineService';
import { certificationService } from '@/services/certificationService';
import { toast } from '@/components/ui/use-toast';

interface CertificationsSectionProps {
  user: User;
  navigation?: any; // Optional navigation prop
}

// Define known machines with correct ID mappings for fallback
const KNOWN_MACHINES = {
  "1": { name: "Laser Cutter", type: "Laser Cutter" },
  "3": { name: "X1 E Carbon 3D Printer", type: "3D Printer" },
  "4": { name: "Bambu Lab X1 E", type: "3D Printer" },
  "5": { name: "Safety Cabinet", type: "Safety Cabinet" },
  "6": { name: "Safety Course", type: "Safety Course" },
};

// Define special machine IDs that should always be displayed
const SPECIAL_MACHINE_IDS = ["5", "6"]; // Safety Cabinet and Safety Course

const CertificationsSection = ({ user, navigation }: CertificationsSectionProps) => {
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
      // Fetch available machines first to know which ones exist
      try {
        const allMachines = await machineService.getMachines();
        console.log(`Got ${allMachines.length} machines to check which ones still exist`);
        
        // Extract IDs from available machines
        const machineIds = allMachines.map(machine => 
          (machine.id || machine._id).toString()
        );
        setAvailableMachineIds(machineIds);
        console.log("Available machine IDs:", machineIds);
      } catch (error) {
        console.error("Error fetching machines:", error);
        // In case of error, use all known machines as fallback
        setAvailableMachineIds(Object.keys(KNOWN_MACHINES));
      }
      
      // First populate with known machines for fallback - ensure correct ID mapping
      Object.entries(KNOWN_MACHINES).forEach(([id, machine]) => {
        names[id] = machine.name;
        types[id] = machine.type;
      });
      
      // Get the latest certifications
      const certifications = await fetchCertifications();
      
      // Filter certifications to only include actually available machines or special machines (5 and 6)
      const validCertifications = certifications.filter(certId => 
        availableMachineIds.includes(certId) || 
        SPECIAL_MACHINE_IDS.includes(certId)
      );
      console.log(`Filtered from ${certifications.length} to ${validCertifications.length} valid certifications`);
      
      if (validCertifications && validCertifications.length > 0) {
        // Only fetch unknown machines
        const unknownCertIds = validCertifications.filter(
          certId => !KNOWN_MACHINES[certId]
        );
        
        if (unknownCertIds.length > 0) {
          try {
            const allMachines = await machineService.getMachines();
            console.log(`Got ${allMachines.length} machines to map unknown certifications`);
            
            // Create a map for quick lookup
            const machineMap = {};
            allMachines.forEach(machine => {
              if (machine.id) {
                machineMap[machine.id] = machine;
              }
            });
            
            // Process unknown certifications
            for (const certId of unknownCertIds) {
              // Check our map
              if (machineMap[certId]) {
                names[certId] = machineMap[certId].name;
                types[certId] = machineMap[certId].type || 'Machine';
              } else {
                // If not in the map, try individual fetch
                try {
                  const machine = await machineService.getMachineById(certId);
                  if (machine) {
                    names[certId] = machine.name;
                    types[certId] = machine.type || 'Machine';
                  } else {
                    names[certId] = `Machine ${certId}`;
                    types[certId] = 'Machine';
                  }
                } catch (error) {
                  console.error(`Error fetching machine ${certId}:`, error);
                  names[certId] = `Machine ${certId}`;
                  types[certId] = 'Machine';
                }
              }
            }
          } catch (error) {
            console.error("Failed to fetch machines:", error);
            // Fall back to simple names for unknowns
            unknownCertIds.forEach(certId => {
              names[certId] = `Machine ${certId}`;
              types[certId] = 'Machine';
            });
          }
        }
      }
      
      // Update state with valid certifications
      setUserCertifications(validCertifications);
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

  const handleBackToDashboard = () => {
    if (navigation) {
      navigation.navigate('Home');
    }
  };

  // Filter certifications to exclude machines not in availableMachineIds, except for special machines
  const filterCertifications = (certifications: string[]) => {
    if (!certifications) return [];
    
    return certifications.filter(certId => {
      // Always include special machines (safety cabinet and safety course)
      // and also include if it's in the available machines from API
      const isAvailableMachine = SPECIAL_MACHINE_IDS.includes(certId) || 
                                availableMachineIds.includes(certId);
                                
      const machineName = machineNames[certId]?.toLowerCase();
      // Filter out "cnc mill" machine
      return machineName && machineName !== "cnc mill" && isAvailableMachine;
    });
  };

  console.log("User certifications in CertificationsSection:", userCertifications);

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Certifications</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBackToDashboard}
          >
            <Text style={styles.buttonText}>Back to Dashboard</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={onRefresh}
            disabled={refreshing}
          >
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#7c3aed" size="small" />
          <Text style={styles.loadingText}>Loading certifications...</Text>
        </View>
      ) : userCertifications && userCertifications.length > 0 ? (
        <ScrollView 
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <List.Section>
            {filterCertifications(userCertifications).map((certId) => (
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  refreshButton: {
    padding: 4,
    marginLeft: 8,
  },
  backButton: {
    padding: 4,
  },
  buttonText: {
    color: '#7c3aed',
    fontSize: 14,
  },
  refreshButtonText: {
    color: '#7c3aed',
    fontSize: 14,
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
});

export default CertificationsSection;
