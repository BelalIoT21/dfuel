
// Define course content templates as JSON strings
import { getImageUrl } from './imageUtils';
import { getVideoUrl } from './videoUtils';

export const laserCutterCourseContent = JSON.stringify([
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

export const ultimakerCourseContent = JSON.stringify([
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

export const x1CarbonCourseContent = JSON.stringify([
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

export const bambuLabCourseContent = JSON.stringify([
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

export const safetyCabinetCourseContent = JSON.stringify([
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
      { id: '2-2', type: 'text', content: 'Guidelines for storing chemicals safely and preventing hazardous interactions.' },
      { id: '2-3', type: 'video', content: getVideoUrl('safety-tutorial.mp4') }
    ]
  }
]);

export const machineSafetyCourseContent = JSON.stringify([
  {
    id: '1',
    elements: [
      { id: '1-1', type: 'heading', content: 'Machine Safety Fundamentals', headingLevel: 1 },
      { id: '1-2', type: 'text', content: 'Essential safety training required for all makerspace users' },
      { id: '1-3', type: 'image', content: getImageUrl('IMG_7814.jpg') }
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
