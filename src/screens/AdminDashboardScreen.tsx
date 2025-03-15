
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Button, List } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';

const AdminDashboardScreen = ({ navigation }) => {
  const { user } = useAuth();

  // Check if user is admin and redirect non-admins
  if (!user?.isAdmin) {
    React.useEffect(() => {
      navigation.replace('Home');
    }, [navigation]);
    return null;
  }

  const navigateToScreen = (screen, params = {}) => {
    navigation.navigate(screen, params);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <Text style={styles.headerSubtitle}>Learnit Platform Management</Text>
      </View>

      {/* Stats Overview */}
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Card.Content>
            <Text style={styles.statValue}>24</Text>
            <Text style={styles.statLabel}>Users</Text>
          </Card.Content>
        </Card>
        
        <Card style={styles.statCard}>
          <Card.Content>
            <Text style={styles.statValue}>5</Text>
            <Text style={styles.statLabel}>Machines</Text>
          </Card.Content>
        </Card>
      </View>
      
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Card.Content>
            <Text style={styles.statValue}>30</Text>
            <Text style={styles.statLabel}>Certs</Text>
          </Card.Content>
        </Card>
        
        <Card style={styles.statCard}>
          <Card.Content>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Bookings</Text>
          </Card.Content>
        </Card>
      </View>

      {/* Quick Actions */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Quick Actions</Title>
          <View style={styles.buttonContainer}>
            <Button 
              mode="contained" 
              style={styles.actionButton}
              onPress={() => navigateToScreen('AdminUsers')}
            >
              Manage Users
            </Button>
            <Button 
              mode="contained" 
              style={styles.actionButton}
              onPress={() => navigateToScreen('AdminMachines')}
            >
              Manage Machines
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Pending Actions */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Pending Actions</Title>
          <List.Section>
            <List.Item
              title="Approve Booking Request"
              description="John Doe - 3D Printer - Today at 2:00 PM"
              left={props => <List.Icon {...props} icon="calendar-clock" color="#7c3aed" />}
              onPress={() => console.log("Approve booking")}
            />
            <List.Item
              title="Certify User"
              description="Jane Smith - Laser Cutter"
              left={props => <List.Icon {...props} icon="certificate" color="#7c3aed" />}
              onPress={() => console.log("Certify user")}
            />
          </List.Section>
        </Card.Content>
      </Card>

      {/* Machine Status */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Machine Status</Title>
          <List.Section>
            <List.Item
              title="3D Printer"
              description="Available"
              left={props => <List.Icon {...props} icon="cube-outline" color="#22c55e" />}
            />
            <List.Item
              title="Laser Cutter"
              description="Maintenance"
              left={props => <List.Icon {...props} icon="tools" color="#ef4444" />}
            />
            <List.Item
              title="CNC Router"
              description="In Use"
              left={props => <List.Icon {...props} icon="router" color="#f59e0b" />}
            />
          </List.Section>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f3ff',
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7c3aed',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7c3aed',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  card: {
    marginBottom: 16,
  },
  cardTitle: {
    color: '#4b5563',
    marginBottom: 12,
  },
  buttonContainer: {
    gap: 8,
  },
  actionButton: {
    marginVertical: 4,
    backgroundColor: '#7c3aed',
  },
});

export default AdminDashboardScreen;
