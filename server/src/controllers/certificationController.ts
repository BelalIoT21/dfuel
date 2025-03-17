
import { Request, Response } from 'express';
import User from '../models/User';

// Add certification
export const addCertification = async (req: Request, res: Response) => {
  try {
    const { userId, machineId } = req.body;

    if (!userId || !machineId) {
      return res.status(400).json({ message: 'User ID and Machine ID are required' });
    }

    // Find the user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the certification already exists
    if (user.certifications.includes(machineId)) {
      return res.status(200).json({ 
        success: true, 
        message: 'User already has this certification' 
      });
    }

    // Add the certification
    user.certifications.push(machineId);
    await user.save();

    res.status(200).json({ 
      success: true, 
      message: 'Certification added successfully' 
    });
  } catch (error) {
    console.error('Error adding certification:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// Remove certification
export const removeCertification = async (req: Request, res: Response) => {
  try {
    // Get params from URL
    const { userId, machineId } = req.params;

    console.log(`Removing certification for user ${userId}, machine ${machineId}`);

    if (!userId || !machineId) {
      return res.status(400).json({ message: 'User ID and Machine ID are required' });
    }

    // Find the user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the user has the certification
    const index = user.certifications.indexOf(machineId);
    if (index === -1) {
      return res.status(200).json({ 
        success: true, 
        message: 'User does not have this certification' 
      });
    }

    // Remove the certification
    user.certifications.splice(index, 1);
    await user.save();

    res.status(200).json({ 
      success: true, 
      message: 'Certification removed successfully' 
    });
  } catch (error) {
    console.error('Error removing certification:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// Get user certifications
export const getUserCertifications = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Find the user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user.certifications);
  } catch (error) {
    console.error('Error getting user certifications:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// Check certification
export const checkCertification = async (req: Request, res: Response) => {
  try {
    const { userId, machineId } = req.params;

    if (!userId || !machineId) {
      return res.status(400).json({ message: 'User ID and Machine ID are required' });
    }

    // Find the user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the user has the certification
    const hasCertification = user.certifications.includes(machineId);

    res.status(200).json(hasCertification);
  } catch (error) {
    console.error('Error checking certification:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// Clear all certifications for a user
export const clearUserCertifications = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Find the user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Clear certifications
    user.certifications = [];
    await user.save();

    res.status(200).json({ 
      success: true, 
      message: 'All certifications cleared successfully' 
    });
  } catch (error) {
    console.error('Error clearing certifications:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};
