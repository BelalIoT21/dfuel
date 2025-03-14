
import { Request, Response } from 'express';
import { Machine } from '../../models/Machine';

// @desc    Get all machines
// @route   GET /api/machines
// @access  Public
export const getMachines = async (req: Request, res: Response) => {
  try {
    const machines = await Machine.find({});
    
    // Add default images for machines without imageUrl
    const enhancedMachines = machines.map(machine => {
      const machineObj = machine.toObject();
      
      if (!machineObj.imageUrl) {
        // Assign default image based on machine type
        const type = machineObj.type.toLowerCase();
        if (type.includes('laser')) {
          machineObj.imageUrl = 'https://images.unsplash.com/photo-1565696392944-b1a54b3102dd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60';
        } else if (type.includes('printer') || type.includes('3d')) {
          machineObj.imageUrl = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60';
        } else if (type.includes('safety')) {
          machineObj.imageUrl = 'https://images.unsplash.com/photo-1606091505136-3f9e61673f55?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60';
        } else {
          machineObj.imageUrl = 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60';
        }
      }
      
      return machineObj;
    });
    
    res.json(enhancedMachines);
  } catch (error) {
    console.error('Error in getMachines:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};
