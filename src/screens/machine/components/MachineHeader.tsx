
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Chip } from 'react-native-paper';

interface MachineHeaderProps {
  machine: {
    name: string;
    image?: string;
    imageUrl?: string;
    id?: string;
    _id?: string;
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

  // Get the image URL with proper fallbacks - simplified to match CourseForm behavior
  const getImageSource = () => {
    console.log('MachineHeader - Machine:', machine);
    console.log('MachineHeader - Image source:', machine.imageUrl || machine.image || 'none');
    
    // Check for machine ID to use local images for known machines
    const machineId = machine?.id || machine?._id;
    
    if (machineId) {
      // Use local images for known machine IDs
      switch(String(machineId)) {
        case '1': return require('../../../assets/images/IMG_7814.jpg');
        case '2': return require('../../../assets/images/IMG_7773.jpg');
        case '3': return require('../../../assets/images/IMG_7768.jpg');
        case '4': return require('../../../assets/images/IMG_7769.jpg');
        case '5': return require('../../../assets/images/IMG_7775.jpg');
        case '6': return require('../../../assets/images/IMG_7821.jpg');
      }
    }
    
    // Simply use the imageUrl or image property if it exists
    if (machine.imageUrl) {
      // For data URLs and complete URLs
      if (machine.imageUrl.startsWith('data:') || machine.imageUrl.startsWith('http')) {
        return { uri: machine.imageUrl };
      }
      
      // For server paths
      if (machine.imageUrl.startsWith('/utils/images')) {
        return { uri: `http://localhost:4000${machine.imageUrl}` };
      }
      
      // For any other case, try to use it directly
      return { uri: machine.imageUrl };
    }
    
    // Same logic for image property as fallback
    if (machine.image) {
      // For data URLs and complete URLs
      if (machine.image.startsWith('data:') || machine.image.startsWith('http')) {
        return { uri: machine.image };
      }
      
      // For server paths
      if (machine.image.startsWith('/utils/images')) {
        return { uri: `http://localhost:4000${machine.image}` };
      }
      
      // For any other case, try to use it directly
      return { uri: machine.image };
    }
    
    // Default fallback image
    return require('../../../assets/images/placeholder.jpg');
  };

  return (
    <>
      <Image 
        source={getImageSource()}
        style={styles.machineImage}
        resizeMode="cover"
        onError={(e) => {
          console.error('Failed to load image', e.nativeEvent.error);
        }}
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
