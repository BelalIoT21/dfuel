
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
    // Ensure IDs are strings for consistency
    const userIdStr = String(userId);
    const machineIdStr = String(machineId);
    
    console.log(`Normalized IDs for certification: userId=${userIdStr}, machineId=${machineIdStr}`);
    
    // Try finding user with ID
    console.log(`Looking for user with ID: ${userIdStr}`);
    let user = await User.findById(userIdStr);
    
    if (!user) {
      console.log(`User not found with ID: ${userIdStr}, trying alternative approaches`);
      
      // Try finding by ID as string
      user = await User.findOne({ _id: userIdStr });
      
      if (!user) {
        // Try finding by ID field
        user = await User.findOne({ id: userIdStr });
        
        if (!user) {
          // Last resort: try numeric conversion
          try {
            const numericId = parseInt(userIdStr);
            if (!isNaN(numericId)) {
              user = await User.findById(numericId);
              
              if (!user) {
                user = await User.findOne({ _id: numericId });
              }
              
              if (!user) {
                user = await User.findOne({ id: numericId });
              }
            }
          } catch (err) {
            console.error('Error trying numeric ID:', err);
          }
          
          if (!user) {
            console.log(`User not found with any method for ID: ${userIdStr}`);
            res.status(404).json({ 
              success: false, 
              message: 'User not found' 
            });
            return;
          }
        }
      }
    }
    
    console.log(`User found: ${user._id}, checking certifications`);
    
    // Ensure certifications array exists
    if (!user.certifications) {
      console.log(`Creating certifications array for user ${userIdStr}`);
      user.certifications = [];
    }
    
    console.log("User's existing certifications:", user.certifications);
    
    // Check if user already has this certification
    if (user.certifications.includes(machineIdStr)) {
      console.log(`User ${userIdStr} already has certification ${machineIdStr}`);
      res.status(200).json({ 
        success: true, 
        message: 'User already has this certification' 
      });
      return;
    }
    
    // Add the certification and store the current date
    user.certifications.push(machineIdStr);
    
    // Ensure certificationDates exists
    if (!user.certificationDates) {
      user.certificationDates = {};
    }
    
    // Record certification date
    user.certificationDates[machineIdStr] = new Date();
    
    console.log(`Saving user with updated certifications: ${user.certifications}`);
    await user.save();
    console.log(`Added certification ${machineIdStr} to user ${userIdStr}`);
    
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
    // Try finding user with numeric ID first
    let user = await User.findById(userId);
    
    if (!user) {
      console.log(`User not found with ID: ${userId}`);
      res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
      return;
    }
    
    // Ensure certifications array exists
    if (!user.certifications) {
      user.certifications = [];
    }
    
    console.log("User's existing certifications:", user.certifications);
    
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
    
    console.log(`Saving user with updated certifications: ${user.certifications}`);
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
    // Try finding user with numeric ID first
    let user = await User.findById(userId);
    
    if (!user) {
      console.log(`User not found with ID: ${userId}`);
      res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
      return;
    }
    
    console.log(`Clearing certifications for user ${userId}`);
    
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
    // Try finding user with numeric ID first
    let user = await User.findById(userId).select('certifications');
    
    if (!user) {
      console.log(`User not found with ID: ${userId}`);
      res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
      return;
    }
    
    // Ensure certifications array exists
    if (!user.certifications) {
      user.certifications = [];
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
    // Try finding user with numeric ID first
    let user = await User.findById(userId).select('certifications');
    
    if (!user) {
      console.log(`User not found with ID: ${userId}`);
      res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
      return;
    }
    
    // Ensure certifications array exists
    if (!user.certifications) {
      user.certifications = [];
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
