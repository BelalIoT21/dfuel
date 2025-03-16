
import { Request, Response } from 'express';
import { User } from '../../models/User';
import { Booking } from '../../models/Booking';

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    // req.user should be populated by the auth middleware
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const user = await User.findById(req.user._id).select('-password').populate('bookings');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return the user data in a consistent format
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      certifications: user.certifications,
      bookings: user.bookings || [],
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// @desc    Get user bookings
// @route   GET /api/auth/bookings
// @access  Private
export const getUserBookings = async (req: Request, res: Response) => {
  try {
    // req.user should be populated by the auth middleware
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    // Find all bookings for this user
    const bookings = await Booking.find({ user: req.user._id }).populate('machine', 'name type');
    
    // Return the bookings
    res.json(bookings);
  } catch (error) {
    console.error('Error in getUserBookings:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};
