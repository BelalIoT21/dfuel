
import { Course } from '../../models/Course';

// Define course content templates
const laserCutterCourseContent = JSON.stringify([
  {
    id: '1',
    elements: [
      { id: '1-1', type: 'heading', content: 'Laser Cutter Training', headingLevel: 1 },
      { id: '1-2', type: 'text', content: 'Learn how to safely operate the lab\'s laser cutter' }
    ]
  },
  {
    id: '2',
    elements: [
      { id: '2-1', type: 'heading', content: 'Safety First', headingLevel: 2 },
      { id: '2-2', type: 'text', content: 'Always ensure proper ventilation and never leave the machine unattended while operating.' }
    ]
  }
]);

const ultimakerCourseContent = JSON.stringify([
  {
    id: '1',
    elements: [
      { id: '1-1', type: 'heading', content: 'Ultimaker 3D Printer Training', headingLevel: 1 },
      { id: '1-2', type: 'text', content: 'Learn how to use the Ultimaker 3D printer effectively' }
    ]
  },
  {
    id: '2',
    elements: [
      { id: '2-1', type: 'heading', content: 'Material Selection', headingLevel: 2 },
      { id: '2-2', type: 'text', content: 'Choose the right material for your project based on structural requirements and appearance.' }
    ]
  }
]);

const x1CarbonCourseContent = JSON.stringify([
  {
    id: '1',
    elements: [
      { id: '1-1', type: 'heading', content: 'X1 E Carbon 3D Printer', headingLevel: 1 },
      { id: '1-2', type: 'text', content: 'Advanced training for carbon fiber composite printing' }
    ]
  },
  {
    id: '2',
    elements: [
      { id: '2-1', type: 'heading', content: 'Material Properties', headingLevel: 2 },
      { id: '2-2', type: 'text', content: 'Understanding carbon fiber reinforced filaments and their applications.' }
    ]
  }
]);

const bambuLabCourseContent = JSON.stringify([
  {
    id: '1',
    elements: [
      { id: '1-1', type: 'heading', content: 'Bambu Lab 3D Printer', headingLevel: 1 },
      { id: '1-2', type: 'text', content: 'Learn to use the Bambu Lab printer for high-quality prints' }
    ]
  },
  {
    id: '2',
    elements: [
      { id: '2-1', type: 'heading', content: 'Print Settings', headingLevel: 2 },
      { id: '2-2', type: 'text', content: 'Optimize speed and quality with the right print settings for your model.' }
    ]
  }
]);

const safetyCabinetCourseContent = JSON.stringify([
  {
    id: '1',
    elements: [
      { id: '1-1', type: 'heading', content: 'Safety Cabinet Usage', headingLevel: 1 },
      { id: '1-2', type: 'text', content: 'Learn how to properly use and store materials in the safety cabinet' }
    ]
  },
  {
    id: '2',
    elements: [
      { id: '2-1', type: 'heading', content: 'Chemical Storage', headingLevel: 2 },
      { id: '2-2', type: 'text', content: 'Guidelines for storing chemicals safely and preventing hazardous interactions.' }
    ]
  }
]);

const machineSafetyCourseContent = JSON.stringify([
  {
    id: '1',
    elements: [
      { id: '1-1', type: 'heading', content: 'Machine Safety Fundamentals', headingLevel: 1 },
      { id: '1-2', type: 'text', content: 'Essential safety training required for all makerspace users' }
    ]
  },
  {
    id: '2',
    elements: [
      { id: '2-1', type: 'heading', content: 'Emergency Procedures', headingLevel: 2 },
      { id: '2-2', type: 'text', content: 'What to do in case of an emergency and where to find safety equipment.' }
    ]
  }
]);

// Store original course data for restoration capability
const ORIGINAL_COURSE_TEMPLATES = {
  // Define your original course templates here
  // This will serve as backup data for core courses (1-6)
  '1': {
    title: 'Laser Cutter Training',
    description: 'Learn how to safely operate the lab\'s laser cutter',
    category: 'Equipment',
    content: laserCutterCourseContent,
    imageUrl: 'http://localhost:4000/utils/images/IMG_7814.jpg',
    relatedMachineIds: ['1'],
    quizId: '1',
    difficulty: 'Intermediate'
  },
  '2': {
    title: 'Ultimaker 3D Printer Training',
    description: 'Learn how to use the Ultimaker 3D printer effectively',
    category: 'Equipment',
    content: ultimakerCourseContent,
    imageUrl: 'http://localhost:4000/utils/images/IMG_7815.jpg',
    relatedMachineIds: ['2'],
    quizId: '2',
    difficulty: 'Basic'
  },
  '3': {
    title: 'X1 E Carbon 3D Printer',
    description: 'Advanced training for carbon fiber composite printing',
    category: 'Equipment',
    content: x1CarbonCourseContent,
    imageUrl: 'http://localhost:4000/utils/images/IMG_7773.jpg',
    relatedMachineIds: ['3'],
    quizId: '3',
    difficulty: 'Advanced'
  },
  '4': {
    title: 'Bambu Lab 3D Printer',
    description: 'Learn to use the Bambu Lab printer for high-quality prints',
    category: 'Equipment',
    content: bambuLabCourseContent,
    imageUrl: 'http://localhost:4000/utils/images/IMG_7815.jpg',
    relatedMachineIds: ['4'],
    quizId: '4',
    difficulty: 'Intermediate'
  },
  '5': {
    title: 'Safety Cabinet Usage',
    description: 'Learn how to properly use and store materials in the safety cabinet',
    category: 'Safety',
    content: safetyCabinetCourseContent,
    imageUrl: 'http://localhost:4000/utils/images/IMG_7818.jpg',
    relatedMachineIds: ['5'],
    quizId: '5',
    difficulty: 'Basic'
  },
  '6': {
    title: 'Machine Safety Fundamentals',
    description: 'Essential safety training required for all makerspace users',
    category: 'Safety',
    content: machineSafetyCourseContent,
    imageUrl: 'http://localhost:4000/utils/images/IMG_7821.jpg',
    relatedMachineIds: ['6'],
    quizId: '6',
    difficulty: 'Basic'
  }
};

// Function to seed safety courses
export async function seedSafetyCourses() {
  try {
    // Check if courses already exist
    const course5 = await Course.findById('5');
    const course6 = await Course.findById('6');
    
    // Create Safety Cabinet course if it doesn't exist
    if (!course5) {
      const safetyCabinetCourse = new Course({
        _id: '5',
        title: 'Safety Cabinet Usage',
        description: 'Learn how to properly use and store materials in the safety cabinet',
        category: 'Safety',
        content: safetyCabinetCourseContent,
        imageUrl: 'http://localhost:4000/utils/images/IMG_7818.jpg',
        relatedMachineIds: ['5'],
        quizId: '5',
        difficulty: 'Basic'
      });
      
      await safetyCabinetCourse.save();
      console.log('Created Safety Cabinet course with ID: 5');
    } else {
      console.log('Safety Cabinet course already exists');
    }
    
    // Create Machine Safety course if it doesn't exist
    if (!course6) {
      const machineSafetyCourse = new Course({
        _id: '6',
        title: 'Machine Safety Fundamentals',
        description: 'Essential safety training required for all makerspace users',
        category: 'Safety',
        content: machineSafetyCourseContent,
        imageUrl: 'http://localhost:4000/utils/images/IMG_7821.jpg',
        relatedMachineIds: ['6'],
        quizId: '6',
        difficulty: 'Basic'
      });
      
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
    // Check if courses already exist
    const courses = [
      {
        _id: '1',
        title: 'Laser Cutter Training',
        description: 'Learn how to safely operate the lab\'s laser cutter',
        category: 'Equipment',
        content: laserCutterCourseContent,
        imageUrl: 'http://localhost:4000/utils/images/IMG_7814.jpg',
        relatedMachineIds: ['1'],
        quizId: '1',
        difficulty: 'Intermediate'
      },
      {
        _id: '2',
        title: 'Ultimaker 3D Printer Training',
        description: 'Learn how to use the Ultimaker 3D printer effectively',
        category: 'Equipment',
        content: ultimakerCourseContent,
        imageUrl: 'http://localhost:4000/utils/images/IMG_7815.jpg',
        relatedMachineIds: ['2'],
        quizId: '2',
        difficulty: 'Basic'
      },
      {
        _id: '3',
        title: 'X1 E Carbon 3D Printer',
        description: 'Advanced training for carbon fiber composite printing',
        category: 'Equipment',
        content: x1CarbonCourseContent,
        imageUrl: 'http://localhost:4000/utils/images/IMG_7773.jpg',
        relatedMachineIds: ['3'],
        quizId: '3',
        difficulty: 'Advanced'
      },
      {
        _id: '4',
        title: 'Bambu Lab 3D Printer',
        description: 'Learn to use the Bambu Lab printer for high-quality prints',
        category: 'Equipment',
        content: bambuLabCourseContent,
        imageUrl: 'http://localhost:4000/utils/images/IMG_7815.jpg',
        relatedMachineIds: ['4'],
        quizId: '4',
        difficulty: 'Intermediate'
      },
      {
        _id: '5',
        title: 'Safety Cabinet Usage',
        description: 'Learn how to properly use and store materials in the safety cabinet',
        category: 'Safety',
        content: safetyCabinetCourseContent,
        imageUrl: 'http://localhost:4000/utils/images/IMG_7818.jpg',
        relatedMachineIds: ['5'],
        quizId: '5',
        difficulty: 'Basic'
      },
      {
        _id: '6',
        title: 'Machine Safety Fundamentals',
        description: 'Essential safety training required for all makerspace users',
        category: 'Safety',
        content: machineSafetyCourseContent,
        imageUrl: 'http://localhost:4000/utils/images/IMG_7821.jpg',
        relatedMachineIds: ['6'],
        quizId: '6',
        difficulty: 'Basic'
      }
    ];

    for (const courseData of courses) {
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

// New function to restore soft-deleted core courses
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
