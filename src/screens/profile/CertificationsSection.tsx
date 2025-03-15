
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { List } from 'react-native-paper';
import { User } from '@/types/database';

interface CertificationsSectionProps {
  user: User;
}

const CertificationsSection = ({ user }: CertificationsSectionProps) => {
  // Filter out any certifications for Safety Cabinet
  const filteredCertifications = user.certifications.filter(certId => {
    // In a real app, you would fetch the machine type from an API
    // For now, we'll just hardcode the Safety Cabinet ID (usually "5")
    return certId !== "5"; // Assuming "5" is the Safety Cabinet ID
  });

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Certifications</Text>
      {filteredCertifications && filteredCertifications.length > 0 ? (
        <List.Section>
          {filteredCertifications.map((certId) => (
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
