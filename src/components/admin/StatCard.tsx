import React from 'react';
import { Card, CardContent } from "../ui/card";
import { Link } from "react-router-dom";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color?: string;
  change?: string;
  link: string;
}

export const StatCard = ({ 
  title, 
  value, 
  icon, 
  color = "bg-purple-50", 
  change = "", 
  link 
}: StatCardProps) => {
  return (
    <Card className="border-purple-100 hover:shadow-md transition-all mb-4">
      <CardContent className="p-3 md:p-4">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <div className="text-xl md:text-2xl font-bold text-purple-800">{value}</div>
            <div className="text-sm text-gray-600 mt-1">{title}</div>
          </div>
          <div className="flex flex-col items-end">
            <div className="p-2 bg-purple-50 rounded-full text-purple-600 mb-1">
              {icon}
            </div>
            <Link to={link} className="text-purple-600 hover:underline text-xs md:text-sm">View</Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
