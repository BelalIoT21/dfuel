
import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

const dummyMachines = [
  { id: "1", name: "CNC Machine", status: "Available" },
  { id: "2", name: "3D Printer", status: "In Use" },
  { id: "3", name: "Laser Cutter", status: "Maintenance" },
  { id: "4", name: "Robotic Arm", status: "Available" },
];

export default function HomeScreen() {
  const router = useRouter();

  const handleMachinePress = (id: string, name: string) => {
    router.push({
      pathname: "/machine/[id]",
      params: { id, name }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Machines</Text>
      
      <FlatList
        data={dummyMachines}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.machineItem}
            onPress={() => handleMachinePress(item.id, item.name)}
          >
            <Text style={styles.machineName}>{item.name}</Text>
            <View style={[
              styles.statusIndicator, 
              { backgroundColor: 
                item.status === "Available" ? "#10b981" : 
                item.status === "In Use" ? "#f59e0b" : "#ef4444" 
              }
            ]} />
            <Text style={styles.statusText}>{item.status}</Text>
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#7c3aed",
    marginBottom: 24,
  },
  machineItem: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  machineName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    flex: 1,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: "#6b7280",
  },
});
