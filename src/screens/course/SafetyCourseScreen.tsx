
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { Button, Card, ProgressBar, ActivityIndicator } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { courses } from '../../utils/data';

const SafetyCourseScreen = ({ route, navigation }) => {
  const { machineId } = route.params || {};
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Find the course for the given machine ID
  const course = courses[machineId];
  
  useEffect(() => {
    console.log("SafetyCourseScreen mounted with machineId:", machineId);
    console.log("Course data:", course);
    
    if (!user) {
      console.log("No user found, redirecting to login");
      navigation.replace('Login');
      return;
    }
    
    // Add a small delay to ensure data is properly loaded
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (!machineId || !course) {
        setError('No valid machine ID or course found');
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [user, machineId, course, navigation]);
  
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text style={styles.loadingText}>Loading course content...</Text>
      </View>
    );
  }
  
  if (error || !course) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          {error || 'Course not found for this machine.'}
        </Text>
        <Button 
          mode="contained" 
          onPress={() => navigation.goBack()}
          style={styles.button}
        >
          Go Back
        </Button>
      </View>
    );
  }

  const totalSlides = course.slides.length;
  const progress = (currentSlide + 1) / totalSlides;

  const handleNext = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleComplete = () => {
    navigation.navigate('Quiz', { machineId });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{course.title}</Text>
        <Text style={styles.subtitle}>Duration: {course.duration}</Text>
      </View>
      
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Slide {currentSlide + 1} of {totalSlides}
        </Text>
        <ProgressBar progress={progress} color="#7c3aed" style={styles.progressBar} />
      </View>
      
      <Card style={styles.card}>
        <View style={styles.slideImageContainer}>
          {course.slides[currentSlide].image ? (
            <Image 
              source={{ uri: course.slides[currentSlide].image || '/placeholder.svg' }} 
              style={styles.slideImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.noImageContainer}>
              <Text style={styles.noImageText}>No image available</Text>
            </View>
          )}
        </View>
        
        <Card.Content style={styles.cardContent}>
          <Text style={styles.slideTitle}>{course.slides[currentSlide].title}</Text>
          <Text style={styles.slideContent}>{course.slides[currentSlide].content}</Text>
          
          <View style={styles.navigationButtons}>
            <Button 
              mode="outlined" 
              onPress={handlePrevious}
              disabled={currentSlide === 0}
              style={styles.navButton}
            >
              Previous
            </Button>
            
            {currentSlide < totalSlides - 1 ? (
              <Button 
                mode="contained" 
                onPress={handleNext}
                style={[styles.navButton, styles.primaryButton]}
              >
                Next
              </Button>
            ) : (
              <Button 
                mode="contained" 
                onPress={handleComplete}
                style={[styles.navButton, styles.primaryButton]}
              >
                Complete Course
              </Button>
            )}
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f3ff',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  progressContainer: {
    padding: 16,
  },
  progressText: {
    textAlign: 'right',
    marginBottom: 4,
    fontSize: 14,
    color: '#6b7280',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  card: {
    margin: 16,
    overflow: 'hidden',
  },
  slideImageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideImage: {
    width: '100%',
    height: '100%',
  },
  noImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    color: '#9ca3af',
    fontSize: 16,
  },
  cardContent: {
    padding: 16,
  },
  slideTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1f2937',
  },
  slideContent: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 16,
    lineHeight: 24,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  navButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  primaryButton: {
    backgroundColor: '#7c3aed',
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    textAlign: 'center',
    margin: 16,
  },
  button: {
    margin: 16,
    backgroundColor: '#7c3aed',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7c3aed',
    textAlign: 'center',
  },
});

export default SafetyCourseScreen;
