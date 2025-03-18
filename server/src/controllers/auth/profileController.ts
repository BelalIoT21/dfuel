
import { Request, Response } from 'express';
import User from '../../models/User';
import { Booking } from '../../models/Booking';
import mongoose from 'mongoose';

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

    // Format the lastLogin date as ISO string if it exists
    // Default to current time if no lastLogin is available
    const lastLogin = user.lastLogin && !isNaN(new Date(user.lastLogin).getTime()) 
      ? new Date(user.lastLogin).toISOString() 
      : new Date().toISOString();

    // Return the user data in a consistent format
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      certifications: user.certifications || [],
      bookings: user.bookings || [],
      lastLogin: lastLogin,
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
  }
  catch (error) {
    console.error('Error in getUserBookings:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// @desc    Delete a user booking
// @route   DELETE /api/auth/bookings/:id
// @access  Private
export const deleteUserBooking = async (req: Request, res: Response) => {
  try {
    // req.user should be populated by the auth middleware
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const { id } = req.params;
    
    // Validate booking ID
    if (!id) {
      return res.status(400).json({ message: 'Booking ID is required' });
    }

    // Find the booking
    let booking;
    
    // Try to find with MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(id)) {
      booking = await Booking.findById(id);
    }
    
    // If not found, try with string ID
    if (!booking) {
      booking = await Booking.findOne({ clientId: id });
    }
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify the booking belongs to the user
    const bookingUserId = booking.user.toString();
    const requestUserId = req.user._id.toString();
    
    if (bookingUserId !== requestUserId && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this booking' });
    }

    // Delete the booking
    await Booking.deleteOne({ _id: booking._id });
    
    // Update user's bookings array
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { bookings: booking._id }
    });

    console.log(`Successfully deleted booking: ${id} for user: ${req.user._id}`);
    
    res.json({ success: true, message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error in deleteUserBooking:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};
