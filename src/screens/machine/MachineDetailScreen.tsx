
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
          onTakeCourse={handleTakeCourse}
          onTakeQuiz={handleTakeQuiz}
          onGetCertified={handleGetCertified}
          onBookMachine={handleBookMachine}
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
