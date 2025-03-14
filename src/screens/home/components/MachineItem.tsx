
import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Chip, IconButton } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

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

  const isCertified = userCertifications.includes(machine.id);
  const isLocked = machine.isLocked;

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('MachineDetail', { 
        machineId: machine.id,
        name: machine.name 
      })}
      disabled={false} // Even if locked, we should allow navigation to show safety warning
    >
      <Card style={styles.card}>
        <Card.Cover source={{ uri: machine.image }} style={styles.cardImage} />
        {isLocked && (
          <View style={styles.lockedOverlay}>
            <MaterialIcons name="lock" size={32} color="#ffffff" />
          </View>
        )}
        <Card.Content>
          <View style={styles.titleContainer}>
            <Title>{machine.name}</Title>
            {isLocked && (
              <MaterialIcons name="lock" size={24} color="#7c3aed" />
            )}
          </View>
          <Paragraph numberOfLines={2} style={styles.description}>{machine.description}</Paragraph>
          <View style={styles.chipContainer}>
            <Chip 
              style={{backgroundColor: getStatusColor(machine.status) + '20'}}
              textStyle={{color: getStatusColor(machine.status)}}
            >
              {getStatusLabel(machine.status)}
            </Chip>
            {isCertified && (
              <Chip 
                style={{backgroundColor: '#7c3aed20'}}
                textStyle={{color: '#7c3aed'}}
              >
                Certified
              </Chip>
            )}
            {isLocked && (
              <Chip 
                style={{backgroundColor: '#6b728020'}}
                textStyle={{color: '#6b7280'}}
              >
                Safety Required
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
  lockedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  }
});

export default MachineItem;
