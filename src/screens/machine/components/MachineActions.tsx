
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

interface MachineActionsProps {
  isCertified: boolean;
  machineStatus: string;
  onTakeCourse: () => void;
  onTakeQuiz: () => void;
  onGetCertified: () => void;
  onBookMachine: () => void;
  isAdmin?: boolean;
}

const MachineActions = ({ 
  isCertified, 
  machineStatus, 
  onTakeCourse, 
  onTakeQuiz, 
  onGetCertified, 
  onBookMachine,
  isAdmin = false
}: MachineActionsProps) => {
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
      
      {/* Allow admin to book machines regardless of status */}
      {(machineStatus === 'available' && isCertified) || isAdmin ? (
        <Button 
          mode="contained" 
          icon="calendar-plus" 
          style={[styles.actionButton, {backgroundColor: '#22c55e'}]}
          onPress={onBookMachine}
        >
          Book Machine
        </Button>
      ) : null}
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
