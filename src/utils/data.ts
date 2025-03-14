export interface Machine {
  id: string;
  name: string;
  description: string;
  image: string;
  courseCompleted: boolean;
  quizPassed: boolean;
  specs?: Record<string, string | string[]>;
  maintenanceDate?: string;
  status?: string;
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
    specs: {
      manufacturer: 'Epilog',
      model: 'Fusion Pro 32',
      'cutting area': '32" x 20"',
      'laser type': 'CO2',
      'max power': '120 watts',
      'supported materials': ['Wood', 'Acrylic', 'Paper', 'Leather', 'Glass (engraving only)']
    },
    maintenanceDate: '2023-05-15',
    status: 'available'
  },
  {
    id: '2',
    name: 'Ultimaker',
    description: '3D printer for high-quality prototypes and models',
    image: '/placeholder.svg',
    courseCompleted: false,
    quizPassed: false,
    specs: {
      manufacturer: 'Ultimaker',
      model: 'S5',
      'build volume': '330 x 240 x 300 mm',
      'layer resolution': 'up to 20 microns',
      'nozzle diameter': '0.4 mm',
      'supported materials': ['PLA', 'ABS', 'Nylon', 'TPU', 'CPE', 'PVA']
    },
    maintenanceDate: '2023-06-01',
    status: 'available'
  },
  {
    id: '3',
    name: 'Safety Cabinet',
    description: 'Storage for hazardous materials and equipment',
    image: '/placeholder.svg',
    courseCompleted: false,
    quizPassed: false,
    specs: {
      manufacturer: 'Justrite',
      model: 'Sure-Grip EX',
      capacity: '45 gallons',
      'cabinet type': 'Flammable storage',
      certification: 'NFPA, OSHA compliant',
      features: ['Self-closing doors', 'Adjustable shelves', 'Leak-proof sump']
    },
    maintenanceDate: '2023-04-22',
    status: 'available'
  },
  {
    id: '4',
    name: 'X1 E Carbon 3D Printer',
    description: 'Advanced 3D printer for carbon fiber composites',
    image: '/placeholder.svg',
    courseCompleted: false,
    quizPassed: false,
    specs: {
      manufacturer: 'Markforged',
      model: 'X1 Carbon',
      'build volume': '330 x 270 x 200 mm',
      'layer resolution': 'up to 50 microns',
      'supported materials': ['Onyx', 'Carbon Fiber', 'Fiberglass', 'Kevlar', 'HSHT Fiberglass'],
      features: ['Closed-loop system', 'In-process inspection', 'Composite reinforcement']
    },
    maintenanceDate: '2023-05-30',
    status: 'available'
  },
  {
    id: '5',
    name: 'Bambu Lab X1 E',
    description: 'Next-generation 3D printing technology',
    image: '/placeholder.svg',
    courseCompleted: false,
    quizPassed: false,
    specs: {
      manufacturer: 'Bambu Lab',
      model: 'X1 Carbon',
      'build volume': '256 x 256 x 256 mm',
      'max print speed': '500 mm/s',
      'supported materials': ['PLA', 'PETG', 'TPU', 'PA', 'PVA', 'ABS'],
      features: ['Core XY', 'Auto bed leveling', 'Multi-material printing', 'AI monitoring']
    },
    maintenanceDate: '2023-06-10',
    status: 'available'
  },
];

export const courses: Record<string, CourseContent> = {
  '1': {
    id: '1',
    machineId: '1',
    title: 'Laser Cutter Safety Course',
    content: `
      <h1>Welcome to the Laser Cutter Safety Course</h1>
      <p>This course will teach you how to safely operate the laser cutter.</p>
      <h2>Course Outline</h2>
      <ul>
        <li>Introduction to Laser Cutting</li>
        <li>Safety Precautions</li>
        <li>Operating Procedures</li>
        <li>Maintenance</li>
      </ul>
    `,
  },
  '2': {
    id: '2',
    machineId: '2',
    title: 'Ultimaker 3D Printer Course',
    content: `
      <h1>Welcome to the Ultimaker 3D Printer Course</h1>
      <p>This course will teach you how to safely operate the Ultimaker 3D Printer.</p>
      <h2>Course Outline</h2>
      <ul>
        <li>Introduction to 3D Printing</li>
        <li>Safety Precautions</li>
        <li>Operating Procedures</li>
        <li>Maintenance</li>
      </ul>
    `,
  },
  '3': {
    id: '3',
    machineId: '3',
    title: 'Safety Cabinet Course',
    content: `
      <h1>Welcome to the Safety Cabinet Course</h1>
      <p>This course will teach you how to safely use the Safety Cabinet.</p>
      <h2>Course Outline</h2>
      <ul>
        <li>Introduction to Safety Cabinets</li>
        <li>Safety Precautions</li>
        <li>Operating Procedures</li>
        <li>Maintenance</li>
      </ul>
    `,
  },
  '4': {
    id: '4',
    machineId: '4',
    title: 'X1 E Carbon 3D Printer Course',
    content: `
      <h1>Welcome to the X1 E Carbon 3D Printer Course</h1>
      <p>This course will teach you how to safely operate the X1 E Carbon 3D Printer.</p>
      <h2>Course Outline</h2>
      <ul>
        <li>Introduction to 3D Printing</li>
        <li>Safety Precautions</li>
        <li>Operating Procedures</li>
        <li>Maintenance</li>
      </ul>
    `,
  },
  '5': {
    id: '5',
    machineId: '5',
    title: 'Bambu Lab X1 E Course',
    content: `
      <h1>Welcome to the Bambu Lab X1 E Course</h1>
      <p>This course will teach you how to safely operate the Bambu Lab X1 E.</p>
      <h2>Course Outline</h2>
      <ul>
        <li>Introduction to 3D Printing</li>
        <li>Safety Precautions</li>
        <li>Operating Procedures</li>
        <li>Maintenance</li>
      </ul>
    `,
  },
};

export const quizzes: Record<string, Quiz> = {
  '1': {
    id: '1',
    machineId: '1',
    questions: [
      {
        id: '1-1',
        question: 'What safety equipment must be worn when operating the laser cutter?',
        options: [
          'Safety glasses',
          'Regular glasses',
          'No protection needed',
          'Sunglasses',
        ],
        correctAnswer: 0,
      },
      {
        id: '1-2',
        question: 'Which material should NEVER be cut with the laser cutter?',
        options: [
          'Cardboard',
          'Acrylic',
          'PVC/Vinyl',
          'Wood',
        ],
        correctAnswer: 2,
      },
      {
        id: '1-3',
        question: 'What should you do before starting a laser cutting job?',
        options: [
          'Disable the ventilation system',
          'Leave the room',
          'Ensure proper material placement and focus',
          'Increase the power to maximum',
        ],
        correctAnswer: 2,
      },
      {
        id: '1-4',
        question: 'What should you do if a fire starts in the laser cutter?',
        options: [
          'Open the lid to let the fire out',
          'Hit the emergency stop button and use the fire extinguisher if needed',
          'Spray water on the machine',
          'Continue the job to see if the fire goes out',
        ],
        correctAnswer: 1,
      },
      {
        id: '1-5',
        question: 'Why is the ventilation system important when using the laser cutter?',
        options: [
          'It keeps the machine cool',
          'It removes potentially harmful fumes and particles',
          'It improves cutting quality',
          'It\'s not important, just optional',
        ],
        correctAnswer: 1,
      },
    ],
  },
  '2': {
    id: '2',
    machineId: '2',
    questions: [
      {
        id: '2-1',
        question: 'What is the purpose of the heated bed on a 3D printer?',
        options: [
          'To keep the printer warm',
          'To help the filament stick to the bed',
          'To melt the filament',
          'To cool the print',
        ],
        correctAnswer: 1,
      },
      {
        id: '2-2',
        question: 'What type of filament is commonly used with the Ultimaker 3D printer?',
        options: [
          'Wood',
          'PLA',
          'Metal',
          'Clay',
        ],
        correctAnswer: 1,
      },
      {
        id: '2-3',
        question: 'What should you do if the filament stops extruding during a print?',
        options: [
          'Increase the print speed',
          'Pause the print and check the filament path',
          'Ignore it and hope it fixes itself',
          'Turn off the printer',
        ],
        correctAnswer: 1,
      },
      {
        id: '2-4',
        question: 'What is the purpose of the cooling fan on the print head?',
        options: [
          'To cool the print head',
          'To cool the extruded filament',
          'To cool the motor',
          'To cool the bed',
        ],
        correctAnswer: 1,
      },
      {
        id: '2-5',
        question: 'What should you do if the print starts to come loose from the bed?',
        options: [
          'Apply more glue to the bed',
          'Pause the print and re-level the bed',
          'Increase the bed temperature',
          'Start a new print',
        ],
        correctAnswer: 1,
      },
    ],
  },
  '3': {
    id: '3',
    machineId: '3',
    questions: [
      {
        id: '3-1',
        question: 'What is the primary purpose of a safety cabinet?',
        options: [
          'To store tools',
          'To store hazardous materials',
          'To store finished products',
          'To store food',
        ],
        correctAnswer: 1,
      },
      {
        id: '3-2',
        question: 'What type of materials should be stored in a flammable safety cabinet?',
        options: [
          'Paper',
          'Flammable liquids',
          'Tools',
          'Food',
        ],
        correctAnswer: 1,
      },
      {
        id: '3-3',
        question: 'What should you do if you spill a hazardous material inside the safety cabinet?',
        options: [
          'Leave it for someone else to clean',
          'Clean it up immediately using proper safety procedures',
          'Ignore it',
          'Use water to clean it',
        ],
        correctAnswer: 1,
      },
      {
        id: '3-4',
        question: 'What is the purpose of the self-closing doors on a safety cabinet?',
        options: [
          'To keep the materials organized',
          'To contain fires',
          'To keep the materials cool',
          'To keep the materials dry',
        ],
        correctAnswer: 1,
      },
      {
        id: '3-5',
        question: 'What should you do if you notice a leak in the safety cabinet?',
        options: [
          'Ignore it',
          'Report it immediately',
          'Try to fix it yourself',
          'Use tape to seal it',
        ],
        correctAnswer: 1,
      },
    ],
  },
  '4': {
    id: '4',
    machineId: '4',
    questions: [
      {
        id: '4-1',
        question: 'What is the primary advantage of using carbon fiber in 3D printing?',
        options: [
          'Increased weight',
          'Increased strength and stiffness',
          'Lower cost',
          'Easier to print',
        ],
        correctAnswer: 1,
      },
      {
        id: '4-2',
        question: 'What type of materials can be reinforced with carbon fiber in the X1 E Carbon 3D Printer?',
        options: [
          'PLA',
          'ABS',
          'Onyx',
          'All of the above',
        ],
        correctAnswer: 2,
      },
      {
        id: '4-3',
        question: 'What is the purpose of the closed-loop system in the X1 E Carbon 3D Printer?',
        options: [
          'To keep the printer cool',
          'To ensure accurate printing',
          'To reduce noise',
          'To save energy',
        ],
        correctAnswer: 1,
      },
      {
        id: '4-4',
        question: 'What is in-process inspection in the X1 E Carbon 3D Printer?',
        options: [
          'Checking the printer\'s temperature',
          'Checking the layer height',
          'Checking the print quality during printing',
          'Checking the filament level',
        ],
        correctAnswer: 2,
      },
      {
        id: '4-5',
        question: 'What should you do if you notice a problem with the carbon fiber reinforcement during printing?',
        options: [
          'Ignore it',
          'Pause the print and check the settings',
          'Increase the print speed',
          'Continue the print',
        ],
        correctAnswer: 1,
      },
    ],
  },
  '5': {
    id: '5',
    machineId: '5',
    questions: [
      {
        id: '5-1',
        question: 'What is the maximum print speed of the Bambu Lab X1 E?',
        options: [
          '100 mm/s',
          '250 mm/s',
          '500 mm/s',
          '1000 mm/s',
        ],
        correctAnswer: 2,
      },
      {
        id: '5-2',
        question: 'What type of bed leveling does the Bambu Lab X1 E use?',
        options: [
          'Manual bed leveling',
          'Automatic bed leveling',
          'No bed leveling',
          'Semi-automatic bed leveling',
        ],
        correctAnswer: 1,
      },
      {
        id: '5-3',
        question: 'What is multi-material printing in the Bambu Lab X1 E?',
        options: [
          'Printing with multiple colors',
          'Printing with multiple materials',
          'Printing with multiple nozzles',
          'Printing with multiple beds',
        ],
        correctAnswer: 1,
      },
      {
        id: '5-4',
        question: 'What is the purpose of AI monitoring in the Bambu Lab X1 E?',
        options: [
          'To monitor the printer\'s temperature',
          'To monitor the print quality',
          'To monitor the filament level',
          'To monitor the printer\'s speed',
        ],
        correctAnswer: 1,
      },
      {
        id: '5-5',
        question: 'What should you do if the AI monitoring detects a problem during printing?',
        options: [
          'Ignore it',
          'Pause the print and check the settings',
          'Increase the print speed',
          'Continue the print',
        ],
        correctAnswer: 1,
      },
    ],
  },
};
