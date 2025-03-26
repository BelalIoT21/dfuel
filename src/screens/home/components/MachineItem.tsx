
import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Chip } from 'react-native-paper';

// Define consistent machine types
const MACHINE_TYPES = {
  "1": "Laser Cutter",
  "2": "3D Printer",
  "3": "3D Printer",
  "4": "3D Printer",
  "5": "Safety Equipment",
  "6": "Safety Course"
  // No need to define future machine IDs as they will be handled dynamically
};

// Define consistent machine names
const MACHINE_NAMES = {
  "1": "Laser Cutter",
  "2": "Ultimaker",
  "3": "X1 E Carbon 3D Printer",
  "4": "Bambu Lab X1 E",
  "5": "Safety Cabinet",
  "6": "Safety Course"
  // No need to define future machine IDs as they will be handled dynamically
};

const MachineItem = ({ machine, navigation, userCertifications = [] }) => {
  const getStatusColor = (status) => {
    switch(status) {
      case 'available':
        return '#22c55e'; // green-500
      case 'maintenance':
        return '#ef4444'; // red-500
      case 'in-use':
        return '#f59e0b'; // amber-500
      default:
        return '#6b7280'; // gray-500
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'available':
        return 'Available';
      case 'maintenance':
        return 'Maintenance';
      case 'in-use':
        return 'In Use';
      default:
        return status;
    }
  };

  // Get the correct machine name and type based on ID
  const machineId = String(machine.id || machine._id);
  
  // Prioritize name and type from the machine object, fall back to constants only if needed
  const machineName = machine.name || MACHINE_NAMES[machineId] || "Unknown Machine";
  const machineType = machine.type || MACHINE_TYPES[machineId] || "Machine";
  
  // Only display machineType chip if there's an actual value
  const showMachineType = machineType && machineType.trim() !== '';
  
  // Convert certifications to array of strings for consistent comparison
  const certsArray = Array.isArray(userCertifications) 
    ? userCertifications.map(cert => String(cert))
    : [];
    
  // Check if user is certified for this machine
  const isCertified = certsArray.includes(machineId);

  console.log(`Machine ${machineId} (${machineName}) certification status:`, isCertified);
  console.log(`Machine ID:`, machineId);
  console.log(`User certifications:`, certsArray);

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('MachineDetail', { 
        machineId: machineId,
        name: machineName
      })}
    >
      <Card style={styles.card}>
        <Card.Cover source={{ uri: machine.image || machine.imageUrl || '/placeholder.svg' }} style={styles.cardImage} />
        <Card.Content>
          <Title>{machineName}</Title>
          <Paragraph numberOfLines={2} style={styles.description}>{machine.description}</Paragraph>
          <View style={styles.chipContainer}>
            <Chip 
              style={{backgroundColor: getStatusColor(machine.status) + '20'}}
              textStyle={{color: getStatusColor(machine.status)}}
            >
              {getStatusLabel(machine.status)}
            </Chip>
            
            {showMachineType && (
              <Chip 
                style={{backgroundColor: '#3b82f620'}}
                textStyle={{color: '#3b82f6'}}
              >
                {machineType}
              </Chip>
            )}
            
            {isCertified && (
              <Chip 
                style={{backgroundColor: '#7c3aed20'}}
                textStyle={{color: '#7c3aed'}}
              >
                Certified
              </Chip>
            )}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  cardImage: {
    height: 160,
  },
  description: {
    marginBottom: 8,
    color: '#4b5563', // gray-700
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
});

export default MachineItem;
