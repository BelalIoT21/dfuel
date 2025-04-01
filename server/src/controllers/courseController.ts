import { Request, Response } from 'express';
import { Course } from '../models/Course';
import mongoose from 'mongoose';

// Get all courses
export const getCourses = async (req: Request, res: Response) => {
  try {
    // Only return courses that haven't been soft-deleted
    const courses = await Course.find({ deletedAt: { $exists: false } });
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
      course = await Course.findOne({ _id: id, deletedAt: { $exists: false } });
    } else {
      course = await Course.findOne({ _id: id, deletedAt: { $exists: false } });
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
    
    // Create an initial backup of the new course
    await backupCourseData(savedCourse._id);
    
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
    
    // Backup the course before updating
    await backupCourseData(id);

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

// Delete course - updated to ensure permanent deletion for courses with ID > 6
export const deleteCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { permanent } = req.query; // Add support for permanent deletion query parameter
    
    console.log(`Deleting course ${id}, permanent: ${permanent}`);

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
    
    // Backup the course before deletion
    await backupCourseData(id);
    
    // Check if this is a core course (ID 1-6) or user-created course (ID > 6)
    const courseIdNum = Number(id);
    const isCoreCourse = courseIdNum >= 1 && courseIdNum <= 6;
    const isUserCourse = !isNaN(courseIdNum) && courseIdNum > 6;
    
    // For user-created courses (ID > 6), always use permanent deletion
    // regardless of the permanent flag
    const shouldPermanentDelete = permanent === 'true' || permanent === '1' || isUserCourse;
    
    if (shouldPermanentDelete) {
      console.log(`Using permanent deletion for course ${id} (isUserCourse: ${isUserCourse})`);
      
      // For core courses (1-6), just mark them as permanently deleted
      if (isCoreCourse) {
        await Course.findByIdAndUpdate(id, { 
          deletedAt: new Date(),
          permanentlyDeleted: true
        });
        
        console.log(`Core course ${id} marked as permanently deleted`);
        return res.status(200).json({ 
          message: 'Core course marked as permanently deleted',
          permanentlyDeleted: true
        });
      } else {
        // For user-created courses (ID > 6), completely remove from database
        try {
          await Course.findByIdAndDelete(id);
          console.log(`User-created course ${id} permanently deleted from database`);
          return res.status(200).json({ 
            message: 'Course permanently deleted from database',
            permanentlyDeleted: true,
            hardDeleted: true  
          });
        } catch (deleteError) {
          console.error(`Error performing hard delete on course ${id}:`, deleteError);
          
          // If hard delete fails, mark as permanently deleted
          await Course.findByIdAndUpdate(id, { 
            deletedAt: new Date(),
            permanentlyDeleted: true
          });
          
          return res.status(200).json({ 
            message: 'Course marked as permanently deleted',
            permanentlyDeleted: true
          });
        }
      }
    } else {
      // Soft delete by setting deletedAt timestamp
      await Course.findByIdAndUpdate(id, { deletedAt: new Date() });
      return res.status(200).json({ 
        message: 'Course deleted successfully (soft delete)',
        softDeleted: true 
      });
    }
  } catch (error) {
    console.error('Error in deleteCourse:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// Helper function to backup course data
const backupCourseData = async (courseId: string) => {
  try {
    const course = await Course.findById(courseId);
    if (!course) {
      console.error(`Cannot backup course ${courseId}: not found`);
      return false;
    }
    
    // Create backup data with timestamp
    const backupData = {
      ...course.toObject(),
      _backupTime: new Date().toISOString()
    };
    
    // Store backup as JSON string
    await Course.findByIdAndUpdate(courseId, {
      backupData: JSON.stringify(backupData)
    });
    
    console.log(`Successfully backed up course ${courseId}`);
    return true;
  } catch (error) {
    console.error(`Error backing up course ${courseId}:`, error);
    return false;
  }
};

// Backup course endpoint
export const backupCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { backupData } = req.body;
    
    // Find the course to ensure it exists
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Update with provided backup data or generate new backup
    if (backupData) {
      await Course.findByIdAndUpdate(id, { backupData });
    } else {
      const success = await backupCourseData(id);
      if (!success) {
        return res.status(500).json({ message: 'Failed to backup course' });
      }
    }
    
    res.status(200).json({ success: true, message: 'Course backed up successfully' });
  } catch (error) {
    console.error(`Error in backupCourse:`, error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// Restore course endpoint
export const restoreCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Find the course to check if it exists
    let existingCourse = await Course.findById(id);
    
    // If course doesn't exist or is soft-deleted, attempt to restore from backup
    const restoreFromBackup = !existingCourse || existingCourse.deletedAt;
    
    if (restoreFromBackup) {
      // Try to find the course even if it's soft-deleted
      existingCourse = await Course.findOne({ _id: id });
      
      if (!existingCourse) {
        return res.status(404).json({ message: 'Course not found and no backup available' });
      }
      
      // Don't restore permanently deleted courses
      if (existingCourse.permanentlyDeleted) {
        return res.status(400).json({
          message: 'Cannot restore permanently deleted course',
          permanentlyDeleted: true
        });
      }
      
      // Check if backup data exists
      if (!existingCourse.backupData) {
        return res.status(404).json({ message: 'No backup data available for this course' });
      }
      
      // Parse backup data
      const backupData = JSON.parse(existingCourse.backupData);
      
      // Update course with backup data
      Object.keys(backupData).forEach(key => {
        // Skip special fields that shouldn't be restored
        if (!['_id', '__v', 'createdAt', 'updatedAt', '_backupTime'].includes(key)) {
          // Fix: Type assertion to allow string indexing on the mongoose document
          (existingCourse as any)[key] = backupData[key];
        }
      });
      
      // Clear deletedAt to undelete
      existingCourse.deletedAt = undefined;
      
      // Save the restored course
      await existingCourse.save();
      
      res.status(200).json({ 
        success: true, 
        message: 'Course restored successfully from backup',
        course: existingCourse
      });
    } else {
      // Course exists and isn't deleted, just return it
      res.status(200).json({ 
        success: true, 
        message: 'Course already exists and is active',
        course: existingCourse
      });
    }
  } catch (error) {
    console.error(`Error in restoreCourse:`, error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};
