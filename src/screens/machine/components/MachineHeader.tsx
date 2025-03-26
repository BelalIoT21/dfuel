
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Chip } from 'react-native-paper';

interface MachineHeaderProps {
  machine: {
    name: string;
    image?: string;
    imageUrl?: string;
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

  // Get the image URL, making sure it's properly formatted for the API
  const getProperImageUrl = (url: string) => {
    if (!url) return 'https://placeholder.com/200x200';
    
    // If the URL starts with /utils/images, ensure it has the API URL prefix
    if (url.startsWith('/utils/images')) {
      // For React Native, we need to use the full URL
      // Make sure to use a consistent API URL across the app
      const apiUrl = 'http://localhost:5000'; // Adjust this based on your config
      return `${apiUrl}/api${url}`;
    }
    
    // Handle base64 data URLs directly
    if (url.startsWith('data:')) {
      return url;
    }
    
    return url;
  };
  
  // Get the image URL, preferring imageUrl but falling back to image
  const imageUrl = getProperImageUrl(machine.imageUrl || machine.image || 'https://placeholder.com/200x200');
  
  console.log('MachineHeader - Image URL:', imageUrl);

  return (
    <>
      <Image 
        source={{ uri: imageUrl }}
        style={styles.machineImage}
        resizeMode="cover"
        onError={(e) => {
          console.error('Failed to load image:', imageUrl);
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
