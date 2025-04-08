'use client';

import React, { useState, useEffect } from 'react';
import { Plus, ArrowLeft, Eye, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { apiService } from '@/services/apiService';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function MachineManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  // Fetch machines on component mount
  useEffect(() => {
    fetchMachines();
  }, []);

  // Fetch all machines
  const fetchMachines = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllMachines();
      if (response.success) {
        setMachines(response.data || []);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch machines",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching machines:', error);
      toast({
        title: "Error",
        description: "Failed to fetch machines",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    try {
      if (query.trim()) {
        const response = await apiService.searchMachines(query);
        if (response.success) {
          setMachines(response.data || []);
        }
      } else {
        // If search is empty, fetch all machines
        fetchMachines();
      }
    } catch (error) {
      console.error('Error searching machines:', error);
    }
  };

  // Handle delete machine
  const handleDelete = async (machineId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this machine?')) {
      try {
        const response = await apiService.deleteMachine(machineId);
        if (response.success) {
          toast({
            title: "Success",
            description: "Machine deleted successfully",
          });
          fetchMachines();
        } else {
          toast({
            title: "Error",
            description: "Failed to delete machine",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error deleting machine:', error);
        toast({
          title: "Error",
          description: "Failed to delete machine",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <Link 
        href="/admin"
        className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Admin
      </Link>

      <div className="flex flex-col space-y-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">All Machines</h1>
          <p className="text-gray-500">Manage and monitor all machines</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex-1">
              <Input 
                type="text" 
                placeholder="Search machines..." 
                className="w-full max-w-xl"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            <Button 
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => router.push('/machines/new')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Machine
            </Button>
          </div>

          {/* Machine list */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-4">Loading machines...</div>
            ) : machines.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                {searchQuery ? 'No machines found matching your search' : 'No machines available'}
              </div>
            ) : (
              <div className="space-y-4">
                {machines.map((machine: any) => (
                  <div 
                    key={machine._id} 
                    className="flex flex-col md:flex-row gap-4 border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="md:w-48 h-32 bg-gray-100 rounded-lg overflow-hidden">
                      {machine.image ? (
                        <img 
                          src={machine.image} 
                          alt={machine.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold">{machine.name}</h3>
                      <p className="text-gray-600 mt-1">{machine.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                          Type: {machine.type}
                        </span>
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
                          Difficulty: {machine.difficulty || 'Intermediate'}
                        </span>
                        {machine.course && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                            Course: {machine.course}
                          </span>
                        )}
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                          Users Certified: {machine.usersCertified || 0}
                        </span>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                          Bookings: {machine.bookings || 0}
                        </span>
                      </div>
                    </div>

                    <div className="flex md:flex-col gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/machines/${machine._id}`)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/machines/${machine._id}/edit`);
                        }}
                      >
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={(e) => handleDelete(machine._id, e)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 