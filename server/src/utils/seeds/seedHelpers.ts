
import { Machine } from '../../models/Machine';

// Helper function to ensure machine order
export async function ensureMachineOrder() {
  try {
    console.log('Ensuring machines are in correct order...');
    
    // Get all machines
    const machines = await Machine.find().lean();
    
    // Check if machines are sorted by numeric ID
    let machinesSorted = [...machines].sort((a, b) => 
      parseInt(a._id) - parseInt(b._id)
    );
    
    // Check if the current order matches the sorted order
    let needsReordering = false;
    for (let i = 0; i < machines.length; i++) {
      if (machines[i]._id !== machinesSorted[i]._id) {
        needsReordering = true;
        break;
      }
    }
    
    // Print the current order vs expected order for debugging
    if (machines.length > 0) {
      const currentOrder = machines.map(m => m._id);
      const expectedOrder = machinesSorted.map(m => m._id);
      console.log('Current machine order:', currentOrder);
      console.log('Expected machine order:', expectedOrder);
    }
    
    if (needsReordering) {
      console.log('Machines need reordering. Reordering...');
      
      // Delete all machines
      await Machine.deleteMany({});
      
      // Reinsert in correct order
      for (const machine of machinesSorted) {
        // Create a new machine object with only the necessary fields
        const machineData = {
          _id: machine._id.toString(),
          name: machine.name,
          type: machine.type,
          description: machine.description,
          status: machine.status,
          requiresCertification: machine.requiresCertification,
          difficulty: machine.difficulty,
          imageUrl: machine.imageUrl,
          specifications: machine.specifications,
          // Include any other relevant fields
          maintenanceNote: machine.maintenanceNote,
          bookedTimeSlots: machine.bookedTimeSlots || [],
          details: machine.details,
          certificationInstructions: machine.certificationInstructions,
          linkedCourseId: machine.linkedCourseId,
          linkedQuizId: machine.linkedQuizId,
          note: machine.note
        };
        
        // Create a new machine with the filtered data
        const newMachine = new Machine(machineData);
        await newMachine.save();
        console.log(`Reordered machine ${machine._id}: ${machine.name}`);
      }
      
      // Verify the new order
      const verifyMachines = await Machine.find({}, '_id').sort({ _id: 1 });
      const verifyIds = verifyMachines.map(m => m._id);
      console.log('New machine order after reordering:', verifyIds);
      
      console.log('Machine reordering complete!');
    } else {
      console.log('Machines are already in correct order.');
    }
  } catch (error) {
    console.error('Error ensuring machine order:', error);
  }
}
