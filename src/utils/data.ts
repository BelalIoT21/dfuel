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
  slides: CourseSlide[];
  duration: string;
}

export interface CourseSlide {
  title: string;
  content: string;
  image: string;
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

// Default quiz for fallback
export const defaultQuiz: QuizQuestion[] = [
  {
    id: 'default-1',
    question: 'Which safety precaution is most important when using equipment?',
    options: [
      'Always read the manual first',
      'Wear appropriate personal protective equipment',
      'Have someone else present',
      'Take your time and don\'t rush'
    ],
    correctAnswer: 1
  },
  {
    id: 'default-2',
    question: 'What should you do before operating any machine?',
    options: [
      'Take a photo',
      'Complete the required training',
      'Oil all moving parts',
      'Run a test cycle'
    ],
    correctAnswer: 1
  },
  {
    id: 'default-3',
    question: 'What should you do if equipment malfunctions?',
    options: [
      'Try to fix it yourself',
      'Keep using it but be careful',
      'Report it immediately and stop using it',
      'Restart the machine'
    ],
    correctAnswer: 2
  }
];

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

// Modify the courses to include the slides and duration properties
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
    duration: '45 minutes',
    slides: [
      {
        title: 'Introduction to Laser Cutting',
        content: 'Laser cutting is a technology that uses a laser to cut materials. It is typically used for industrial manufacturing applications, but is also starting to be used by schools, small businesses, and hobbyists.',
        image: '/placeholder.svg'
      },
      {
        title: 'Safety Precautions',
        content: 'Never leave the laser cutter unattended while it is operating. Always use the ventilation system. Never attempt to cut materials not approved for laser cutting such as PVC or vinyl.',
        image: '/placeholder.svg'
      },
      {
        title: 'Operating Procedures',
        content: 'Prepare your file in the appropriate software. Position your material on the bed. Focus the laser. Set the appropriate power and speed settings.',
        image: '/placeholder.svg'
      },
      {
        title: 'Maintenance',
        content: 'Clean the cutting bed after each use. Check the lens regularly for debris. Clean the exhaust system filters according to the maintenance schedule.',
        image: '/placeholder.svg'
      }
    ]
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
    duration: '60 minutes',
    slides: [
      {
        title: 'Introduction to 3D Printing',
        content: '3D printing is an additive manufacturing process that creates three-dimensional objects by depositing materials layer by layer according to a digital model.',
        image: '/placeholder.svg'
      },
      {
        title: 'Safety Precautions',
        content: 'The nozzle can reach temperatures of 280°C. Never touch it during or immediately after printing. The build plate can also get very hot.',
        image: '/placeholder.svg'
      },
      {
        title: 'Operating Procedures',
        content: 'Prepare your 3D model in CAD software. Export as an STL file. Import into slicing software. Configure settings and start the print.',
        image: '/placeholder.svg'
      },
      {
        title: 'Maintenance',
        content: 'Clean the build plate regularly. Check belts for tension. Keep filament dry. Lubricate moving parts according to the schedule.',
        image: '/placeholder.svg'
      }
    ]
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
    duration: '75 minutes',
    slides: [
      {
        title: 'Introduction to Carbon Fiber Printing',
        content: 'Carbon fiber 3D printing creates exceptionally strong and lightweight parts for functional prototypes and end-use parts.',
        image: '/placeholder.svg'
      },
      {
        title: 'Safety Precautions',
        content: 'Always wear nitrile gloves when handling carbon fiber filaments. Use proper ventilation to avoid inhaling particles.',
        image: '/placeholder.svg'
      },
      {
        title: 'Material Properties',
        content: 'Carbon fiber reinforced filaments offer superior strength-to-weight ratio and stiffness compared to standard materials.',
        image: '/placeholder.svg'
      },
      {
        title: 'Maintenance',
        content: 'Carbon fiber materials are abrasive and will wear out standard brass nozzles quickly. Use hardened steel nozzles and replace them regularly.',
        image: '/placeholder.svg'
      }
    ]
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
    duration: '50 minutes',
    slides: [
      {
        title: 'Introduction to the Bambu Lab X1 E',
        content: 'The Bambu Lab X1 E is a high-speed Core XY 3D printer with advanced features like auto bed leveling and AI monitoring.',
        image: '/placeholder.svg'
      },
      {
        title: 'Core Features',
        content: 'This printer offers multi-material printing capabilities, high printing speeds up to 500 mm/s, and a built-in camera for monitoring.',
        image: '/placeholder.svg'
      },
      {
        title: 'Filament Compatibility',
        content: 'The X1 E can print with PLA, PETG, TPU, ABS, PA, and more. It includes a filament runout sensor for continuous printing.',
        image: '/placeholder.svg'
      },
      {
        title: 'Maintenance',
        content: 'Clean the build plate before each print. Check and clean the nozzle regularly. Update firmware when prompted.',
        image: '/placeholder.svg'
      }
    ]
  },
  '6': {
    id: '6',
    machineId: '6',
    title: 'Machine Safety Course',
    content: `
      <h1>Welcome to the Machine Safety Course</h1>
      <p>This course covers essential safety practices for all machines in our makerspace.</p>
      <h2>Course Outline</h2>
      <ul>
        <li>General Safety Principles</li>
        <li>Emergency Procedures</li>
        <li>Personal Protective Equipment</li>
        <li>Hazard Identification</li>
        <li>Safe Work Practices</li>
      </ul>
    `,
    duration: '60 minutes',
    slides: [
      {
        title: 'General Safety Principles',
        content: 'Safety is everyone\'s responsibility. Always follow safety protocols, never work when tired or impaired, and be aware of your surroundings at all times.',
        image: '/placeholder.svg'
      },
      {
        title: 'Emergency Procedures',
        content: 'Know the location of emergency exits, fire extinguishers, first aid kits, and emergency stop buttons. In case of emergency, follow the evacuation plan and call for help immediately.',
        image: '/placeholder.svg'
      },
      {
        title: 'Personal Protective Equipment',
        content: 'Always wear appropriate PPE for the task at hand. This may include safety glasses, gloves, hearing protection, and closed-toe shoes. Never remove or modify safety guards on machines.',
        image: '/placeholder.svg'
      },
      {
        title: 'Hazard Identification',
        content: 'Learn to identify common hazards: mechanical (moving parts), electrical, chemical, fire, and ergonomic hazards. Report any unsafe conditions immediately.',
        image: '/placeholder.svg'
      },
      {
        title: 'Safe Work Practices',
        content: 'Always get proper training before using any equipment. Keep your work area clean and organized. Use tools and equipment only for their intended purpose. Never rush or take shortcuts.',
        image: '/placeholder.svg'
      }
    ]
  }
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
  '6': {
    id: '6',
    machineId: '6',
    questions: [
      {
        id: '6-1',
        question: 'What is the first thing you should do before operating any machine in the makerspace?',
        options: [
          'Check if anyone else wants to use it',
          'Get proper training and certification',
          'Clean the machine',
          'Take a picture of it'
        ],
        correctAnswer: 1,
      },
      {
        id: '6-2',
        question: 'What should you do if you notice a machine is damaged or not working properly?',
        options: [
          'Try to fix it yourself',
          'Use it anyway but be careful',
          'Report it to staff and tag it as out of order',
          'Leave it for the next person to deal with'
        ],
        correctAnswer: 2,
      },
      {
        id: '6-3',
        question: 'When should you remove safety guards from machinery?',
        options: [
          'When they get in the way of your work',
          'When you need to clean the machine',
          'When they slow down production',
          'Never - they should always remain in place'
        ],
        correctAnswer: 3,
      },
      {
        id: '6-4',
        question: 'What is the most important personal protective equipment (PPE) for most makerspace activities?',
        options: [
          'Safety glasses/goggles',
          'Noise-cancelling headphones',
          'Steel-toed boots',
          'Fireproof clothing'
        ],
        correctAnswer: 0,
      },
      {
        id: '6-5',
        question: 'What should you do in case of a fire emergency in the makerspace?',
        options: [
          'Hide under a table',
          'Try to save expensive equipment first',
          'Follow the evacuation plan and alert others',
          'Finish what you're working on, then leave'
        ],
        correctAnswer: 2,
      },
    ],
  },
};
