import { Course } from '../../models/Course';

// Define an interface for course template objects
interface CourseTemplate {
  _id: string;
  title: string;
  description: string;
  category: string;
  content: string;
  imageUrl: string;
  relatedMachineIds: string[];
  quizId: string;
  difficulty: string;
}

// Define a type for the templates object with string keys
interface CourseTemplates {
  [key: string]: CourseTemplate;
}

// Function to update course images
export async function updateCourseImages() {
  try {
    const courseUpdates = [
      {
        _id: '1',
        imageUrl: 'http://localhost:4000/utils/images/IMG_7814.jpg'
      },
      {
        _id: '2',
        imageUrl: 'http://localhost:4000/utils/images/IMG_7815.jpg'
      },
      {
        _id: '3',
        imageUrl: 'http://localhost:4000/utils/images/IMG_7818.jpg'
      },
      {
        _id: '4',
        imageUrl: 'http://localhost:4000/utils/images/IMG_7825.jpg'
      }
    ];

    for (const update of courseUpdates) {
      const result = await Course.updateOne(
        { _id: update._id },
        { $set: { imageUrl: update.imageUrl } }
      );
      
      if (result.matchedCount > 0) {
        console.log(`Updated image for course ${update._id}`);
      } else {
        console.log(`Course ${update._id} not found for image update`);
      }
    }
  } catch (error) {
    console.error('Error updating course images:', error);
  }
}

// Function to check if courses need to be seeded
export async function checkAndSeedCourses() {
  try {
    // Define expected course IDs
    const expectedCourseIds = ['1', '2', '3', '4'];
    
    // Get existing course IDs
    const existingCourses = await Course.find({}, '_id');
    const existingCourseIds = existingCourses.map(c => c._id);
    
    // Find missing course IDs
    const missingCourseIds = expectedCourseIds.filter(id => !existingCourseIds.includes(id));
    
    if (missingCourseIds.length > 0) {
      console.log(`Missing course IDs: ${missingCourseIds.join(', ')}. Seeding missing courses...`);
      await seedMissingCourses(missingCourseIds);
    } else {
      console.log('All expected courses exist. Updating images...');
      await updateCourseImages();
    }
  } catch (error) {
    console.error('Error checking courses:', error);
  }
}

// Function to seed missing courses
async function seedMissingCourses(missingIds: string[]) {
  try {
    const courseTemplates: CourseTemplates = {
      '1': {
        _id: '1',
        title: 'Laser Cutter Safety Course',
        description: 'Learn the fundamentals of laser cutting technology and safety protocols.',
        category: 'Fabrication',
        content: '# Laser Cutter Safety Course\n\nWelcome to the Laser Cutter Safety Course. This course will introduce you to the fundamental concepts of laser cutting and important safety procedures.\n\n## Safety First\n\nBefore operating the laser cutter, it\'s essential to understand the safety procedures.\n\n## Materials\n\nDifferent materials react differently to laser cutting. In this section, we\'ll explore various materials and their properties.',
        imageUrl: 'http://localhost:4000/utils/images/IMG_7814.jpg',
        relatedMachineIds: ['1'],
        quizId: '1',
        difficulty: 'Intermediate'
      },
      '2': {
        _id: '2',
        title: 'Ultimaker 3D Printer Course',
        description: 'Get started with Ultimaker 3D printing technology.',
        category: 'Fabrication',
        content: '# Ultimaker 3D Printer Course\n\nWelcome to the Ultimaker 3D Printer Course. This course will introduce you to the exciting world of 3D printing with the Ultimaker.\n\n## What is 3D Printing?\n\n3D printing, also known as additive manufacturing, is a process of making three dimensional solid objects from a digital file.\n\n## Common Technologies\n\nThe Ultimaker uses FDM (Fused Deposition Modeling) technology to create precise and reliable prints.',
        imageUrl: 'http://localhost:4000/utils/images/IMG_7815.jpg',
        relatedMachineIds: ['2'],
        quizId: '2',
        difficulty: 'Beginner'
      },
      '3': {
        _id: '3',
        title: 'X1 E Carbon 3D Printer Training',
        description: 'Advanced training for the X1 E Carbon 3D Printer.',
        category: 'Fabrication',
        content: '# X1 E Carbon 3D Printer Training\n\nWelcome to the X1 E Carbon 3D Printer training course. This advanced 3D printer offers exceptional capabilities for creating high-strength parts with carbon fiber materials.\n\n## Carbon Fiber Printing\n\nLearn how to work with carbon fiber reinforced materials for maximum strength and durability.\n\n## Advanced Settings\n\nMaster the specialized settings required for optimal printing results with the X1 E Carbon.',
        imageUrl: 'http://localhost:4000/utils/images/IMG_7818.jpg',
        relatedMachineIds: ['3'],
        quizId: '3',
        difficulty: 'Advanced'
      },
      '4': {
        _id: '4',
        title: 'Bambu Lab X1 E Course',
        description: 'Complete guide to using the Bambu Lab X1 E 3D printer.',
        category: 'Fabrication',
        content: '# Bambu Lab X1 E Course\n\nWelcome to the Bambu Lab X1 E Course. This comprehensive guide will teach you how to get the most out of your Bambu Lab X1 E 3D printer.\n\n## High-Speed Printing\n\nLearn how to utilize the X1 E\'s impressive 500mm/s print speeds while maintaining quality.\n\n## Multi-Material Printing\n\nMaster the art of printing with multiple materials in a single print job using the Bambu Lab X1 E.',
        imageUrl: 'http://localhost:4000/utils/images/IMG_7825.jpg',
        relatedMachineIds: ['4'],
        quizId: '4',
        difficulty: 'Intermediate'
      }
    };

    // Create the missing courses
    for (const id of missingIds) {
      if (id in courseTemplates) {
        const courseTemplate = courseTemplates[id];
        const newCourse = new Course(courseTemplate);
        await newCourse.save();
        console.log(`Created missing course: ${courseTemplate.title} (ID: ${id})`);
      } else {
        console.warn(`No template found for course ID: ${id}`);
      }
    }
  } catch (error) {
    console.error('Error seeding missing courses:', error);
  }
}

// Function to seed all courses (used for initial setup)
export async function seedCourses() {
  try {
    const courses = [
      {
        _id: '1',
        title: 'Laser Cutter Safety Course',
        description: 'Learn the fundamentals of laser cutting technology and safety protocols.',
        category: 'Fabrication',
        content: '# Laser Cutter Safety Course\n\nWelcome to the Laser Cutter Safety Course. This course will introduce you to the fundamental concepts of laser cutting and important safety procedures.\n\n## Safety First\n\nBefore operating the laser cutter, it\'s essential to understand the safety procedures.\n\n## Materials\n\nDifferent materials react differently to laser cutting. In this section, we\'ll explore various materials and their properties.',
        imageUrl: 'http://localhost:4000/utils/images/IMG_7814.jpg',
        relatedMachineIds: ['1'],
        quizId: '1',
        difficulty: 'Intermediate'
      },
      {
        _id: '2',
        title: 'Ultimaker 3D Printer Course',
        description: 'Get started with Ultimaker 3D printing technology.',
        category: 'Fabrication',
        content: '# Ultimaker 3D Printer Course\n\nWelcome to the Ultimaker 3D Printer Course. This course will introduce you to the exciting world of 3D printing with the Ultimaker.\n\n## What is 3D Printing?\n\n3D printing, also known as additive manufacturing, is a process of making three dimensional solid objects from a digital file.\n\n## Common Technologies\n\nThe Ultimaker uses FDM (Fused Deposition Modeling) technology to create precise and reliable prints.',
        imageUrl: 'http://localhost:4000/utils/images/IMG_7815.jpg',
        relatedMachineIds: ['2'],
        quizId: '2',
        difficulty: 'Beginner'
      },
      {
        _id: '3',
        title: 'X1 E Carbon 3D Printer Training',
        description: 'Advanced training for the X1 E Carbon 3D Printer.',
        category: 'Fabrication',
        content: '# X1 E Carbon 3D Printer Training\n\nWelcome to the X1 E Carbon 3D Printer training course. This advanced 3D printer offers exceptional capabilities for creating high-strength parts with carbon fiber materials.\n\n## Carbon Fiber Printing\n\nLearn how to work with carbon fiber reinforced materials for maximum strength and durability.\n\n## Advanced Settings\n\nMaster the specialized settings required for optimal printing results with the X1 E Carbon.',
        imageUrl: 'http://localhost:4000/utils/images/IMG_7818.jpg',
        relatedMachineIds: ['3'],
        quizId: '3',
        difficulty: 'Advanced'
      },
      {
        _id: '4',
        title: 'Bambu Lab X1 E Course',
        description: 'Complete guide to using the Bambu Lab X1 E 3D printer.',
        category: 'Fabrication',
        content: '# Bambu Lab X1 E Course\n\nWelcome to the Bambu Lab X1 E Course. This comprehensive guide will teach you how to get the most out of your Bambu Lab X1 E 3D printer.\n\n## High-Speed Printing\n\nLearn how to utilize the X1 E\'s impressive 500mm/s print speeds while maintaining quality.\n\n## Multi-Material Printing\n\nMaster the art of printing with multiple materials in a single print job using the Bambu Lab X1 E.',
        imageUrl: 'http://localhost:4000/utils/images/IMG_7825.jpg',
        relatedMachineIds: ['4'],
        quizId: '4',
        difficulty: 'Intermediate'
      }
    ];

    for (const course of courses) {
      const newCourse = new Course(course);
      await newCourse.save();
      console.log(`Created course: ${course.title}`);
    }

    console.log(`Created ${courses.length} courses successfully`);
  } catch (error) {
    console.error('Error seeding courses:', error);
  }
}

// Function to generate a new course ID (starting from 5)
export async function generateNewCourseId(): Promise<string> {
  try {
    // Get all existing courses
    const existingCourses = await Course.find({}, '_id').sort({ _id: 1 });
    
    // Extract numeric IDs
    const numericIds = existingCourses
      .map(c => c._id)
      .filter(id => /^\d+$/.test(id.toString()))
      .map(id => parseInt(id.toString()));
    
    // Find the highest numeric ID, defaulting to 4 if none found
    // This ensures new IDs start at 5
    const highestId = numericIds.length > 0 ? Math.max(...numericIds) : 4;
    
    // New ID should be the highest + 1, ensuring minimum of 5
    const newId = Math.max(highestId + 1, 5);
    
    console.log(`Generated new course ID: ${newId}`);
    return newId.toString();
  } catch (error) {
    console.error('Error generating new course ID:', error);
    // Return 5 as a fallback
    return "5";
  }
}
