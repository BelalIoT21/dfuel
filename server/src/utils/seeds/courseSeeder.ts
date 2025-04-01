
import { Course } from '../../models/Course';
import { predefinedCourses, ORIGINAL_COURSE_TEMPLATES } from './courseTemplates';

// Function to seed safety courses
export async function seedSafetyCourses() {
  try {
    // Check if courses already exist
    const course5 = await Course.findById('5');
    const course6 = await Course.findById('6');
    
    const safetyCourses = predefinedCourses.filter(course => 
      (course._id === '5' || course._id === '6') && course.category === 'Safety'
    );
    
    // Create Safety Cabinet course if it doesn't exist
    if (!course5 && safetyCourses.find(c => c._id === '5')) {
      const safetyCabinetCourse = new Course(safetyCourses.find(c => c._id === '5'));
      await safetyCabinetCourse.save();
      console.log('Created Safety Cabinet course with ID: 5');
    } else {
      console.log('Safety Cabinet course already exists');
    }
    
    // Create Machine Safety course if it doesn't exist
    if (!course6 && safetyCourses.find(c => c._id === '6')) {
      const machineSafetyCourse = new Course(safetyCourses.find(c => c._id === '6'));
      await machineSafetyCourse.save();
      console.log('Created Machine Safety course with ID: 6');
    } else {
      console.log('Machine Safety course already exists');
    }
    
    console.log('Safety courses seeding completed successfully');
    return { success: true };
  } catch (error) {
    console.error('Error seeding safety courses:', error);
    return { success: false, error };
  }
}

// Function to seed all core courses
export async function seedAllCourses() {
  try {
    for (const courseData of predefinedCourses) {
      const existingCourse = await Course.findById(courseData._id);
      
      if (!existingCourse) {
        const course = new Course(courseData);
        await course.save();
        console.log(`Created course: ${courseData.title} with ID: ${courseData._id}`);
      } else {
        console.log(`Course ${courseData.title} already exists with ID: ${courseData._id}`);
      }
    }
    
    console.log('Courses seeding completed successfully');
    return { success: true };
  } catch (error) {
    console.error('Error seeding courses:', error);
    return { success: false, error };
  }
}

// Function to restore soft-deleted core courses
export async function restoreDeletedCourses(): Promise<number> {
  try {
    // Find core courses (1-6) that are soft-deleted but not permanently deleted
    const softDeletedCoreCourses = await Course.find({
      _id: { $in: ['1', '2', '3', '4', '5', '6'] },
      deletedAt: { $exists: true, $ne: null },
      permanentlyDeleted: { $ne: true }
    });
    
    console.log(`Found ${softDeletedCoreCourses.length} soft-deleted core courses to restore`);
    
    let restoredCount = 0;
    
    for (const course of softDeletedCoreCourses) {
      // Restore the course by clearing the deletedAt field
      // but preserve all other properties/changes
      course.deletedAt = undefined;
      
      await course.save();
      console.log(`Restored soft-deleted core course ${course._id} with all previous modifications`);
      restoredCount++;
    }
    
    return restoredCount;
  } catch (error) {
    console.error("Error restoring soft-deleted core courses:", error);
    return 0;
  }
}

// Create a backup of all core courses
export async function backupCourses(): Promise<number> {
  try {
    // Get all core courses (1-6)
    const coreCourses = await Course.find({
      _id: { $in: Object.keys(ORIGINAL_COURSE_TEMPLATES) }
    });
    
    let backupCount = 0;
    
    for (const course of coreCourses) {
      // Only backup if no backup exists
      if (!course.backupData) {
        // Create backup of current course state
        course.backupData = JSON.stringify({
          title: course.title,
          description: course.description,
          category: course.category,
          content: course.content,
          imageUrl: course.imageUrl,
          relatedMachineIds: course.relatedMachineIds,
          quizId: course.quizId,
          difficulty: course.difficulty
        });
        
        await course.save();
        console.log(`Created backup for core course ${course._id}`);
        backupCount++;
      }
    }
    
    console.log(`Backed up ${backupCount} core courses`);
    return backupCount;
  } catch (error) {
    console.error("Error backing up core courses:", error);
    return 0;
  }
}
