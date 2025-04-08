
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  description?: string;
  color?: string;
  change?: string;
  link: string;
}

export const StatCard = ({ 
  title, 
  value, 
  icon, 
  description, 
  color = "bg-purple-50", 
  change = "", 
  link 
}: StatCardProps) => {
  return (
    <Card className="border-purple-100 hover:shadow-md transition-all">
      <CardContent className="p-3 md:p-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-2xl font-bold text-purple-800">{value}</div>
            <div className="text-sm text-gray-600">{title}</div>
          </div>
          <div className="p-2 bg-purple-50 rounded-full">
            {icon}
          </div>
        </div>
        <div className="mt-2 flex justify-between items-center text-xs md:text-sm">
          {description && <span className="text-gray-500">{description}</span>}
          <div className="ml-auto">
            <Link to={link} className="text-purple-600 hover:underline">View</Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
