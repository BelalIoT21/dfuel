
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
}

const MachineActions = ({ 
  isCertified, 
  machineStatus, 
  machineType,
  onTakeCourse, 
  onTakeQuiz, 
  onGetCertified, 
  onBookMachine,
  isAdmin = false
}: MachineActionsProps) => {
  // Check if this machine type is bookable
  const isBookable = machineType !== 'Safety Cabinet';

  return (
    <View style={styles.actionContainer}>
      <Button 
        mode="contained" 
        icon="book-open-variant" 
        style={styles.actionButton}
        onPress={onTakeCourse}
      >
        Take Safety Course
      </Button>
      
      <Button 
        mode="contained" 
        icon="clipboard-list" 
        style={styles.actionButton}
        onPress={onTakeQuiz}
      >
        Take Quiz
      </Button>
      
      {!isCertified && (
        <Button 
          mode="contained" 
          icon="certificate" 
          style={styles.actionButton}
          onPress={onGetCertified}
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
