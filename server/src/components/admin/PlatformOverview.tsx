
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Activity, Check } from "lucide-react";

interface PlatformOverviewProps {
  allUsers: any[];
}

export const PlatformOverview = ({ allUsers }: PlatformOverviewProps) => {
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
              <div className="space-y-3">
                {allUsers.slice(0, 5).map((user) => (
                  <div key={user.id} className="flex justify-between border-b pb-2 last:border-0">
                    <div>
                      <span className="font-medium text-sm">{user.name}</span>
                      <div className="text-xs text-gray-500">Last login: {new Date(user.lastLogin).toLocaleString()}</div>
                    </div>
                    <div className="text-xs">
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                        {user.certifications.length} certifications
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p className="text-sm">No user activity recorded yet.</p>
              </div>
            )}
          </div>
          
          <div>
            <h3 className="text-xs md:text-sm font-medium text-gray-600 mb-2">System Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
              <div className="border rounded-lg p-2 md:p-3 bg-green-50 border-green-100">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-xs md:text-sm font-medium text-green-800">System Online</span>
                </div>
              </div>
              <div className="border rounded-lg p-2 md:p-3 bg-green-50 border-green-100">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-xs md:text-sm font-medium text-green-800">Courses Active</span>
                </div>
              </div>
              <div className="border rounded-lg p-2 md:p-3 bg-green-50 border-green-100">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-xs md:text-sm font-medium text-green-800">Booking System</span>
                </div>
              </div>
              <div className="border rounded-lg p-2 md:p-3 bg-green-50 border-green-100">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-xs md:text-sm font-medium text-green-800">Quiz Engine</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
