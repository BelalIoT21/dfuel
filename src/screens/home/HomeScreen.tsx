
import React from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useMachineData } from './hooks/useMachineData';
import MachineItem from './components/MachineItem';
import HomeHeader from './components/HomeHeader';
import LoadingIndicator from './components/LoadingIndicator';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { machineData, loading, refreshing, onRefresh } = useMachineData(user, navigation);

  if (loading && !refreshing) {
    return <LoadingIndicator />;
  }

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
});

export default HomeScreen;
