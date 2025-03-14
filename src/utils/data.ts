
export interface Machine {
  id: string;
  name: string;
  description: string;
  image: string;
  courseCompleted: boolean;
  quizPassed: boolean;
}

export interface CourseContent {
  id: string;
  machineId: string;
  title: string;
  content: string;
}

export interface Quiz {
  id: string;
  machineId: string;
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Booking {
  id: string;
  machineId: string;
  userId: string;
  date: string;
  timeSlot: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}

// Sample data
export const machines: Machine[] = [
  {
    id: '1',
    name: 'Laser Cutter',
    description: 'Professional grade laser cutting machine for precise cuts',
    image: '/placeholder.svg',
    courseCompleted: false,
    quizPassed: false,
  },
  {
    id: '2',
    name: 'Ultimaker',
    description: '3D printer for high-quality prototypes and models',
    image: '/placeholder.svg',
    courseCompleted: false,
    quizPassed: false,
  },
  {
    id: '3',
    name: 'Safety Cabinet',
    description: 'Storage for hazardous materials and equipment',
    image: '/placeholder.svg',
    courseCompleted: false,
    quizPassed: false,
  },
  {
    id: '4',
    name: 'X1 E Carbon 3D Printer',
    description: 'Advanced 3D printer for carbon fiber composites',
    image: '/placeholder.svg',
    courseCompleted: false,
    quizPassed: false,
  },
  {
    id: '5',
    name: 'Bambu Lab X1 E',
    description: 'Next-generation 3D printing technology',
    image: '/placeholder.svg',
    courseCompleted: false,
    quizPassed: false,
  },
];

export const courses: Record<string, CourseContent> = {
  '1': {
    id: '1',
    machineId: '1',
    title: 'Laser Cutter Safety',
    content: 'Comprehensive guide to laser cutter safety and operation...',
  },
  // Add more courses
};

export const quizzes: Record<string, Quiz> = {
  '1': {
    id: '1',
    machineId: '1',
    questions: [
      {
        id: '1',
        question: 'What safety equipment must be worn when operating the laser cutter?',
        options: [
          'Safety glasses',
          'Regular glasses',
          'No protection needed',
          'Sunglasses',
        ],
        correctAnswer: 0,
      },
      // Add more questions
    ],
  },
  // Add more quizzes
};
