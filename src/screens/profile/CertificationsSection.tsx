
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
          // Handle specific machine IDs directly
          if (certId === "1" || certId === 1 || certId === "67d5658be9267b302f7aa015") {
            names[certId] = "Laser Cutter";
            types[certId] = "Machine";
            continue;
          }
          if (certId === "2" || certId === 2 || certId === "67d5658be9267b302f7aa016") {
            names[certId] = "Ultimaker";
            types[certId] = "3D Printer";
            continue;
          }
          if (certId === "3" || certId === 3) {
            names[certId] = "Safety Cabinet";
            types[certId] = "Safety Cabinet";
            continue;
          }
          if (certId === "4" || certId === 4 || certId === "67d5658be9267b302f7aa017") {
            names[certId] = "X1 E Carbon 3D Printer";
            types[certId] = "3D Printer";
            continue;
          }
          if (certId === "5" || certId === 5) {
            names[certId] = "Bambu Lab X1 E";
            types[certId] = "3D Printer";
            continue;
          }
          if (certId === "6" || certId === 6) {
            names[certId] = "Machine Safety Course";
            types[certId] = "Safety Course";
            continue;
          }
          
          try {
            const machine = await machineService.getMachineById(certId.toString());
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

  // Helper function to get machine name with special handling
  const getMachineName = (certId: string) => {
    if (certId === "1" || certId === 1 || certId === "67d5658be9267b302f7aa015") return "Laser Cutter";
    if (certId === "2" || certId === 2 || certId === "67d5658be9267b302f7aa016") return "Ultimaker";
    if (certId === "3" || certId === 3) return "Safety Cabinet";
    if (certId === "4" || certId === 4 || certId === "67d5658be9267b302f7aa017") return "X1 E Carbon 3D Printer";
    if (certId === "5" || certId === 5) return "Bambu Lab X1 E";
    if (certId === "6" || certId === 6) return "Machine Safety Course";
    return machineNames[certId] || `Machine ${certId}`;
  };

  // Helper function to get machine type with special handling
  const getMachineType = (certId: string) => {
    if (certId === "1" || certId === 1 || certId === "67d5658be9267b302f7aa015") return "Machine";
    if (certId === "2" || certId === 2 || certId === "67d5658be9267b302f7aa016") return "3D Printer";
    if (certId === "3" || certId === 3) return "Safety Cabinet";
    if (certId === "4" || certId === 4 || certId === "67d5658be9267b302f7aa017") return "3D Printer";
    if (certId === "5" || certId === 5) return "3D Printer";
    if (certId === "6" || certId === 6) return "Safety Course";
    return machineTypes[certId] || "Machine";
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Certifications</Text>
      {user.certifications && user.certifications.length > 0 ? (
        <List.Section>
          {user.certifications.map((certId) => (
            <List.Item
              key={certId.toString()}
              title={getMachineName(certId.toString())}
              description={getMachineType(certId.toString())}
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
