'use client';

import React, { useState, useEffect } from 'react';
import { Plus, ArrowLeft } from 'lucide-react';
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

  useEffect(() => {
    fetchMachines();
  }, []);

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
        fetchMachines();
      }
    } catch (error) {
      console.error('Error searching machines:', error);
    }
  };

  return (
    <div className="p-6">
      <Link 
        href="/admin"
        className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Admin
      </Link>

      <div>
        <h1 className="text-2xl font-bold">All Machines</h1>
        <p className="text-muted-foreground">Manage and monitor all machines</p>
      </div>

      <div className="mt-8 rounded-lg border bg-card">
        <div className="p-4">
          <div className="flex items-center justify-between gap-4">
            <Input 
              type="text" 
              placeholder="Search machines..." 
              className="max-w-[400px]"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <Button 
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => router.push('/admin/machines/new')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Machine
            </Button>
          </div>

          <div className="mt-6 space-y-4">
            {loading ? (
              <div className="text-center py-4">Loading machines...</div>
            ) : machines.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                {searchQuery ? 'No machines found matching your search' : 'No machines available'}
              </div>
            ) : (
              machines.map((machine: any) => (
                <div 
                  key={machine._id}
                  className="flex items-start space-x-4 p-4 border rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className="w-[200px] h-[150px] bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
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

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold">{machine.name}</h3>
                    <p className="mt-1 text-gray-600">{machine.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-sm">
                        Type: {machine.type}
                      </span>
                      <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-md text-sm">
                        Difficulty: {machine.difficulty || 'Intermediate'}
                      </span>
                      <span className="bg-green-50 text-green-700 px-2 py-1 rounded-md text-sm">
                        Course: {machine.course || 'No Course'}
                      </span>
                      <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-sm">
                        Users Certified: {machine.usersCertified || 0}
                      </span>
                      <span className="bg-green-50 text-green-700 px-2 py-1 rounded-md text-sm">
                        Bookings: {machine.bookings || 0}
                      </span>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/admin/machines/${machine._id}`)}
                      >
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/admin/machines/${machine._id}/edit`)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this machine?')) {
                            // Handle delete
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 