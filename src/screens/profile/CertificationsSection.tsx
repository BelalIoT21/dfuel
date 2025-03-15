
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
      const names: Record<string, string> = {};
      const types: Record<string, string> = {};
      
      // Set special cases first with consistent naming
      names["3"] = "Safety Course";
      types["3"] = "Safety Course";
      names["5"] = "X1 E Carbon 3D Printer";
      types["5"] = "3D Printer";
      names["8"] = "Safety Cabinet";
      types["8"] = "Safety Cabinet";
      names["1"] = "Laser Cutter";
      types["1"] = "Laser Cutter";
      names["2"] = "Ultimaker";
      types["2"] = "3D Printer";
      
      if (user.certifications && user.certifications.length > 0) {
        for (const certId of user.certifications) {
          // Skip special cases we've already handled
          if (["1", "2", "3", "5", "8"].includes(certId)) continue;
          
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
      
      setMachineNames(names);
      setMachineTypes(types);
    };
    
    fetchMachineNames();
  }, [user.certifications]);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Certifications</Text>
      {user.certifications && user.certifications.length > 0 ? (
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
});

export default CertificationsSection;
