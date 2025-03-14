
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, Title, Divider } from 'react-native-paper';

interface MachineRequirementsProps {
  isCertified: boolean;
}

const MachineRequirements = ({ isCertified }: MachineRequirementsProps) => {
  return (
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
  );
};

const styles = StyleSheet.create({
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
});

export default MachineRequirements;
