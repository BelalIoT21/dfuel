
import { Request, Response } from 'express';
import { Machine } from '../../models/Machine';

// @desc    Get all machines
// @route   GET /api/machines
// @access  Public
export const getMachines = async (req: Request, res: Response) => {
  try {
    const machines = await Machine.find({});
    
    // Map machines to include proper image URLs if they don't have one
    const machinesWithImages = machines.map(machine => {
      const machineObj = machine.toObject();
      if (!machineObj.imageUrl) {
        // Assign a default image based on machine type
        const type = machineObj.type?.toLowerCase() || '';
        if (type.includes('laser')) {
          machineObj.imageUrl = 'https://images.unsplash.com/photo-1518770660439-4636190af475';
        } else if (type.includes('3d')) {
          machineObj.imageUrl = 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e';
        } else if (type.includes('cnc')) {
          machineObj.imageUrl = 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6';
        } else {
          machineObj.imageUrl = 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7';
        }
      }
      return machineObj;
    });
    
    res.json(machinesWithImages);
  } catch (error) {
    console.error('Error in getMachines:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};
