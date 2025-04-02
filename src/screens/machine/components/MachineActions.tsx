
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import { certificationService } from '../../../services/certificationService';

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
  requiresCertification?: boolean;
  onGoBack?: () => void;
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
  requiresCertification = true,
  onGoBack
}: MachineActionsProps) => {
  const [certificationsChecked, setCertificationsChecked] = useState(false);
  const [certifiedState, setCertifiedState] = useState(isCertified);
  
  // Check if this machine type is bookable - Safety Cabinet and Safety Course are not bookable
  const isBookable = machineType !== 'Safety Cabinet' && machineType !== 'Safety Course';
  
  // Determine if user can get certified (must have Safety Course certification - ID 6)
  const canGetCertified = hasMachineSafetyCert || isAdmin;
  
  // Is this the Safety Course itself? (ID 6)
  const isSafetyCourse = machineType === 'Safety Course';

  // Admin users are always considered certified
  useEffect(() => {
    const effectiveCertification = isAdmin ? true : isCertified;
    setCertifiedState(effectiveCertification);
  }, [isCertified, isAdmin]);

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
      requiresCertification
    });
  }, [certifiedState, machineStatus, machineType, isBookable, canGetCertified, isAdmin, hasMachineSafetyCert, userId, requiresCertification]);

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
      {/* Show certification-related buttons only if certification is required or it's the safety course */}
      {(requiresCertification || isSafetyCourse) && (
        <>
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
            >
              Get Certified
            </Button>
          )}
        </>
      )}
      
      {/* Only show booking buttons for bookable machines */}
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
          ) : ((machineStatus === 'available' && (certifiedState || !requiresCertification))) ? (
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
