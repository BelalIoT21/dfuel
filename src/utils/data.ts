// This file contains mock data for development

// Mock machine data
export const machines = [
  {
    id: '1',
    name: '3D Printer',
    type: '3D Printer',
    description: 'FDM 3D printer for creating plastic parts and prototypes',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
    courseCompleted: false,
    quizPassed: false
  },
  {
    id: '2',
    name: 'Laser Cutter',
    type: 'Laser Cutter',
    description: 'CO2 laser for cutting and engraving various materials',
    image: 'https://images.unsplash.com/photo-1565696392944-b1a54b3102dd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
    courseCompleted: false,
    quizPassed: false
  },
  {
    id: '3',
    name: 'CNC Router',
    type: 'CNC Router',
    description: 'Computer-controlled cutting machine for wood, plastic, and soft metals',
    image: 'https://images.unsplash.com/photo-1613922979078-66bf966417de?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
    courseCompleted: false,
    quizPassed: false
  },
  {
    id: '4',
    name: 'Electronics Workbench',
    type: 'Electronics',
    description: 'Fully equipped workstation for electronics projects with soldering tools',
    image: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
    courseCompleted: false,
    quizPassed: false
  },
  {
    id: 'safety-cabinet',
    name: 'Safety Cabinet',
    type: 'Safety Cabinet',
    description: 'Complete the safety course to get access to all machines',
    image: 'https://images.unsplash.com/photo-1606091505136-3f9e61673f55?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
    courseCompleted: false,
    quizPassed: false
  }
];

// Mock course data
export const courses = {
  '1': {
    title: '3D Printer Safety Course',
    description: 'Learn how to safely operate the 3D printer.',
    modules: [
      'Introduction to 3D Printing',
      'Safety Guidelines',
      'Operating Procedures',
      'Maintenance'
    ]
  },
  '2': {
    title: 'Laser Cutter Safety Course',
    description: 'Learn how to safely operate the laser cutter.',
    modules: [
      'Introduction to Laser Cutting',
      'Material Compatibility',
      'Safety Protocols',
      'Operation and Maintenance'
    ]
  },
  '3': {
    title: 'CNC Router Safety Course',
    description: 'Learn how to safely operate the CNC router.',
    modules: [
      'Introduction to CNC Routing',
      'Tooling and Materials',
      'Safety Measures',
      'Basic Operations'
    ]
  },
  '4': {
    title: 'Electronics Workbench Safety Course',
    description: 'Learn how to safely use the electronics workbench.',
    modules: [
      'Introduction to Electronics',
      'Soldering Techniques',
      'Safety with Electrical Components',
      'Workbench Etiquette'
    ]
  },
  'safety-cabinet': {
    title: 'General Safety Course',
    description: 'Learn general safety guidelines for the workshop.',
    modules: [
      'Emergency Procedures',
      'First Aid Basics',
      'Fire Safety',
      'Tool Safety'
    ]
  }
};

// Mock quiz data
export const quizzes = {
  '1': {
    title: '3D Printer Safety Quiz',
    questions: [
      {
        question: 'What type of filament should not be used in the 3D printer?',
        options: ['PLA', 'ABS', 'Nylon', 'All of the above'],
        correctAnswer: 'All of the above'
      },
      {
        question: 'What should you do if the 3D printer malfunctions?',
        options: ['Continue printing', 'Try to fix it yourself', 'Report to supervisor', 'Unplug the machine'],
        correctAnswer: 'Report to supervisor'
      }
    ]
  },
  '2': {
    title: 'Laser Cutter Safety Quiz',
    questions: [
      {
        question: 'Which material is safe to cut with the laser cutter?',
        options: ['PVC', 'Wood', 'Metal', 'All of the above'],
        correctAnswer: 'Wood'
      },
      {
        question: 'What safety equipment is required when operating the laser cutter?',
        options: ['Safety glasses', 'Gloves', 'Dust mask', 'All of the above'],
        correctAnswer: 'Safety glasses'
      }
    ]
  },
  '3': {
    title: 'CNC Router Safety Quiz',
    questions: [
      {
        question: 'What personal protective equipment (PPE) is required when operating the CNC router?',
        options: ['Safety glasses', 'Ear protection', 'Dust mask', 'All of the above'],
        correctAnswer: 'All of the above'
      },
      {
        question: 'What should you do before starting a CNC routing job?',
        options: ['Check the material is secured', 'Ensure the cutting path is clear', 'Verify the correct tool is installed', 'All of the above'],
        correctAnswer: 'All of the above'
      }
    ]
  },
  '4': {
    title: 'Electronics Workbench Safety Quiz',
    questions: [
      {
        question: 'What is the first thing you should do before working on any electronic device?',
        options: ['Turn it on', 'Check for loose components', 'Ensure it is unplugged', 'Start soldering'],
        correctAnswer: 'Ensure it is unplugged'
      },
      {
        question: 'What should you use to clean up solder fumes?',
        options: ['A regular fan', 'A fume extractor', 'Your breath', 'Nothing'],
        correctAnswer: 'A fume extractor'
      }
    ]
  },
  'safety-cabinet': {
    title: 'General Safety Quiz',
    questions: [
      {
        question: 'What is the first step in case of a fire?',
        options: ['Panic', 'Call 911', 'Activate the fire alarm', 'Run away'],
        correctAnswer: 'Activate the fire alarm'
      },
      {
        question: 'Where should you dispose of chemical waste?',
        options: ['Regular trash can', 'Down the drain', 'Designated waste container', 'Leave it on the table'],
        correctAnswer: 'Designated waste container'
      }
    ]
  }
};
