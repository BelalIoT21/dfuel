
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

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
  // Check if this machine type is bookable - Safety Cabinet and Safety Course are not bookable
  const isBookable = machineType !== 'Safety Cabinet' && machineType !== 'Safety Course';
  
  // Determine if user can get certified (must have Machine Safety Course or be admin)
  const canGetCertified = hasMachineSafetyCert || isAdmin;
  
  // Special handling for special users
  const isSpecialUser = userId && (userId === "user-1741957466063" || (userId && userId.includes("b.l.mishmish")));
  
  // Is this the Machine Safety Course itself?
  const isSafetyCourse = machineType === 'Safety Course';
  
  // Admin should always be able to get certified and book machines
  const showGetCertified = isAdmin ? !isCertified : (!isCertified && (canGetCertified || isSafetyCourse));

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
      
      {showGetCertified && (
        <Button 
          mode="contained" 
          icon="certificate" 
          style={styles.actionButton}
          onPress={onGetCertified}
          disabled={!isAdmin && isSpecialUser} // Only disable for special users unless admin
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
          ) : (machineStatus === 'available' && isCertified) ? (
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
