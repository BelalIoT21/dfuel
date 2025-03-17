
import { Request, Response } from 'express';
import User from '../models/User';
import asyncHandler from 'express-async-handler';

// @desc    Add certification to user
// @route   POST /api/certifications
// @access  Private
export const addCertification = asyncHandler(async (req: Request, res: Response) => {
  const { userId, machineId } = req.body;
  
  if (!userId || !machineId) {
    res.status(400);
    throw new Error('User ID and machine ID are required');
  }
  
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    
    // Check if user already has this certification
    if (!user.certifications.includes(machineId)) {
      user.certifications.push(machineId);
      await user.save();
    }
    
    res.status(200).json({ success: true, message: 'Certification added successfully' });
  } catch (error) {
    console.error('Error adding certification:', error);
    res.status(500).json({ success: false, message: 'Failed to add certification' });
  }
});

// @desc    Remove certification from user
// @route   DELETE /api/certifications/:userId/:machineId
// @access  Private
export const removeCertification = asyncHandler(async (req: Request, res: Response) => {
  const { userId, machineId } = req.params;
  
  if (!userId || !machineId) {
    res.status(400);
    throw new Error('User ID and machine ID are required');
  }
  
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    
    // Filter out the certification
    user.certifications = user.certifications.filter(id => id !== machineId);
    await user.save();
    
    res.status(200).json({ success: true, message: 'Certification removed successfully' });
  } catch (error) {
    console.error('Error removing certification:', error);
    res.status(500).json({ success: false, message: 'Failed to remove certification' });
  }
});

// @desc    Clear all certifications for a user
// @route   DELETE /api/certifications/clear/:userId
// @access  Private
export const clearUserCertifications = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  
  if (!userId) {
    res.status(400);
    throw new Error('User ID is required');
  }
  
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    
    user.certifications = [];
    await user.save();
    
    res.status(200).json({ success: true, message: 'Certifications cleared successfully' });
  } catch (error) {
    console.error('Error clearing certifications:', error);
    res.status(500).json({ success: false, message: 'Failed to clear certifications' });
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
      res.status(404);
      throw new Error('User not found');
    }
    
    res.status(200).json(user.certifications);
  } catch (error) {
    console.error('Error getting user certifications:', error);
    res.status(500).json({ success: false, message: 'Failed to get user certifications' });
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
      res.status(404);
      throw new Error('User not found');
    }
    
    const hasCertification = user.certifications.includes(machineId);
    res.status(200).json(hasCertification);
  } catch (error) {
    console.error('Error checking certification:', error);
    res.status(500).json({ success: false, message: 'Failed to check certification' });
  }
});
