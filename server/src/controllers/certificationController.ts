
import { Request, Response } from 'express';
import User from '../models/User';
import asyncHandler from 'express-async-handler';

// @desc    Add certification to user
// @route   POST /api/certifications
// @access  Private
export const addCertification = asyncHandler(async (req: Request, res: Response) => {
  const { userId, machineId } = req.body;
  
  console.log(`Request to add certification: userId=${userId}, machineId=${machineId}`);
  
  if (!userId || !machineId) {
    console.log('Missing required fields:', { userId, machineId });
    res.status(400).json({ 
      success: false, 
      message: 'User ID and machine ID are required' 
    });
    return;
  }
  
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      console.log(`User not found with ID: ${userId}`);
      res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
      return;
    }
    
    // Check if user already has this certification
    if (user.certifications.includes(machineId)) {
      console.log(`User ${userId} already has certification ${machineId}`);
      res.status(200).json({ 
        success: true, 
        message: 'User already has this certification' 
      });
      return;
    }
    
    // Add the certification and store the current date
    user.certifications.push(machineId);
    
    // Record certification date
    if (!user.certificationDates) {
      user.certificationDates = {};
    }
    user.certificationDates[machineId] = new Date();
    
    await user.save();
    console.log(`Added certification ${machineId} to user ${userId}`);
    
    res.status(200).json({ 
      success: true, 
      message: 'Certification added successfully' 
    });
  } catch (error) {
    console.error('Error adding certification:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add certification',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// @desc    Remove certification from user
// @route   DELETE /api/certifications/:userId/:machineId
// @access  Private
export const removeCertification = asyncHandler(async (req: Request, res: Response) => {
  const { userId, machineId } = req.params;
  
  console.log(`Request to remove certification: userId=${userId}, machineId=${machineId}`);
  
  if (!userId || !machineId) {
    console.log('Missing required fields:', { userId, machineId });
    res.status(400).json({ 
      success: false, 
      message: 'User ID and machine ID are required' 
    });
    return;
  }
  
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      console.log(`User not found with ID: ${userId}`);
      res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
      return;
    }
    
    // Check if user has this certification
    const certIndex = user.certifications.indexOf(machineId);
    if (certIndex === -1) {
      console.log(`User ${userId} does not have certification ${machineId}`);
      res.status(200).json({ 
        success: true, 
        message: 'User does not have this certification' 
      });
      return;
    }
    
    // Remove the certification
    user.certifications.splice(certIndex, 1);
    
    // Remove certification date if exists
    if (user.certificationDates && user.certificationDates[machineId]) {
      delete user.certificationDates[machineId];
    }
    
    await user.save();
    console.log(`Removed certification ${machineId} from user ${userId}`);
    
    res.status(200).json({ 
      success: true, 
      message: 'Certification removed successfully' 
    });
  } catch (error) {
    console.error('Error removing certification:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to remove certification',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// @desc    Clear all certifications for a user
// @route   DELETE /api/certifications/clear/:userId
// @access  Private
export const clearUserCertifications = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  
  console.log(`Request to clear all certifications for user: ${userId}`);
  
  if (!userId) {
    console.log('Missing required userId');
    res.status(400).json({ 
      success: false, 
      message: 'User ID is required' 
    });
    return;
  }
  
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      console.log(`User not found with ID: ${userId}`);
      res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
      return;
    }
    
    // Clear all certifications
    user.certifications = [];
    
    // Clear certification dates
    user.certificationDates = {};
    
    await user.save();
    console.log(`Cleared all certifications for user ${userId}`);
    
    res.status(200).json({ 
      success: true, 
      message: 'Certifications cleared successfully' 
    });
  } catch (error) {
    console.error('Error clearing certifications:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to clear certifications',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// @desc    Get user certifications
// @route   GET /api/certifications/user/:userId
// @access  Private
export const getUserCertifications = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  
  console.log(`Request to get certifications for user: ${userId}`);
  
  try {
    const user = await User.findById(userId).select('certifications');
    
    if (!user) {
      console.log(`User not found with ID: ${userId}`);
      res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
      return;
    }
    
    // Return the certifications
    console.log(`Retrieved certifications for user ${userId}:`, user.certifications);
    res.status(200).json(user.certifications);
  } catch (error) {
    console.error('Error getting user certifications:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get user certifications',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// @desc    Check if user has certification
// @route   GET /api/certifications/check/:userId/:machineId
// @access  Private
export const checkCertification = asyncHandler(async (req: Request, res: Response) => {
  const { userId, machineId } = req.params;
  
  console.log(`Request to check certification: userId=${userId}, machineId=${machineId}`);
  
  try {
    const user = await User.findById(userId).select('certifications');
    
    if (!user) {
      console.log(`User not found with ID: ${userId}`);
      res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
      return;
    }
    
    const hasCertification = user.certifications.includes(machineId);
    console.log(`User ${userId} ${hasCertification ? 'has' : 'does not have'} certification ${machineId}`);
    res.status(200).json(hasCertification);
  } catch (error) {
    console.error('Error checking certification:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to check certification',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
