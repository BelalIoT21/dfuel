
// Define quiz content templates

// Original quiz templates for restoration capability
export const ORIGINAL_QUIZ_TEMPLATES = {
  '1': {
    title: 'Laser Cutter Quiz',
    description: 'Test your knowledge of laser cutter operation and safety',
    category: 'Equipment',
    questions: [
      {
        question: 'What should you never leave unattended when operating?',
        options: [
          'The computer',
          'The laser cutter',
          'Your notebook',
          'Your phone'
        ],
        correctAnswer: 1,
        explanation: 'Never leave the laser cutter unattended while it is operating to prevent fire hazards.'
      },
      {
        question: 'What material should NEVER be cut in the laser cutter?',
        options: [
          'Wood',
          'Paper',
          'PVC',
          'Acrylic'
        ],
        correctAnswer: 2,
        explanation: 'PVC releases toxic chlorine gas when cut and can damage the machine.'
      }
    ],
    passingScore: 70,
    imageUrl: 'http://localhost:4000/utils/images/IMG_7814.jpg',
    relatedMachineIds: ['1'],
    relatedCourseId: '1',
    difficulty: 'Intermediate'
  },
  '2': {
    title: 'Ultimaker 3D Printer Quiz',
    description: 'Test your knowledge of Ultimaker 3D printer operation',
    category: 'Equipment',
    questions: [
      {
        question: 'What is the first thing you should check before starting a print?',
        options: [
          'The color of the filament',
          'The bed leveling',
          'The print time',
          'The file name'
        ],
        correctAnswer: 1,
        explanation: 'Always ensure the print bed is properly leveled before starting a print.'
      },
      {
        question: 'What material is generally easiest to print with?',
        options: [
          'ABS',
          'Nylon',
          'PLA',
          'TPU'
        ],
        correctAnswer: 2,
        explanation: 'PLA is the most forgiving material for 3D printing and has the widest temperature range.'
      }
    ],
    passingScore: 70,
    imageUrl: 'http://localhost:4000/utils/images/IMG_7815.jpg',
    relatedMachineIds: ['2'],
    relatedCourseId: '2',
    difficulty: 'Basic'
  },
  '3': {
    title: 'X1 E Carbon 3D Printer Quiz',
    description: 'Test your knowledge of carbon fiber composite printing',
    category: 'Equipment',
    questions: [
      {
        question: 'What special property does carbon fiber filament have?',
        options: [
          'It\'s flexible',
          'It\'s stronger and stiffer',
          'It\'s transparent',
          'It\'s magnetic'
        ],
        correctAnswer: 1,
        explanation: 'Carbon fiber filaments provide added strength and stiffness to printed parts.'
      },
      {
        question: 'What type of nozzle is recommended for carbon fiber filaments?',
        options: [
          'Brass',
          'Stainless steel',
          'Hardened steel',
          'Any standard nozzle'
        ],
        correctAnswer: 2,
        explanation: 'Hardened steel nozzles are required because carbon fiber filaments are highly abrasive.'
      }
    ],
    passingScore: 70,
    imageUrl: 'http://localhost:4000/utils/images/IMG_7773.jpg',
    relatedMachineIds: ['3'],
    relatedCourseId: '3',
    difficulty: 'Advanced'
  },
  '4': {
    title: 'Bambu Lab 3D Printer Quiz',
    description: 'Test your knowledge of Bambu Lab printer operation',
    category: 'Equipment',
    questions: [
      {
        question: 'What is a unique feature of the Bambu Lab printer?',
        options: [
          'Water cooling',
          'High print speeds',
          'Built-in camera',
          'All of the above'
        ],
        correctAnswer: 3,
        explanation: 'The Bambu Lab printer features all of these advanced capabilities.'
      },
      {
        question: 'What should you check before starting a high-speed print?',
        options: [
          'That the printer is firmly placed on a stable surface',
          'That the filament is properly loaded',
          'That the print cooling fans are working',
          'All of the above'
        ],
        correctAnswer: 3,
        explanation: 'All of these checks are important before starting a high-speed print.'
      }
    ],
    passingScore: 70,
    imageUrl: 'http://localhost:4000/utils/images/IMG_7815.jpg',
    relatedMachineIds: ['4'],
    relatedCourseId: '4',
    difficulty: 'Intermediate'
  },
  '5': {
    title: 'Safety Cabinet Quiz',
    description: 'Test your knowledge of hazardous material storage',
    category: 'Safety',
    questions: [
      {
        question: 'What should never be stored together?',
        options: [
          'Flammable and combustible materials',
          'Acids and bases',
          'Dry and wet materials',
          'New and old materials'
        ],
        correctAnswer: 1,
        explanation: 'Acids and bases can react violently if mixed and should be stored separately.'
      },
      {
        question: 'What information must be visible on all containers in the safety cabinet?',
        options: [
          'Purchase date',
          'Price',
          'Chemical name and hazards',
          'Manufacturer name'
        ],
        correctAnswer: 2,
        explanation: 'All containers must be clearly labeled with the chemical name and hazard information.'
      }
    ],
    passingScore: 70,
    imageUrl: 'http://localhost:4000/utils/images/IMG_7818.jpg',
    relatedMachineIds: ['5'],
    relatedCourseId: '5',
    difficulty: 'Basic'
  },
  '6': {
    title: 'Machine Safety Fundamentals Quiz',
    description: 'Test your knowledge of basic makerspace safety',
    category: 'Safety',
    questions: [
      {
        question: 'What should you do first in case of a fire?',
        options: [
          'Call the instructor',
          'Try to put it out yourself',
          'Activate the fire alarm',
          'Save your project files'
        ],
        correctAnswer: 2,
        explanation: 'Always activate the fire alarm first to alert everyone in the building.'
      },
      {
        question: 'When should you wear safety glasses?',
        options: [
          'Only when working with wood',
          'Only when the instructor is watching',
          'Whenever operating machinery',
          'Only when working with metal'
        ],
        correctAnswer: 2,
        explanation: 'Safety glasses should be worn any time you are operating or near operating machinery.'
      }
    ],
    passingScore: 70,
    imageUrl: 'http://localhost:4000/utils/images/IMG_7821.jpg',
    relatedMachineIds: ['6'],
    relatedCourseId: '6',
    difficulty: 'Basic'
  }
};

// Export the predefined quizzes array for use in seeding
export const predefinedQuizzes = [
  {
    _id: '1',
    title: 'Laser Cutter Quiz',
    description: 'Test your knowledge of laser cutter operation and safety',
    category: 'Equipment',
    questions: [
      {
        question: 'What should you never leave unattended when operating?',
        options: [
          'The computer',
          'The laser cutter',
          'Your notebook',
          'Your phone'
        ],
        correctAnswer: 1,
        explanation: 'Never leave the laser cutter unattended while it is operating to prevent fire hazards.'
      },
      {
        question: 'What material should NEVER be cut in the laser cutter?',
        options: [
          'Wood',
          'Paper',
          'PVC',
          'Acrylic'
        ],
        correctAnswer: 2,
        explanation: 'PVC releases toxic chlorine gas when cut and can damage the machine.'
      }
    ],
    passingScore: 70,
    imageUrl: 'http://localhost:4000/utils/images/IMG_7814.jpg',
    relatedMachineIds: ['1'],
    relatedCourseId: '1',
    difficulty: 'Intermediate'
  },
  {
    _id: '2',
    title: 'Ultimaker 3D Printer Quiz',
    description: 'Test your knowledge of Ultimaker 3D printer operation',
    category: 'Equipment',
    questions: [
      {
        question: 'What is the first thing you should check before starting a print?',
        options: [
          'The color of the filament',
          'The bed leveling',
          'The print time',
          'The file name'
        ],
        correctAnswer: 1,
        explanation: 'Always ensure the print bed is properly leveled before starting a print.'
      },
      {
        question: 'What material is generally easiest to print with?',
        options: [
          'ABS',
          'Nylon',
          'PLA',
          'TPU'
        ],
        correctAnswer: 2,
        explanation: 'PLA is the most forgiving material for 3D printing and has the widest temperature range.'
      }
    ],
    passingScore: 70,
    imageUrl: 'http://localhost:4000/utils/images/IMG_7815.jpg',
    relatedMachineIds: ['2'],
    relatedCourseId: '2',
    difficulty: 'Basic'
  },
  {
    _id: '3',
    title: 'X1 E Carbon 3D Printer Quiz',
    description: 'Test your knowledge of carbon fiber composite printing',
    category: 'Equipment',
    questions: [
      {
        question: 'What special property does carbon fiber filament have?',
        options: [
          'It\'s flexible',
          'It\'s stronger and stiffer',
          'It\'s transparent',
          'It\'s magnetic'
        ],
        correctAnswer: 1,
        explanation: 'Carbon fiber filaments provide added strength and stiffness to printed parts.'
      },
      {
        question: 'What type of nozzle is recommended for carbon fiber filaments?',
        options: [
          'Brass',
          'Stainless steel',
          'Hardened steel',
          'Any standard nozzle'
        ],
        correctAnswer: 2,
        explanation: 'Hardened steel nozzles are required because carbon fiber filaments are highly abrasive.'
      }
    ],
    passingScore: 70,
    imageUrl: 'http://localhost:4000/utils/images/IMG_7773.jpg',
    relatedMachineIds: ['3'],
    relatedCourseId: '3',
    difficulty: 'Advanced'
  },
  {
    _id: '4',
    title: 'Bambu Lab 3D Printer Quiz',
    description: 'Test your knowledge of Bambu Lab printer operation',
    category: 'Equipment',
    questions: [
      {
        question: 'What is a unique feature of the Bambu Lab printer?',
        options: [
          'Water cooling',
          'High print speeds',
          'Built-in camera',
          'All of the above'
        ],
        correctAnswer: 3,
        explanation: 'The Bambu Lab printer features all of these advanced capabilities.'
      },
      {
        question: 'What should you check before starting a high-speed print?',
        options: [
          'That the printer is firmly placed on a stable surface',
          'That the filament is properly loaded',
          'That the print cooling fans are working',
          'All of the above'
        ],
        correctAnswer: 3,
        explanation: 'All of these checks are important before starting a high-speed print.'
      }
    ],
    passingScore: 70,
    imageUrl: 'http://localhost:4000/utils/images/IMG_7815.jpg',
    relatedMachineIds: ['4'],
    relatedCourseId: '4',
    difficulty: 'Intermediate'
  },
  {
    _id: '5',
    title: 'Safety Cabinet Quiz',
    description: 'Test your knowledge of hazardous material storage',
    category: 'Safety',
    questions: [
      {
        question: 'What should never be stored together?',
        options: [
          'Flammable and combustible materials',
          'Acids and bases',
          'Dry and wet materials',
          'New and old materials'
        ],
        correctAnswer: 1,
        explanation: 'Acids and bases can react violently if mixed and should be stored separately.'
      },
      {
        question: 'What information must be visible on all containers in the safety cabinet?',
        options: [
          'Purchase date',
          'Price',
          'Chemical name and hazards',
          'Manufacturer name'
        ],
        correctAnswer: 2,
        explanation: 'All containers must be clearly labeled with the chemical name and hazard information.'
      }
    ],
    passingScore: 70,
    imageUrl: 'http://localhost:4000/utils/images/IMG_7818.jpg',
    relatedMachineIds: ['5'],
    relatedCourseId: '5',
    difficulty: 'Basic'
  },
  {
    _id: '6',
    title: 'Machine Safety Fundamentals Quiz',
    description: 'Test your knowledge of basic makerspace safety',
    category: 'Safety',
    questions: [
      {
        question: 'What should you do first in case of a fire?',
        options: [
          'Call the instructor',
          'Try to put it out yourself',
          'Activate the fire alarm',
          'Save your project files'
        ],
        correctAnswer: 2,
        explanation: 'Always activate the fire alarm first to alert everyone in the building.'
      },
      {
        question: 'When should you wear safety glasses?',
        options: [
          'Only when working with wood',
          'Only when the instructor is watching',
          'Whenever operating machinery',
          'Only when working with metal'
        ],
        correctAnswer: 2,
        explanation: 'Safety glasses should be worn any time you are operating or near operating machinery.'
      }
    ],
    passingScore: 70,
    imageUrl: 'http://localhost:4000/utils/images/IMG_7821.jpg',
    relatedMachineIds: ['6'],
    relatedCourseId: '6',
    difficulty: 'Basic'
  }
];
