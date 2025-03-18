
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';
import MachineHeader from './components/MachineHeader';
import MachineDescription from './components/MachineDescription';
import MachineRequirements from './components/MachineRequirements';
import MachineActions from './components/MachineActions';
import { useMachineDetails } from './hooks/useMachineDetails';
import { certificationService } from '../../services/certificationService';

const MachineDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { machineId } = route.params || {};

  const {
    machine,
    machineStatus,
    loading,
    isCertified,
    hasMachineSafetyCert,
    setIsCertified,
    userId
  } = useMachineDetails(machineId, user, navigation);

  // Take course function
  const handleTakeCourse = () => {
    navigation.navigate('SafetyCourse', { machineId });
  };

  // Take quiz function
  const handleTakeQuiz = () => {
    navigation.navigate('Quiz', { machineId });
  };

  // Get certified function
  const handleGetCertified = async () => {
    try {
      // Call certification service
      const success = await certificationService.certifyUser(userId, machineId);
      
      if (success) {
        setIsCertified(true);
        Alert.alert(
          "Certification Complete",
          "Congratulations! You are now certified to use this machine.",
          [{ text: "OK" }]
        );
      } else {
        Alert.alert(
          "Certification Failed",
          "There was an issue with your certification. Please try again.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Error during certification:", error);
      Alert.alert(
        "Certification Error",
        "An unexpected error occurred during certification.",
        [{ text: "OK" }]
      );
    }
  };

  // Book machine function
  const handleBookMachine = () => {
    navigation.navigate('Booking', { machineId });
  };

  if (loading) {
    return <LoadingState />;
  }

  if (!machine) {
    return <ErrorState onRetry={() => navigation.goBack()} />;
  }

  return (
    <ScrollView style={styles.container}>
      <MachineHeader
        name={machine.name}
        status={machineStatus}
        isCertified={isCertified}
        imageUrl={machine.imageUrl || 'https://via.placeholder.com/300x200'}
      />
      
      <MachineDescription description={machine.description} />
      
      <MachineRequirements 
        type={machine.type} 
        difficulty={machine.difficulty || 'Intermediate'} 
        specifications={machine.specifications}
      />
      
      <MachineActions 
        isCertified={isCertified}
        machineStatus={machineStatus}
        machineType={machine.type}
        machineId={machineId}
        onTakeCourse={handleTakeCourse}
        onTakeQuiz={handleTakeQuiz}
        onGetCertified={handleGetCertified}
        onBookMachine={handleBookMachine}
        isAdmin={user?.isAdmin}
        hasMachineSafetyCert={hasMachineSafetyCert}
        userId={userId}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

export default MachineDetailScreen;
