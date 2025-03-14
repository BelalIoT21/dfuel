
import { View, Text, StyleSheet } from "react-native";
import { Link } from "expo-router";
import React from "react";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Learnit</Text>
      <Text style={styles.description}>Welcome to your learning platform</Text>
      <Link href="/login" style={styles.link}>
        <Text style={styles.linkText}>Login</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#7c3aed",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "#4b5563",
    marginBottom: 24,
  },
  link: {
    backgroundColor: "#7c3aed",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  linkText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
});
