
import { 
  laserCutterCourseContent,
  ultimakerCourseContent,
  x1CarbonCourseContent,
  bambuLabCourseContent,
  safetyCabinetCourseContent,
  machineSafetyCourseContent
} from './courseContent';
import { getImageUrl } from './imageUtils';

// Original course templates for restoration capability
export const ORIGINAL_COURSE_TEMPLATES = {
  // Define your original course templates here
  // This will serve as backup data for core courses (1-6)
  '1': {
    title: 'Laser Cutter Training',
    description: 'Learn how to safely operate the lab\'s laser cutter',
    category: 'Equipment',
    content: laserCutterCourseContent,
    imageUrl: getImageUrl('IMG_7814.jpg'),
    relatedMachineIds: ['1'],
    quizId: '1',
    difficulty: 'Intermediate'
  },
  '2': {
    title: 'Ultimaker 3D Printer Training',
    description: 'Learn how to use the Ultimaker 3D printer effectively',
    category: 'Equipment',
    content: ultimakerCourseContent,
    imageUrl: getImageUrl('IMG_7815.jpg'),
    relatedMachineIds: ['2'],
    quizId: '2',
    difficulty: 'Basic'
  },
  '3': {
    title: 'X1 E Carbon 3D Printer',
    description: 'Advanced training for carbon fiber composite printing',
    category: 'Equipment',
    content: x1CarbonCourseContent,
    imageUrl: getImageUrl('IMG_7773.jpg'),
    relatedMachineIds: ['3'],
    quizId: '3',
    difficulty: 'Advanced'
  },
  '4': {
    title: 'Bambu Lab 3D Printer',
    description: 'Learn to use the Bambu Lab printer for high-quality prints',
    category: 'Equipment',
    content: bambuLabCourseContent,
    imageUrl: getImageUrl('IMG_7815.jpg'),
    relatedMachineIds: ['4'],
    quizId: '4',
    difficulty: 'Intermediate'
  },
  '5': {
    title: 'Safety Cabinet Usage',
    description: 'Learn how to properly use and store materials in the safety cabinet',
    category: 'Safety',
    content: safetyCabinetCourseContent,
    imageUrl: getImageUrl('IMG_7818.jpg'),
    relatedMachineIds: ['5'],
    quizId: '5',
    difficulty: 'Basic'
  },
  '6': {
    title: 'Machine Safety Fundamentals',
    description: 'Essential safety training required for all makerspace users',
    category: 'Safety',
    content: machineSafetyCourseContent,
    imageUrl: getImageUrl('IMG_7821.jpg'),
    relatedMachineIds: ['6'],
    quizId: '6',
    difficulty: 'Basic'
  }
};

// Export the predefined courses array for use in seeding
export const predefinedCourses = [
  {
    _id: '1',
    title: 'Laser Cutter Training',
    description: 'Learn how to safely operate the lab\'s laser cutter',
    category: 'Equipment',
    content: laserCutterCourseContent,
    imageUrl: getImageUrl('IMG_7814.jpg'),
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
    imageUrl: getImageUrl('IMG_7815.jpg'),
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
    imageUrl: getImageUrl('IMG_7773.jpg'),
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
    imageUrl: getImageUrl('IMG_7815.jpg'),
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
    imageUrl: getImageUrl('IMG_7818.jpg'),
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
    imageUrl: getImageUrl('IMG_7821.jpg'),
    relatedMachineIds: ['6'],
    quizId: '6',
    difficulty: 'Basic'
  }
];
