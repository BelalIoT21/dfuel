
import { Card, CardContent } from "@/components/ui/card";
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
      <CardContent className="p-3 md:p-6">
        <div className="flex justify-between items-center">
          <div className="flex flex-col items-start">
            <div className="text-xl md:text-2xl font-bold text-purple-800">{value}</div>
          </div>
          <div className="p-2 bg-purple-50 rounded-full text-purple-600">
            {icon}
          </div>
        </div>
        <div className="mt-2 flex justify-between items-center text-xs md:text-sm">
          <div className="ml-auto">
            <Link to={link} className="text-purple-600 hover:underline">View</Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
