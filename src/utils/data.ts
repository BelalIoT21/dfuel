import { CourseType, QuizType } from "@/types";

export const machines = [
  {
    id: 'safety-cabinet',
    name: 'Safety Cabinet',
    description: 'Learn about shop safety and machine protocols.',
    image: 'https://images.unsplash.com/photo-1555447570-39b4ddb88252?q=80&w=870&auto=format&fit=crop',
    type: 'Safety Cabinet',
    specs: {
      'Purpose': 'Safety training and certification',
      'Required': 'Required for all shop users',
      'Certification': 'Required before using other machines'
    },
    maintenanceDate: '2023-12-01'
  },
  {
    id: '1',
    name: '3D Printer',
    description: 'Ultimaker S5 3D printer for precise prototyping and small part creation.',
    image: 'https://images.unsplash.com/photo-1631282715728-ae1ec6cb91d1?q=80&w=1770&auto=format&fit=crop',
    type: 'Printer',
    specs: {
      'Build Volume': '330 x 240 x 300 mm',
      'Layer Resolution': '20-600 microns',
      'Print Speed': 'Up to 24 mm³/s',
      'Filament': 'PLA, ABS, Nylon, TPU'
    },
    maintenanceDate: '2023-11-15'
  },
  {
    id: '2',
    name: 'Laser Cutter',
    description: 'Industrial grade laser cutter for precision cutting and engraving.',
    image: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=1770&auto=format&fit=crop',
    type: 'Cutter',
    specs: {
      'Work Area': '900 x 600 mm',
      'Laser Power': '80W CO2',
      'Precision': '0.01mm',
      'Materials': 'Wood, Acrylic, Paper, Fabric'
    },
    maintenanceDate: '2023-10-20'
  },
  {
    id: '3',
    name: 'CNC Router',
    description: 'Computer-controlled cutting machine for woodworking, metal, and plastic.',
    image: 'https://images.unsplash.com/photo-1566896226933-3220c40301f4?q=80&w=1770&auto=format&fit=crop',
    type: 'Router',
    specs: {
      'Work Area': '1200 x 900 mm',
      'Spindle': '2.2kW water-cooled',
      'Max Speed': '24000 RPM',
      'Materials': 'Wood, Plastics, Soft Metals'
    },
    maintenanceDate: '2023-09-05'
  },
  {
    id: '4',
    name: 'Sewing Machine',
    description: 'Industrial sewing machine for fabric projects and soft goods prototyping.',
    image: 'https://images.unsplash.com/photo-1508873760731-9c3d0bb6b961?q=80&w=1770&auto=format&fit=crop',
    type: 'Textile',
    specs: {
      'Type': 'Computerized',
      'Stitches': '200+ built-in stitches',
      'Speed': 'Up to 1,000 SPM',
      'Materials': 'Light to heavy fabrics'
    },
    maintenanceDate: '2023-12-10'
  },
  {
    id: '5',
    name: 'Drill Press',
    description: 'Precision drilling machine for accurate holes in various materials.',
    image: 'https://images.unsplash.com/photo-1504306265952-9d95ff9ec706?q=80&w=1770&auto=format&fit=crop',
    type: 'Drill',
    specs: {
      'Table Size': '400 x 400 mm',
      'Motor': '1.5 HP',
      'Speeds': '12 speed settings',
      'Capacity': 'Up to 25mm bits'
    },
    maintenanceDate: '2023-11-01'
  }
];

export const courses: { [key: string]: CourseType } = {
  'safety-cabinet': {
    title: 'Safety Cabinet Training',
    description: 'Learn about shop safety and machine protocols.',
    modules: [
      {
        title: 'Introduction to Shop Safety',
        content: 'Overview of general safety rules and guidelines.',
      },
      {
        title: 'Machine-Specific Protocols',
        content: 'Detailed instructions for each machine.',
      },
      {
        title: 'Emergency Procedures',
        content: 'What to do in case of an accident or equipment malfunction.',
      },
    ],
  },
  '1': {
    title: '3D Printer Training',
    description: 'Learn how to operate the Ultimaker S5 3D printer.',
    modules: [
      {
        title: 'Introduction to 3D Printing',
        content: 'Overview of 3D printing technology.',
      },
      {
        title: 'Operating the Ultimaker S5',
        content: 'Detailed instructions for using the Ultimaker S5 printer.',
      },
    ],
  },
  '2': {
    title: 'Laser Cutter Training',
    description: 'Learn how to operate the laser cutter safely and effectively.',
    modules: [
      {
        title: 'Introduction to Laser Cutting',
        content: 'Overview of laser cutting technology.',
      },
      {
        title: 'Operating the Laser Cutter',
        content: 'Detailed instructions for using the laser cutter.',
      },
    ],
  },
  '3': {
    title: 'CNC Router Training',
    description: 'Learn how to operate the CNC router safely and effectively.',
    modules: [
      {
        title: 'Introduction to CNC Routing',
        content: 'Overview of CNC routing technology.',
      },
      {
        title: 'Operating the CNC Router',
        content: 'Detailed instructions for using the CNC router.',
      },
    ],
  },
  '4': {
    title: 'Sewing Machine Training',
    description: 'Learn how to operate the sewing machine safely and effectively.',
    modules: [
      {
        title: 'Introduction to Sewing',
        content: 'Overview of sewing machine technology.',
      },
      {
        title: 'Operating the Sewing Machine',
        content: 'Detailed instructions for using the sewing machine.',
      },
    ],
  },
  '5': {
    title: 'Drill Press Training',
    description: 'Learn how to operate the drill press safely and effectively.',
    modules: [
      {
        title: 'Introduction to Drill Press',
        content: 'Overview of drill press technology.',
      },
      {
        title: 'Operating the Drill Press',
        content: 'Detailed instructions for using the drill press.',
      },
    ],
  },
};

export const quizzes: { [key: string]: QuizType } = {
  'safety-cabinet': {
    title: 'Safety Cabinet Quiz',
    description: 'Test your knowledge of shop safety and machine protocols.',
    questions: [
      {
        question: 'What is the first thing you should do in case of an accident?',
        options: ['Call 911', 'Assess the situation', 'Run for help', 'Ignore it'],
        answer: 'Assess the situation',
      },
      {
        question: 'Is it ok to operate a machine without proper training?',
        options: ['Yes', 'No', 'Maybe', 'Sometimes'],
        answer: 'No',
      },
    ],
  },
  '1': {
    title: '3D Printer Quiz',
    description: 'Test your knowledge of the Ultimaker S5 3D printer.',
    questions: [
      {
        question: 'What is the maximum build volume of the Ultimaker S5?',
        options: ['330 x 240 x 300 mm', '200 x 200 x 200 mm', '100 x 100 x 100 mm', '50 x 50 x 50 mm'],
        answer: '330 x 240 x 300 mm',
      },
      {
        question: 'What is the maximum print speed of the Ultimaker S5?',
        options: ['Up to 24 mm³/s', 'Up to 10 mm³/s', 'Up to 5 mm³/s', 'Up to 1 mm³/s'],
        answer: 'Up to 24 mm³/s',
      },
    ],
  },
  '2': {
    title: 'Laser Cutter Quiz',
    description: 'Test your knowledge of the laser cutter.',
    questions: [
      {
        question: 'What is the work area of the laser cutter?',
        options: ['900 x 600 mm', '200 x 200 mm', '100 x 100 mm', '50 x 50 mm'],
        answer: '900 x 600 mm',
      },
      {
        question: 'What is the laser power of the laser cutter?',
        options: ['80W CO2', '10W CO2', '5W CO2', '1W CO2'],
        answer: '80W CO2',
      },
    ],
  },
  '3': {
    title: 'CNC Router Quiz',
    description: 'Test your knowledge of the CNC router.',
    questions: [
      {
        question: 'What is the work area of the CNC router?',
        options: ['1200 x 900 mm', '200 x 200 mm', '100 x 100 mm', '50 x 50 mm'],
        answer: '1200 x 900 mm',
      },
      {
        question: 'What is the spindle power of the CNC router?',
        options: ['2.2kW water-cooled', '1kW water-cooled', '0.5kW water-cooled', '0.1kW water-cooled'],
        answer: '2.2kW water-cooled',
      },
    ],
  },
  '4': {
    title: 'Sewing Machine Quiz',
    description: 'Test your knowledge of the sewing machine.',
    questions: [
      {
        question: 'How many stitches does the sewing machine have?',
        options: ['200+ built-in stitches', '100+ built-in stitches', '50+ built-in stitches', '10+ built-in stitches'],
        answer: '200+ built-in stitches',
      },
      {
        question: 'What is the maximum speed of the sewing machine?',
        options: ['Up to 1,000 SPM', 'Up to 500 SPM', 'Up to 100 SPM', 'Up to 10 SPM'],
        answer: 'Up to 1,000 SPM',
      },
    ],
  },
  '5': {
    title: 'Drill Press Quiz',
    description: 'Test your knowledge of the drill press.',
    questions: [
      {
        question: 'What is the table size of the drill press?',
        options: ['400 x 400 mm', '200 x 200 mm', '100 x 100 mm', '50 x 50 mm'],
        answer: '400 x 400 mm',
      },
      {
        question: 'What is the motor power of the drill press?',
        options: ['1.5 HP', '1 HP', '0.5 HP', '0.1 HP'],
        answer: '1.5 HP',
      },
    ],
  },
};
