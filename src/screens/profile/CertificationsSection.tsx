
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { List } from 'react-native-paper';
import { User } from '@/types/database';

interface CertificationsSectionProps {
  user: User;
}

const CertificationsSection = ({ user }: CertificationsSectionProps) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Certifications</Text>
      {user.certifications && user.certifications.length > 0 ? (
        <List.Section>
          {user.certifications.map((certId) => (
            <List.Item
              key={certId}
              title={`Machine ${certId}`}
              left={(props) => <List.Icon {...props} icon="certificate" color="#7c3aed" />}
            />
          ))}
        </List.Section>
      ) : (
        <Text style={styles.emptyText}>No certifications yet</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
  },
  emptyText: {
    color: '#6b7280',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 10,
  },
});

export default CertificationsSection;
