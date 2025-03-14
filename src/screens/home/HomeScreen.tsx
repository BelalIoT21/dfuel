import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Text } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useMachineData } from './hooks/useMachineData';
import MachineItem from './components/MachineItem';
import HomeHeader from './components/HomeHeader';
import LoadingIndicator from './components/LoadingIndicator';
import { machines } from '../../utils/data';

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

  const renderContent = () => {
    // If we're still loading and not refreshing, show loading indicator
    if (loading && !refreshing && (!machineData || machineData.length === 0)) {
      console.log("Showing loading indicator");
      return <LoadingIndicator />;
    }

    // Always have data to display
    const displayData = machineData && machineData.length > 0 
      ? machineData 
      : machines.map(machine => ({
          ...machine,
          status: 'available',
          isLocked: machine.id !== 'safety-cabinet' && 
                    user?.certifications && 
                    !user.certifications.includes('safety-cabinet')
        }));

    console.log("Rendering machine list with", displayData.length, "items");
    return (
      <FlatList
        data={displayData}
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
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No machines available</Text>
            <Text style={styles.emptyStateSubtext}>Pull down to refresh</Text>
          </View>
        }
      />
    );
  };

  return (
    <View style={styles.container}>
      {renderContent()}
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
