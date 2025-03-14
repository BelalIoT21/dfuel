
import { Request, Response } from 'express';
import { Machine } from '../../models/Machine';

// @desc    Delete a machine
// @route   DELETE /api/machines/:id
// @access  Private/Admin
export const deleteMachine = async (req: Request, res: Response) => {
  try {
    const machine = await Machine.findById(req.params.id);
    
    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }
    
    await machine.deleteOne();
    res.json({ message: 'Machine removed' });
  } catch (error) {
    console.error('Error in deleteMachine:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};
