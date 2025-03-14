
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { List } from 'react-native-paper';
import { User } from '@/types/database';

interface CertificationsSectionProps {
  user: User;
}

const CertificationsSection = ({ user }: CertificationsSectionProps) => {
  // Filter out safety-cabinet from the certifications list
  const certifications = user.certifications 
    ? user.certifications.filter(cert => cert !== 'safety-cabinet' && cert !== 'safety-course')
    : [];
    
  // Safety courses completed
  const safetyCourses = user.safetyCoursesCompleted || [];

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Certifications</Text>
      {certifications.length > 0 ? (
        <List.Section>
          {certifications.map((certId) => (
            <List.Item
              key={certId}
              title={`Machine ${certId}`}
              left={(props) => <List.Icon {...props} icon="certificate" color="#7c3aed" />}
            />
          ))}
        </List.Section>
      ) : (
        <Text style={styles.emptyText}>No machine certifications yet</Text>
      )}
      
      {safetyCourses.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Safety Courses</Text>
          <List.Section>
            {safetyCourses.map((courseId) => (
              <List.Item
                key={courseId}
                title={`Safety Course: ${courseId}`}
                left={(props) => <List.Icon {...props} icon="shield" color="#10b981" />}
              />
            ))}
          </List.Section>
        </>
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
