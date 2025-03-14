
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { Card, Title, Paragraph, Chip, ActivityIndicator } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { machines } from '../utils/data';
import userDatabase from '../services/userDatabase';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [machineData, setMachineData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMachineData = async () => {
    try {
      setLoading(true);
      const extendedMachines = await Promise.all(machines.map(async (machine) => {
        try {
          const status = await userDatabase.getMachineStatus(machine.id);
          return {
            ...machine,
            status: status || 'available'
          };
        } catch (error) {
          console.error(`Error loading status for machine ${machine.id}:`, error);
          return {
            ...machine,
            status: 'available'
          };
        }
      }));
      setMachineData(extendedMachines);
    } catch (error) {
      console.error("Error loading machine data:", error);
      setMachineData(machines.map(machine => ({
        ...machine,
        status: 'available'
      })));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.isAdmin) {
      navigation.replace('AdminDashboard');
      return;
    }
    
    if (user) {
      loadMachineData();
    }
  }, [user, navigation]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadMachineData();
  }, []);

  const getStatusColor = (status) => {
    switch(status) {
      case 'available':
        return '#22c55e'; // green-500
      case 'maintenance':
        return '#ef4444'; // red-500
      case 'in-use':
        return '#f59e0b'; // amber-500
      default:
        return '#6b7280'; // gray-500
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'available':
        return 'Available';
      case 'maintenance':
        return 'Maintenance';
      case 'in-use':
        return 'In Use';
      default:
        return status;
    }
  };

  const renderMachineItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('MachineDetail', { 
        machineId: item.id,
        name: item.name 
      })}
    >
      <Card style={styles.card}>
        <Card.Cover source={{ uri: item.image }} style={styles.cardImage} />
        <Card.Content>
          <Title>{item.name}</Title>
          <Paragraph numberOfLines={2} style={styles.description}>{item.description}</Paragraph>
          <View style={styles.chipContainer}>
            <Chip 
              style={{backgroundColor: getStatusColor(item.status) + '20'}}
              textStyle={{color: getStatusColor(item.status)}}
            >
              {getStatusLabel(item.status)}
            </Chip>
            {user?.certifications?.includes(item.id) && (
              <Chip 
                style={{backgroundColor: '#3b82f620'}}
                textStyle={{color: '#3b82f6'}}
              >
                Certified
              </Chip>
            )}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text style={styles.loadingText}>Loading machines...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={machineData}
        renderItem={renderMachineItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#7c3aed']}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Dashboard</Text>
            <Text style={styles.headerSubtitle}>Select a machine to get started</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f3ff', // light purple background
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f3ff',
  },
  loadingText: {
    marginTop: 10,
    color: '#7c3aed',
  },
  listContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7c3aed', // purple-800
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280', // gray-600
  },
  card: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  cardImage: {
    height: 160,
  },
  description: {
    marginBottom: 8,
    color: '#4b5563', // gray-700
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
});

export default HomeScreen;
