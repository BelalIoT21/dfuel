
import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function MachineDetailScreen() {
  const { id, name } = useLocalSearchParams();
  const router = useRouter();

  // In a real app, you would fetch machine details based on the id
  const machineDetails = {
    id,
    name,
    description: "This is a high-performance machine used for precision manufacturing.",
    status: "Available",
    requirements: [
      "Safety certification",
      "Basic training completed",
      "Supervisor approval"
    ]
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{machineDetails.name}</Text>
        <View style={[
          styles.statusIndicator,
          { backgroundColor: machineDetails.status === "Available" ? "#10b981" : "#ef4444" }
        ]} />
        <Text style={styles.statusText}>{machineDetails.status}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{machineDetails.description}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Requirements</Text>
        {machineDetails.requirements.map((req, index) => (
          <View key={index} style={styles.requirementItem}>
            <View style={styles.bullet} />
            <Text style={styles.requirementText}>{req}</Text>
          </View>
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, 
            { backgroundColor: machineDetails.status === "Available" ? "#10b981" : "#d1d5db" }
          ]}
          disabled={machineDetails.status !== "Available"}
        >
          <Text style={styles.buttonText}>Book Machine</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginRight: 12,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    color: "#6b7280",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#7c3aed",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: "#4b5563",
    lineHeight: 24,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#7c3aed",
    marginRight: 12,
  },
  requirementText: {
    fontSize: 16,
    color: "#4b5563",
  },
  buttonContainer: {
    marginTop: 12,
    marginBottom: 40,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
