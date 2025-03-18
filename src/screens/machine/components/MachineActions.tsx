
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import { certificationService } from '../../../services/certificationService';
import { certificationDatabaseService } from '../../../services/database/certificationService';

interface MachineActionsProps {
  isCertified: boolean;
  machineStatus: string;
  machineType: string;
  onTakeCourse: () => void;
  onTakeQuiz: () => void;
  onGetCertified: () => void;
  onBookMachine: () => void;
  isAdmin?: boolean;
  hasMachineSafetyCert?: boolean;
  userId?: string;
  machineId?: string;
}

const MachineActions = ({ 
  isCertified, 
  machineStatus, 
  machineType,
  onTakeCourse, 
  onTakeQuiz, 
  onGetCertified, 
  onBookMachine,
  isAdmin = false,
  hasMachineSafetyCert = false,
  userId,
  machineId
}: MachineActionsProps) => {
  const [certificationsChecked, setCertificationsChecked] = useState(false);
  const [certifiedState, setCertifiedState] = useState(isCertified);
  
  // Define bookable machine IDs (1-4 are bookable)
  const BOOKABLE_MACHINE_IDS = ['1', '2', '3', '4'];
  
  // Check if this machine is bookable based on ID
  const isBookable = machineId ? BOOKABLE_MACHINE_IDS.includes(machineId) : false;
  
  // Determine if user can get certified (must have Safety Course certification - ID 6)
  const canGetCertified = hasMachineSafetyCert || isAdmin;
  
  // Special handling for special users (disabled for admins for testing)
  const isSpecialUser = false;
  
  // Is this the Safety Course itself? (ID 6)
  const isSafetyCourse = machineId === '6' || machineType === 'Safety Course';

  useEffect(() => {
    setCertifiedState(isCertified);
  }, [isCertified]);

  // Debug logging
  useEffect(() => {
    console.log('MachineActions props:', {
      isCertified: certifiedState,
      machineStatus,
      machineType,
      isBookable,
      canGetCertified,
      isAdmin,
      hasMachineSafetyCert,
      userId,
      machineId
    });
  }, [certifiedState, machineStatus, machineType, isBookable, canGetCertified, isAdmin, hasMachineSafetyCert, userId, machineId]);

  const handleTakeCourse = () => {
    // If not Safety Course and user doesn't have Safety Course certification
    if (!isSafetyCourse && !hasMachineSafetyCert && !isAdmin) {
      Alert.alert(
        "Safety Course Required",
        "You need to complete the Machine Safety Course first before taking this course.",
        [
          { text: "OK" }
        ]
      );
      return;
    }
    
    // Proceed with course
    onTakeCourse();
  };

  const handleTakeQuiz = () => {
    // If not Safety Course and user doesn't have Safety Course certification
    if (!isSafetyCourse && !hasMachineSafetyCert && !isAdmin) {
      Alert.alert(
        "Safety Course Required",
        "You need to complete the Machine Safety Course first before taking this quiz.",
        [
          { text: "OK" }
        ]
      );
      return;
    }
    
    // Proceed with quiz
    onTakeQuiz();
  };

  return (
    <View style={styles.actionContainer}>
      <Button 
        mode="contained" 
        icon="book-open-variant" 
        style={styles.actionButton}
        onPress={handleTakeCourse}
      >
        Safety Course
      </Button>
      
      <Button 
        mode="contained" 
        icon="clipboard-list" 
        style={styles.actionButton}
        onPress={handleTakeQuiz}
      >
        Take Quiz
      </Button>
      
      {(!certifiedState && (canGetCertified || isSafetyCourse)) && (
        <Button 
          mode="contained" 
          icon="certificate" 
          style={styles.actionButton}
          onPress={onGetCertified}
          disabled={isSpecialUser && !isAdmin} // Disable for special users unless admin
        >
          Get Certified
        </Button>
      )}
      
      {/* Show booking button for all machines 1-4 when certified */}
      {isBookable && (
        <>
          {/* Always show booking button for admins regardless of machine status or certification */}
          {isAdmin ? (
            <Button 
              mode="contained" 
              icon="calendar-plus" 
              style={[styles.actionButton, {backgroundColor: '#22c55e'}]}
              onPress={onBookMachine}
            >
              Book Machine (Admin)
            </Button>
          ) : (machineStatus === 'available' && certifiedState) ? (
            <Button 
              mode="contained" 
              icon="calendar-plus" 
              style={[styles.actionButton, {backgroundColor: '#22c55e'}]}
              onPress={onBookMachine}
            >
              Book Machine
            </Button>
          ) : null}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  actionContainer: {
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    marginVertical: 4,
    backgroundColor: '#7c3aed',
  },
});

export default MachineActions;
