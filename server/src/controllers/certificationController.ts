
import { Request, Response } from 'express';
import { User } from '../models/User';

// @desc    Add certification for a user
// @route   POST /api/certifications
// @access  Private
export const addCertification = async (req: Request, res: Response) => {
  try {
    const { machineId } = req.body;
    const userId = req.user?._id;

    if (!machineId) {
      return res.status(400).json({ message: 'Machine ID is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if certification already exists
    if (user.certifications.includes(machineId)) {
      return res.status(400).json({ message: 'User already has this certification' });
    }

    // Add certification
    user.certifications.push(machineId);
    await user.save();

    res.json({ 
      success: true, 
      certifications: user.certifications
    });
  } catch (error) {
    console.error('Error in addCertification:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// @desc    Complete safety course
// @route   POST /api/certifications/safety-course
// @access  Private
export const completeSafetyCourse = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.body;
    const userId = req.user?._id;

    if (!courseId) {
      return res.status(400).json({ message: 'Course ID is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize safetyCoursesCompleted if it doesn't exist
    if (!user.safetyCoursesCompleted) {
      user.safetyCoursesCompleted = [];
    }

    // Check if safety course already completed
    if (user.safetyCoursesCompleted.includes(courseId)) {
      return res.status(400).json({ message: 'User already completed this safety course' });
    }

    // Mark safety course as completed
    user.safetyCoursesCompleted.push(courseId);
    await user.save();

    res.json({ 
      success: true, 
      safetyCoursesCompleted: user.safetyCoursesCompleted
    });
  } catch (error) {
    console.error('Error in completeSafetyCourse:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// @desc    Remove certification from a user
// @route   DELETE /api/certifications
// @access  Private/Admin
export const removeCertification = async (req: Request, res: Response) => {
  try {
    const { userId, machineId } = req.body;

    if (!userId || !machineId) {
      return res.status(400).json({ message: 'User ID and Machine ID are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if certification exists
    if (!user.certifications.includes(machineId)) {
      return res.status(400).json({ message: 'User does not have this certification' });
    }

    // Remove certification
    user.certifications = user.certifications.filter(cert => cert !== machineId);
    await user.save();

    res.json({ 
      success: true, 
      certifications: user.certifications
    });
  } catch (error) {
    console.error('Error in removeCertification:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// @desc    Get certifications for a user
// @route   GET /api/certifications/user/:userId
// @access  Private/Admin
export const getUserCertifications = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize safetyCoursesCompleted if it doesn't exist
    if (!user.safetyCoursesCompleted) {
      user.safetyCoursesCompleted = [];
    }

    res.json({ 
      certifications: user.certifications,
      safetyCoursesCompleted: user.safetyCoursesCompleted
    });
  } catch (error) {
    console.error('Error in getUserCertifications:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// @desc    Check if user has certification for a machine
// @route   GET /api/certifications/check
// @access  Private
export const checkCertification = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { machineId } = req.query;

    if (!machineId) {
      return res.status(400).json({ message: 'Machine ID is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const hasCertification = user.certifications.includes(machineId as string);

    res.json({ 
      hasCertification
    });
  } catch (error) {
    console.error('Error in checkCertification:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// @desc    Check if user has completed a safety course
// @route   GET /api/certifications/safety-course/check
// @access  Private
export const checkSafetyCourse = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { courseId } = req.query;

    if (!courseId) {
      return res.status(400).json({ message: 'Course ID is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize safetyCoursesCompleted if it doesn't exist
    if (!user.safetyCoursesCompleted) {
      user.safetyCoursesCompleted = [];
    }

    const hasCompletedCourse = user.safetyCoursesCompleted.includes(courseId as string);

    res.json({ 
      hasCompletedCourse
    });
  } catch (error) {
    console.error('Error in checkSafetyCourse:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};
