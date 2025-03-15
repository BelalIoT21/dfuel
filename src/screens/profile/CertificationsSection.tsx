
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
          // Skip fetch for Machine Safety Course and special case for Bambu X1
          if (certId === "6") continue; 
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
            }
          } catch (error) {
            console.error(`Error fetching machine ${certId}:`, error);
          }
        }
      }
      setMachineNames(names);
      setMachineTypes(types);
    };
    
    fetchMachineNames();
  }, [user.certifications]);

  // Filter out Machine Safety Course (ID: "6")
  const filteredCertifications = user.certifications.filter(certId => certId !== "6");

  // Helper function to get machine name with special handling for Bambu Lab X1 E
  const getMachineName = (certId: string) => {
    if (certId === "5") return "Bambu Lab X1 E";
    if (certId === "3") return "Safety Cabinet";
    return machineNames[certId] || `Machine ${certId}`;
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Certifications</Text>
      {filteredCertifications && filteredCertifications.length > 0 ? (
        <List.Section>
          {filteredCertifications.map((certId) => (
            <List.Item
              key={certId}
              title={getMachineName(certId)}
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
});

export default CertificationsSection;
