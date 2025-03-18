
import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Chip } from 'react-native-paper';

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

  // Properly set machine types based on ID
  let machineType = machine.type;
  const machineId = String(machine.id);
  
  if (machineId === "1") {
    machineType = "Laser Cutter";
  } else if (machineId === "2") {
    machineType = "3D Printer";
  } else if (machineId === "3") {
    machineType = "X1 E Carbon 3D Printer";
  } else if (machineId === "4") {
    machineType = "Bambu Lab X1 E";
  } else if (machineId === "5") {
    machineType = "Safety Cabinet";
  } else if (machineId === "6") {
    machineType = "Safety Course";
  } else if (!machineType || machineType.trim() === '') {
    machineType = "Machine";
  }
  
  // Only display machineType chip if there's an actual value
  const showMachineType = machineType && machineType.trim() !== '';
  
  // Ensure userCertifications is an array and all elements are strings
  const userCertsAsString = Array.isArray(userCertifications) 
    ? userCertifications.map(cert => String(cert)) 
    : [];
    
  // Check if user is certified for this machine
  const isCertified = userCertsAsString.includes(String(machine.id));

  console.log(`Machine ${machine.id} (${machine.name}) certification status:`, isCertified);
  console.log(`User certifications:`, userCertsAsString);

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('MachineDetail', { 
        machineId: machine.id,
        name: machine.name 
      })}
    >
      <Card style={styles.card}>
        <Card.Cover source={{ uri: machine.image }} style={styles.cardImage} />
        <Card.Content>
          <Title>{machine.name}</Title>
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
