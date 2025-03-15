
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { List } from 'react-native-paper';
import { User } from '@/types/database';
import { machineService } from '@/services/machineService';

interface CertificationsSectionProps {
  user: User;
}

const CertificationsSection = ({ user }: CertificationsSectionProps) => {
  const [machineNames, setMachineNames] = useState<{[key: string]: string}>({});
  const [machineTypes, setMachineTypes] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchMachineNames = async () => {
      setIsLoading(true);
      const names: Record<string, string> = {};
      const types: Record<string, string> = {};
      
      // Set consistent naming for special cases
      names["6"] = "Machine Safety Course";
      types["6"] = "Safety Course";
      names["3"] = "Safety Cabinet";
      types["3"] = "Safety Cabinet";
      names["1"] = "Laser Cutter";
      types["1"] = "Laser Cutter";
      names["2"] = "Ultimaker";
      types["2"] = "3D Printer";
      names["4"] = "Bambu Lab X1 E"; 
      types["4"] = "3D Printer";     
      names["5"] = "Bambu Lab X1 E";
      types["5"] = "3D Printer";
      names["7"] = "X1 E Carbon 3D Printer";
      types["7"] = "3D Printer";
      
      if (user.certifications && user.certifications.length > 0) {
        // First try to get all machines at once to avoid multiple API calls
        try {
          const allMachines = await machineService.getMachines();
          console.log(`Got ${allMachines.length} machines to map certifications`);
          
          // Create a map for quick lookup
          const machineMap = {};
          allMachines.forEach(machine => {
            if (machine.id) {
              machineMap[machine.id] = machine;
            }
          });
          
          // Process certifications
          for (const certId of user.certifications) {
            // Skip special cases we've already handled
            if (["1", "2", "3", "4", "5", "6", "7"].includes(certId)) continue;
            
            // First check our map
            if (machineMap[certId]) {
              names[certId] = machineMap[certId].name;
              types[certId] = machineMap[certId].type || 'Machine';
              continue;
            }
            
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
        } catch (error) {
          console.error("Failed to fetch machines:", error);
          // Fall back to individual fetches
          for (const certId of user.certifications) {
            // Skip special cases we've already handled
            if (["1", "2", "3", "4", "5", "6", "7"].includes(certId)) continue;
            
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
      }
      
      setMachineNames(names);
      setMachineTypes(types);
      setIsLoading(false);
    };
    
    fetchMachineNames();
  }, [user.certifications]);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Certifications</Text>
      {isLoading ? (
        <Text style={styles.loadingText}>Loading certifications...</Text>
      ) : user.certifications && user.certifications.length > 0 ? (
        <List.Section>
          {user.certifications.map((certId) => (
            <List.Item
              key={certId}
              title={machineNames[certId] || `Machine ${certId}`}
              description={machineTypes[certId] || "Machine"}
              left={(props) => <List.Icon {...props} icon="certificate" color="#7c3aed" />}
            />
          ))}
        </List.Section>
      ) : (
        <Text style={styles.emptyText}>No certifications yet</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
  },
  emptyText: {
    color: '#6b7280',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 10,
  },
  loadingText: {
    color: '#6b7280',
    textAlign: 'center',
    marginVertical: 10,
  },
});

export default CertificationsSection;
