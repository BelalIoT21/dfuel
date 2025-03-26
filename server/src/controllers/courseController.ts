
import { Request, Response } from 'express';
import { Course } from '../models/Course';
import mongoose from 'mongoose';

// Get all courses
export const getCourses = async (req: Request, res: Response) => {
  try {
    const courses = await Course.find();
    res.status(200).json(courses);
  } catch (error) {
    console.error('Error in getCourses:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// Get course by ID
export const getCourseById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Handle string IDs properly
    let course;
    if (mongoose.Types.ObjectId.isValid(id)) {
      course = await Course.findById(id);
    } else {
      course = await Course.findOne({ _id: id });
    }

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.status(200).json(course);
  } catch (error) {
    console.error('Error in getCourseById:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// Create new course
export const createCourse = async (req: Request, res: Response) => {
  try {
    const { title, description, category, content, imageUrl, relatedMachineIds, quizId, difficulty, startingId } = req.body;

    // Generate a new ID starting at the specified startingId or 5 as default
    const minStartId = startingId || 5;
    
    // Get all existing course IDs and filter out numeric ones
    const existingCourses = await Course.find({}, { _id: 1 });
    const numericIds = existingCourses
      .map(c => c._id)
      .filter(id => /^\d+$/.test(id.toString()))
      .map(id => parseInt(id.toString()));
    
    // Find max ID or use minStartId - 1
    const maxId = numericIds.length > 0 ? Math.max(...numericIds) : (minStartId - 1);
    
    // New ID is max + 1, but at least minStartId
    const newId = String(Math.max(maxId + 1, minStartId));
    
    console.log(`Creating new course with ID: ${newId} (min starting ID: ${minStartId})`);

    const course = new Course({
      _id: newId,
      title,
      description,
      category,
      content,
      imageUrl,
      relatedMachineIds,
      quizId,
      difficulty
    });

    const savedCourse = await course.save();
    res.status(201).json(savedCourse);
  } catch (error) {
    console.error('Error in createCourse:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// Update course
export const updateCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, category, content, imageUrl, relatedMachineIds, quizId, difficulty } = req.body;

    // Find the course
    let course;
    if (mongoose.Types.ObjectId.isValid(id)) {
      course = await Course.findById(id);
    } else {
      course = await Course.findOne({ _id: id });
    }

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Update the course fields
    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      {
        title,
        description,
        category,
        content,
        imageUrl,
        relatedMachineIds,
        quizId,
        difficulty
      },
      { new: true }
    );

    res.status(200).json(updatedCourse);
  } catch (error) {
    console.error('Error in updateCourse:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// Delete course
export const deleteCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Find the course
    let course;
    if (mongoose.Types.ObjectId.isValid(id)) {
      course = await Course.findById(id);
    } else {
      course = await Course.findOne({ _id: id });
    }

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Delete the course
    await course.deleteOne();

    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error in deleteCourse:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};
