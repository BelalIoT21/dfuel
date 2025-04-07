
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Activity, Check } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PlatformOverviewProps {
  allUsers: {
    id: string;
    name: string;
    lastLogin?: string;
    certifications?: string[] | number;
  }[];
}

export const PlatformOverview = ({ allUsers }: PlatformOverviewProps) => {
  // Helper function to format dates safely
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Not available';
    
    try {
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? 'Not available' : date.toLocaleString();
    } catch {
      return 'Not available';
    }
  };

  // Calculate certification count safely
  const getCertificationCount = (user: PlatformOverviewProps['allUsers'][0]) => {
    if (Array.isArray(user.certifications)) {
      return user.certifications.length;
    }
    if (typeof user.certifications === 'number') {
      return user.certifications;
    }
    return 0;
  };

  // Generate a unique key for a user
  const getUserKey = (user: PlatformOverviewProps['allUsers'][0], index: number) => {
    return user.id || `user-${index}`;
  };

  return (
    <Card className="lg:col-span-2 border-purple-100">
      <CardHeader className="p-4 md:p-6">
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
          <Activity className="h-5 w-5 text-purple-600" />
          Platform Overview
        </CardTitle>
        <CardDescription>Current status of the Learnit platform</CardDescription>
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-0">
        <div className="space-y-4 md:space-y-6">
          <div>
            <h3 className="text-xs md:text-sm font-medium text-gray-600 mb-2">Recent User Activity</h3>
            {allUsers.length > 0 ? (
              <ScrollArea className="h-[200px] rounded-md border">
                <div className="space-y-3 p-2">
                  {allUsers.slice(0, 10).map((user, index) => {
                    const userKey = getUserKey(user, index);
                    return (
                      <div 
                        key={userKey}
                        className="flex justify-between border-b pb-2 last:border-0"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">
                            {user.name || 'Unknown User'}
                          </span>
                          <span className="text-xs text-gray-500">
                            Last login: {formatDate(user.lastLogin)}
                          </span>
                        </div>
                        <span className="px-2 py-2 bg-purple-100 text-purple-800 rounded-full text-xs">
                          {getCertificationCount(user)} certifications
                        </span>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p className="text-sm">No user activity recorded yet.</p>
              </div>
            )}
          </div>
          
          <div>
            <h3 className="text-xs md:text-sm font-medium text-gray-600 mb-2">System Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
              {[
                "System Online",
                "Courses Active",
                "Booking System",
                "Quiz Engine"
              ].map((status, index) => (
                <div 
                  key={`status-${index}`}
                  className="border rounded-lg p-2 md:p-3 bg-green-50 border-green-100"
                >
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-xs md:text-sm font-medium text-green-800">
                      {status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
