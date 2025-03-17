
import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
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
  userId
}: MachineActionsProps) => {
  const [certificationsChecked, setCertificationsChecked] = useState(false);
  const [certifiedState, setCertifiedState] = useState(isCertified);
  
  // Check if this machine type is bookable - Safety Cabinet and Safety Course are not bookable
  const isBookable = machineType !== 'Safety Cabinet' && machineType !== 'Safety Course';
  
  // Determine if user can get certified (must have Machine Safety Course)
  const canGetCertified = hasMachineSafetyCert || isAdmin;
  
  // Special handling for special users (disabled for admins for testing)
  const isSpecialUser = false;
  
  // Is this the Machine Safety Course itself?
  const isSafetyCourse = machineType === 'Safety Course';

  useEffect(() => {
    setCertifiedState(isCertified);
  }, [isCertified]);

  console.log('MachineActions props:', {
    isCertified: certifiedState,
    machineStatus,
    machineType,
    isBookable,
    canGetCertified,
    isAdmin
  });

  return (
    <View style={styles.actionContainer}>
      <Button 
        mode="contained" 
        icon="book-open-variant" 
        style={styles.actionButton}
        onPress={onTakeCourse}
      >
        Safety Course
      </Button>
      
      <Button 
        mode="contained" 
        icon="clipboard-list" 
        style={styles.actionButton}
        onPress={onTakeQuiz}
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
