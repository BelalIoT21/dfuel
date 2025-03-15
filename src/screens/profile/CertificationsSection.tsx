
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
  
  useEffect(() => {
    const fetchMachineNames = async () => {
      const names = {};
      const types = {};
      if (user.certifications && user.certifications.length > 0) {
        for (const certId of user.certifications) {
          // Handle special cases directly
          if (certId === "6") {
            names[certId] = "Machine Safety Course";
            types[certId] = "Safety Course";
            continue;
          }
          if (certId === "5") {
            names[certId] = "Bambu Lab X1 E";
            types[certId] = "3D Printer";
            continue;
          }
          if (certId === "3") {
            names[certId] = "Safety Cabinet";
            types[certId] = "Safety Cabinet";
            continue;
          }
          
          try {
            const machine = await machineService.getMachineById(certId);
            if (machine) {
              names[certId] = machine.name;
              types[certId] = machine.type || 'Machine';
            } else {
              // MongoDB IDs handling
              if (certId.length === 24 && /^[0-9a-f]{24}$/i.test(certId)) {
                try {
                  // Try to get machine by MongoDB ID
                  const mongoMachine = await machineService.getMachineByMongoId(certId);
                  if (mongoMachine) {
                    names[certId] = mongoMachine.name;
                    types[certId] = mongoMachine.type || 'Machine';
                    continue;
                  }
                } catch (mongoError) {
                  console.error(`Error fetching MongoDB machine ${certId}:`, mongoError);
                }
              }
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
      setMachineNames(names);
      setMachineTypes(types);
    };
    
    fetchMachineNames();
  }, [user.certifications]);

  // Helper function to get machine name with special handling
  const getMachineName = (certId: string) => {
    if (certId === "6") return "Machine Safety Course";
    if (certId === "5") return "Bambu Lab X1 E";
    if (certId === "3") return "Safety Cabinet";
    
    // MongoDB ID handling
    if (certId.length === 24 && /^[0-9a-f]{24}$/i.test(certId)) {
      return machineNames[certId] || `Machine ${certId}`;
    }
    
    return machineNames[certId] || `Machine ${certId}`;
  };

  // Helper function to get machine type with special handling
  const getMachineType = (certId: string) => {
    if (certId === "6") return "Safety Course";
    if (certId === "5") return "3D Printer";
    if (certId === "3") return "Safety Cabinet";
    return machineTypes[certId] || "Machine";
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Certifications</Text>
      {user.certifications && user.certifications.length > 0 ? (
        <List.Section>
          {user.certifications.map((certId) => (
            <List.Item
              key={certId}
              title={getMachineName(certId)}
              description={getMachineType(certId)}
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
});

export default CertificationsSection;
