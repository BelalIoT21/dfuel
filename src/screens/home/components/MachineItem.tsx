
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

  const isCertified = userCertifications.includes(machine.id);

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
