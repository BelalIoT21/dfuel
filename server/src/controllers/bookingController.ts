import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { Booking, IBooking } from '../models/Booking';
import mongoose from 'mongoose';
import User from '../models/User';
import { Machine } from '../models/Machine';

// Create booking
export const createBooking = asyncHandler(async (req: Request, res: Response) => {
  const { machineId, date, time } = req.body;
  
  // Always get the userId from the req object (set by the auth middleware)
  const userId = req.user?.id;
  
  if (!userId || !machineId || !date || !time) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }
  
  try {
    // Log for debugging
    console.log(`Creating booking with userId: ${userId}, machineId: ${machineId}, date: ${date}, time: ${time}`);
    
    // Check if this time slot is already booked
    const bookingDate = new Date(date);
    const startOfDay = new Date(bookingDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(bookingDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Convert machineId to string to ensure consistent comparison
    const machineIdStr = String(machineId);
    
    const existingBooking = await Booking.findOne({
      machine: machineIdStr,
      date: {
        $gte: startOfDay,
        $lt: endOfDay
      },
      time: time,
      status: { $in: ['Pending', 'Approved'] }
    });
    
    if (existingBooking) {
      console.log(`Time slot already booked: Machine ${machineIdStr}, Date: ${date}, Time: ${time}`);
      res.status(400);
      throw new Error('This time slot is already booked');
    }
    
    // Find user and machine
    const user = await User.findById(userId);
    const machine = await Machine.findById(machineIdStr);
    
    if (!user) {
      console.log(`User not found: ${userId}`);
      res.status(404);
      throw new Error('User not found');
    }
    
    if (!machine) {
      console.log(`Machine not found: ${machineIdStr}`);
      res.status(404);
      throw new Error('Machine not found');
    }
    
    console.log(`Creating booking for user ${user.name} and machine ${machine.name}`);
    
    // ALWAYS create booking with 'Pending' status, regardless of user role
    const booking = await Booking.create({
      user: userId,
      machine: machineIdStr,
      date: bookingDate,
      time,
      status: 'Pending', // Always set to Pending
      userName: user.name,
      machineName: machine.name,
      userEmail: user.email,
      machineType: machine.type
    });
    
    // Update machine's booked time slots
    const timeSlotKey = `${date.substring(0, 10)}-${time}`;
    
    await Machine.findByIdAndUpdate(
      machineIdStr,
      { $addToSet: { bookedTimeSlots: timeSlotKey } }
    );
    
    // Success response
    res.status(201).json({
      _id: booking._id,
      user: booking.user,
      machine: booking.machine,
      date: booking.date,
      time: booking.time,
      status: booking.status,
      createdAt: booking.createdAt
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500);
    throw new Error('Error creating booking');
  }
});

// Get user bookings
export const getUserBookings = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  
  try {
    const bookings = await Booking.find({ user: userId })
      .populate('machine', 'name type status')
      .sort({ createdAt: -1 });
    
    res.json(bookings);
  } catch (error) {
    console.error('Error getting user bookings:', error);
    res.status(500);
    throw new Error('Error getting user bookings');
  }
});

// Get all bookings - admin only
export const getAllBookings = asyncHandler(async (req: Request, res: Response) => {
  try {
    // Populate with user and machine data
    const bookings = await Booking.find({})
      .populate({
        path: 'user',
        select: 'name email _id'
      })
      .populate({
        path: 'machine',
        select: 'name type status _id'
      })
      .sort({ createdAt: -1 });
    
    // Use the IBooking interface for correct typing
    const formattedBookings = bookings.map(booking => {
      const user = booking.user as any;
      const machine = booking.machine as any;
      
      // Ensure we have all necessary data
      return {
        _id: booking._id,
        id: booking._id,
        machineId: booking.machine,
        // Access properties safely with optional chaining
        machineName: booking.get('machineName') || (machine && machine.name ? machine.name : 'Unknown'),
        machineType: booking.get('machineType') || (machine && machine.type ? machine.type : 'Unknown'),
        userId: booking.user,
        userName: booking.get('userName') || (user && user.name ? user.name : 'Unknown'),
        userEmail: booking.get('userEmail') || (user && user.email ? user.email : 'Unknown'),
        date: booking.date,
        time: booking.time,
        status: booking.status,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt
      };
    });
    
    res.json(formattedBookings);
  } catch (error) {
    console.error('Error getting all bookings:', error);
    res.status(500);
    throw new Error('Error getting all bookings');
  }
});

// Get booking by ID
export const getBookingById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  
  try {
    const booking = await Booking.findById(id)
      .populate('machine', 'name type status')
      .populate('user', 'name email');
    
    if (!booking) {
      res.status(404);
      throw new Error('Booking not found');
    }
    
    // Check if the user is authorized to view this booking
    const user = booking.user as any;
    const bookingUserId = user && user._id ? user._id.toString() : booking.user.toString();
    
    if (bookingUserId !== userId && !req.user?.isAdmin) {
      res.status(403);
      throw new Error('Not authorized to access this booking');
    }
    
    res.json(booking);
  } catch (error) {
    console.error('Error getting booking by ID:', error);
    res.status(500);
    throw new Error('Error getting booking by ID');
  }
});

// Update booking status - admin only
export const updateBookingStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  
  try {
    const booking = await Booking.findById(id);
    
    if (!booking) {
      res.status(404);
      throw new Error('Booking not found');
    }
    
    booking.status = status;
    await booking.save();
    
    res.json({ success: true, booking });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500);
    throw new Error('Error updating booking status');
  }
});

// Cancel booking
export const cancelBooking = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  
  try {
    const booking = await Booking.findById(id);
    
    if (!booking) {
      res.status(404);
      throw new Error('Booking not found');
    }
    
    // Check if the user is authorized to cancel this booking
    const user = booking.user as any;
    const bookingUserId = user && user._id ? user._id.toString() : booking.user.toString();
    
    if (bookingUserId !== userId && !req.user?.isAdmin) {
      res.status(403);
      throw new Error('Not authorized to cancel this booking');
    }
    
    booking.status = 'Canceled';
    await booking.save();
    
    // Ensure proper format for machine ID
    const machineIdStr = booking.machine ? 
      (typeof booking.machine === 'object' && booking.machine._id 
        ? booking.machine._id.toString() 
        : booking.machine.toString())
      : null;
    
    // If we have a valid machine ID, update its booked time slots
    if (machineIdStr && booking.date && booking.time) {
      const date = new Date(booking.date);
      const dateStr = date.toISOString().substring(0, 10);
      const timeSlotKey = `${dateStr}-${booking.time}`;
      
      try {
        await Machine.findByIdAndUpdate(
          machineIdStr,
          { $pull: { bookedTimeSlots: timeSlotKey } }
        );
        console.log(`Removed booking time slot ${timeSlotKey} from machine ${machineIdStr}`);
      } catch (error) {
        console.error(`Error removing time slot from machine: ${error}`);
      }
    }
    
    res.json({ success: true, booking });
  } catch (error) {
    console.error('Error canceling booking:', error);
    res.status(500);
    throw new Error('Error canceling booking');
  }
});

// Delete booking - admin only
export const deleteBooking = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    const booking = await Booking.findById(id);
    
    if (!booking) {
      res.status(404);
      throw new Error('Booking not found');
    }
    
    // Remove this booking from the machine's booked time slots
    if (booking.machine && booking.date && booking.time) {
      const machineId = typeof booking.machine === 'object' && booking.machine._id 
        ? booking.machine._id 
        : booking.machine;
      
      const date = new Date(booking.date);
      const dateStr = date.toISOString().substring(0, 10);
      const timeSlotKey = `${dateStr}-${booking.time}`;
      
      await Machine.findByIdAndUpdate(
        machineId,
        { $pull: { bookedTimeSlots: timeSlotKey } }
      );
    }
    
    await Booking.deleteOne({ _id: id });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500);
    throw new Error('Error deleting booking');
  }
});
