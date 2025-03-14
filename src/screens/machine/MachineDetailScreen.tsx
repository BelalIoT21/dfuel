
import React from 'react';
import { ScrollView, View, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useMachineDetails } from './hooks/useMachineDetails';
import MachineHeader from './components/MachineHeader';
import MachineDescription from './components/MachineDescription';
import MachineRequirements from './components/MachineRequirements';
import MachineActions from './components/MachineActions';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';

const MachineDetailScreen = ({ route, navigation }) => {
  const { machineId } = route.params;
  const { user, addCertification } = useAuth();
  const { machine, machineStatus, loading, isCertified, setIsCertified } = useMachineDetails(machineId, user, navigation);

  const handleTakeCourse = () => {
    // Make sure we're passing the correct parameter name (machineId)
    navigation.navigate('Course', { machineId });
    console.log('Navigating to safety course for machine:', machineId);
  };

  const handleTakeQuiz = () => {
    // Make sure we're passing the correct parameter name (machineId)
    navigation.navigate('Quiz', { machineId });
    console.log('Navigating to quiz for machine:', machineId);
  };

  const handleBookMachine = () => {
    // Check if this is a non-bookable machine like Safety Cabinet
    if (machine?.type === 'Safety Cabinet') {
      Alert.alert('Not Bookable', 'Safety Cabinet is not a bookable resource.');
      return;
    }
    
    // For admin users, create a direct booking
    if (user?.isAdmin) {
      console.log('Admin booking for machine:', machineId);
      // Navigate to the booking screen with more parameters for immediate booking
      navigation.navigate('Booking', { 
        machineId, 
        adminBooking: true,
        // Add default date and time for admin bookings
        date: new Date().toISOString().split('T')[0],
        time: '09:00-10:00'
      });
    } else {
      // For regular users, just navigate to the booking screen
      console.log('User attempting to book machine:', machineId);
      navigation.navigate('Booking', { machineId });
    }
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
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong';
      Alert.alert('Error', errorMessage);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (!machine) {
    return <ErrorState onGoBack={() => navigation.goBack()} />;
  }

  return (
    <ScrollView style={styles.container}>
      <MachineHeader 
        machine={machine} 
        machineStatus={machineStatus} 
        isCertified={isCertified}
      />
      
      <View style={styles.contentContainer}>
        <MachineDescription description={machine.description} />
        
        <MachineRequirements isCertified={isCertified} />
        
        <MachineActions 
          isCertified={isCertified}
          machineStatus={machineStatus}
          machineType={machine.type || ''}
          onTakeCourse={handleTakeCourse}
          onTakeQuiz={handleTakeQuiz}
          onGetCertified={handleGetCertified}
          onBookMachine={handleBookMachine}
          isAdmin={user?.isAdmin}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f3ff',
  },
  contentContainer: {
    padding: 16,
  },
});

export default MachineDetailScreen;
