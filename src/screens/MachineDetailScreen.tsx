
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { Button, Card, Title, Paragraph, Chip, Divider, ActivityIndicator } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { machines } from '../utils/data';
import userDatabase from '../services/userDatabase';

const MachineDetailScreen = ({ route, navigation }) => {
  const { machineId } = route.params;
  const { user, addCertification } = useAuth();
  const [machine, setMachine] = useState(null);
  const [machineStatus, setMachineStatus] = useState('available');
  const [loading, setLoading] = useState(true);
  const [isCertified, setIsCertified] = useState(false);

  useEffect(() => {
    if (!user) {
      navigation.replace('Login');
      return;
    }

    const loadMachineDetails = async () => {
      try {
        setLoading(true);
        const machineData = machines.find(m => m.id === machineId);
        
        if (!machineData) {
          Alert.alert('Error', 'Machine not found');
          navigation.goBack();
          return;
        }
        
        const status = await userDatabase.getMachineStatus(machineId);
        setMachineStatus(status || 'available');
        setMachine(machineData);
        
        // Check if user is certified for this machine
        if (user.certifications && user.certifications.includes(machineId)) {
          setIsCertified(true);
        }
      } catch (error) {
        console.error('Error loading machine details:', error);
        Alert.alert('Error', 'Failed to load machine details');
      } finally {
        setLoading(false);
      }
    };
    
    loadMachineDetails();
  }, [machineId, user, navigation]);

  const handleTakeCourse = () => {
    navigation.navigate('Course', { machineId });
  };

  const handleTakeQuiz = () => {
    navigation.navigate('Quiz', { machineId });
  };

  const handleBookMachine = () => {
    navigation.navigate('Booking', { machineId });
  };

  const handleGetCertified = async () => {
    try {
      const success = await addCertification(machineId);
      if (success) {
        setIsCertified(true);
        Alert.alert('Success', 'You are now certified for this machine!');
      } else {
        Alert.alert('Error', 'Failed to get certified');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Something went wrong');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text style={styles.loadingText}>Loading machine details...</Text>
      </View>
    );
  }

  if (!machine) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Machine not found</Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>Go Back</Button>
      </View>
    );
  }

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

  return (
    <ScrollView style={styles.container}>
      <Image 
        source={{ uri: machine.image }}
        style={styles.machineImage}
        resizeMode="cover"
      />
      
      <View style={styles.contentContainer}>
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
              style={{backgroundColor: '#3b82f620'}}
              textStyle={{color: '#3b82f6'}}
            >
              Certified
            </Chip>
          )}
        </View>
        
        <Card style={styles.card}>
          <Card.Content>
            <Title>Description</Title>
            <Paragraph>{machine.description}</Paragraph>
          </Card.Content>
        </Card>
        
        <Card style={styles.card}>
          <Card.Content>
            <Title>Requirements</Title>
            <View style={styles.requirementsList}>
              <View style={styles.requirementItem}>
                <Text style={styles.requirementLabel}>Course</Text>
                <Text style={styles.requirementValue}>Required</Text>
              </View>
              <Divider style={styles.divider} />
              <View style={styles.requirementItem}>
                <Text style={styles.requirementLabel}>Quiz</Text>
                <Text style={styles.requirementValue}>Required</Text>
              </View>
              <Divider style={styles.divider} />
              <View style={styles.requirementItem}>
                <Text style={styles.requirementLabel}>Certification</Text>
                <Text style={styles.requirementValue}>
                  {isCertified ? 'Completed' : 'Required'}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
        
        <View style={styles.actionContainer}>
          <Button 
            mode="contained" 
            icon="book-open-variant" 
            style={styles.actionButton}
            onPress={handleTakeCourse}
          >
            Take Course
          </Button>
          
          <Button 
            mode="contained" 
            icon="clipboard-list" 
            style={styles.actionButton}
            onPress={handleTakeQuiz}
          >
            Take Quiz
          </Button>
          
          {!isCertified && (
            <Button 
              mode="contained" 
              icon="certificate" 
              style={styles.actionButton}
              onPress={handleGetCertified}
            >
              Get Certified
            </Button>
          )}
          
          {machineStatus === 'available' && isCertified && (
            <Button 
              mode="contained" 
              icon="calendar-plus" 
              style={[styles.actionButton, {backgroundColor: '#22c55e'}]}
              onPress={handleBookMachine}
            >
              Book Machine
            </Button>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f3ff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f3ff',
  },
  loadingText: {
    marginTop: 10,
    color: '#7c3aed',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    marginBottom: 20,
  },
  machineImage: {
    width: '100%',
    height: 200,
  },
  contentContainer: {
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
  card: {
    marginBottom: 16,
  },
  requirementsList: {
    marginTop: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  requirementLabel: {
    fontSize: 16,
    color: '#4b5563',
  },
  requirementValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  divider: {
    backgroundColor: '#e5e7eb',
  },
  actionContainer: {
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    marginVertical: 4,
    backgroundColor: '#7c3aed',
  },
});

export default MachineDetailScreen;
