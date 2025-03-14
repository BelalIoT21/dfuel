
import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import { Link } from "expo-router";
import React, { useEffect } from "react";

export default function HomeScreen() {
  useEffect(() => {
    console.log("Home screen mounted - index route loaded successfully");
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Learnit</Text>
        <Text style={styles.description}>Welcome to your learning platform</Text>
        <Link href="/login" style={styles.link}>
          <Text style={styles.linkText}>Login</Text>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f3ff",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f5f3ff", // Light purple background
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
