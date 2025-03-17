
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, RefreshControl, ScrollView } from 'react-native';
import { List, ActivityIndicator } from 'react-native-paper';
import { User } from '@/types/database';
import { machineService } from '@/services/machineService';
import { certificationService } from '@/services/certificationService';

interface CertificationsSectionProps {
  user: User;
}

// Define known machines to avoid excessive API calls
const KNOWN_MACHINES = {
  "1": { name: "Laser Cutter", type: "Laser Cutter" },
  "2": { name: "Ultimaker", type: "3D Printer" },
  "3": { name: "X1 E Carbon 3D Printer", type: "3D Printer" },
  "4": { name: "Bambu Lab X1 E", type: "3D Printer" },
  "5": { name: "Safety Cabinet", type: "Safety Cabinet" },
  "6": { name: "Safety Course", type: "Safety Course" },
};

const CertificationsSection = ({ user }: CertificationsSectionProps) => {
  const [machineNames, setMachineNames] = useState<{[key: string]: string}>({});
  const [machineTypes, setMachineTypes] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const fetchMachineNames = async () => {
    setIsLoading(true);
    const names: Record<string, string> = {};
    const types: Record<string, string> = {};
    
    try {
      // First populate with known machines
      Object.entries(KNOWN_MACHINES).forEach(([id, machine]) => {
        names[id] = machine.name;
        types[id] = machine.type;
      });
      
      // Get the latest certifications directly from the service
      let userCertifications = user.certifications;
      try {
        const fetchedCertifications = await certificationService.getUserCertifications(user.id);
        if (Array.isArray(fetchedCertifications) && fetchedCertifications.length > 0) {
          userCertifications = fetchedCertifications;
          console.log("Fetched user certifications:", fetchedCertifications);
        }
      } catch (error) {
        console.error("Error fetching certifications:", error);
      }
      
      if (userCertifications && userCertifications.length > 0) {
        // Only fetch unknown machines
        const unknownCertIds = userCertifications.filter(
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
  }, [user.certifications]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMachineNames();
  };

  // Filter certifications to exclude "CNC Mill" before displaying
  const filterCertifications = (certifications: string[]) => {
    if (!certifications) return [];
    return certifications.filter(certId => {
      const machineName = machineNames[certId]?.toLowerCase();
      return machineName && machineName !== "cnc mill";
    });
  };

  console.log("User certifications in CertificationsSection:", user.certifications);

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
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#7c3aed" size="small" />
          <Text style={styles.loadingText}>Loading certifications...</Text>
        </View>
      ) : user.certifications && user.certifications.length > 0 ? (
        <ScrollView 
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <List.Section>
            {filterCertifications(user.certifications).map((certId) => (
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
