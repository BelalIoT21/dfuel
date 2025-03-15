
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Chip } from 'react-native-paper';

interface MachineHeaderProps {
  machine: {
    name: string;
    image: string;
  };
  machineStatus: string;
  isCertified: boolean;
}

const MachineHeader = ({ machine, machineStatus, isCertified }: MachineHeaderProps) => {
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
        return 'Machine Available';
      case 'maintenance':
        return 'Machine Maintenance';
      case 'in-use':
        return 'Machine In Use';
      default:
        return `Machine ${status}`;
    }
  };

  return (
    <>
      <Image 
        source={{ uri: machine.image }}
        style={styles.machineImage}
        resizeMode="cover"
      />
      
      <View style={styles.headerContainer}>
        <Text style={styles.title}>{machine.name}</Text>
        
        <View style={styles.statusContainer}>
          <Chip 
            style={{backgroundColor: getStatusColor(machineStatus) + '20'}}
            textStyle={{color: getStatusColor(machineStatus)}}
          >
            {getStatusLabel(machineStatus)}
          </Chip>
          
          {isCertified && (
            <Chip 
              style={{backgroundColor: '#7c3aed20'}}
              textStyle={{color: '#7c3aed'}}
            >
              Certified
            </Chip>
          )}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  machineImage: {
    width: '100%',
    height: 200,
  },
  headerContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
  },
  statusContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
});

export default MachineHeader;
