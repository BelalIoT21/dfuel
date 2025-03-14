
import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Text } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useMachineData } from './hooks/useMachineData';
import MachineItem from './components/MachineItem';
import HomeHeader from './components/HomeHeader';
import LoadingIndicator from './components/LoadingIndicator';

const HomeScreen = ({ navigation }) => {
  console.log("Rendering HomeScreen");
  
  const { user } = useAuth();
  console.log("User in HomeScreen:", user?.name || "No user");
  
  const { machineData, loading, refreshing, onRefresh } = useMachineData(user, navigation);
  console.log("Machine data loaded:", machineData?.length || 0, "items");
  console.log("Loading state:", loading, "Refreshing state:", refreshing);

  useEffect(() => {
    console.log("HomeScreen mounted");
    return () => console.log("HomeScreen unmounted");
  }, []);

  // Force a refresh if there's no data
  useEffect(() => {
    if (!machineData || machineData.length === 0) {
      console.log("No machine data, triggering refresh");
      onRefresh();
    }
  }, [machineData, onRefresh]);

  if (loading && !refreshing) {
    console.log("Showing loading indicator");
    return <LoadingIndicator />;
  }

  // Fallback if there's no data
  if (!machineData || machineData.length === 0) {
    console.log("No machine data available");
    return (
      <View style={styles.container}>
        <HomeHeader />
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No machines available</Text>
          <Text style={styles.emptyStateSubtext}>Pull down to refresh</Text>
        </View>
      </View>
    );
  }

  console.log("Rendering machine list with", machineData.length, "items");
  return (
    <View style={styles.container}>
      <FlatList
        data={machineData}
        renderItem={({ item }) => (
          <MachineItem 
            machine={item} 
            navigation={navigation} 
            userCertifications={user?.certifications || []} 
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#7c3aed']}
          />
        }
        ListHeaderComponent={<HomeHeader />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f3ff', // light purple background
  },
  listContainer: {
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7c3aed',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
});

export default HomeScreen;
