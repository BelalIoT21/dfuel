
import { Request, Response } from 'express';
import User from '../models/User';
import asyncHandler from 'express-async-handler';

// @desc    Add certification to user
// @route   POST /api/certifications
// @access  Private
export const addCertification = asyncHandler(async (req: Request, res: Response) => {
  const { userId, machineId } = req.body;
  
  if (!userId || !machineId) {
    return res.status(400).json({ 
      success: false, 
      message: 'User ID and machine ID are required' 
    });
  }
  
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Check if user already has this certification
    if (user.certifications.includes(machineId)) {
      return res.status(200).json({ 
        success: true, 
        message: 'User already has this certification' 
      });
    }
    
    // Add the certification
    user.certifications.push(machineId);
    await user.save();
    
    return res.status(200).json({ 
      success: true, 
      message: 'Certification added successfully' 
    });
  } catch (error) {
    console.error('Error adding certification:', error);
    return res.status(500).json({ 
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
  
  if (!userId || !machineId) {
    return res.status(400).json({ 
      success: false, 
      message: 'User ID and machine ID are required' 
    });
  }
  
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // If user doesn't have this certification, return success
    if (!user.certifications.includes(machineId)) {
      return res.status(200).json({ 
        success: true, 
        message: 'User does not have this certification' 
      });
    }
    
    // Filter out the certification
    user.certifications = user.certifications.filter(id => id !== machineId);
    await user.save();
    
    return res.status(200).json({ 
      success: true, 
      message: 'Certification removed successfully' 
    });
  } catch (error) {
    console.error('Error removing certification:', error);
    return res.status(500).json({ 
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
  
  if (!userId) {
    return res.status(400).json({ 
      success: false, 
      message: 'User ID is required' 
    });
  }
  
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    user.certifications = [];
    await user.save();
    
    return res.status(200).json({ 
      success: true, 
      message: 'Certifications cleared successfully' 
    });
  } catch (error) {
    console.error('Error clearing certifications:', error);
    return res.status(500).json({ 
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
  
  try {
    const user = await User.findById(userId).select('certifications');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Return the certifications
    return res.status(200).json(user.certifications);
  } catch (error) {
    console.error('Error getting user certifications:', error);
    return res.status(500).json({ 
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
  
  try {
    const user = await User.findById(userId).select('certifications');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    const hasCertification = user.certifications.includes(machineId);
    return res.status(200).json(hasCertification);
  } catch (error) {
    console.error('Error checking certification:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to check certification',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
