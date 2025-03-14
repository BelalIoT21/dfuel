
import { Request, Response } from 'express';
import { Machine } from '../../models/Machine';

// @desc    Update machine status
// @route   PUT /api/machines/:id/status
// @access  Private/Admin
export const updateMachineStatus = async (req: Request, res: Response) => {
  try {
    const { status, maintenanceNote } = req.body;
    
    const machine = await Machine.findById(req.params.id);
    
    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }
    
    machine.status = status;
    if (maintenanceNote !== undefined) {
      machine.maintenanceNote = maintenanceNote;
    }
    
    const updatedMachine = await machine.save();
    res.json(updatedMachine);
  } catch (error) {
    console.error('Error in updateMachineStatus:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};
