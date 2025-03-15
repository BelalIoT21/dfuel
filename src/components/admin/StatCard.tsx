
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  change: string;
  link: string;
}

export const StatCard = ({ title, value, icon, change, link }: StatCardProps) => {
  return (
    <Card className="border-purple-100 hover:shadow-md transition-all">
      <CardContent className="p-3 md:p-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-sm md:text-2xl font-bold text-purple-800">{value}</div>
            <div className="text-xs md:text-sm text-gray-600">{title}</div>
          </div>
          <div className="p-2 bg-purple-50 rounded-full">
            {icon}
          </div>
        </div>
        <div className="mt-2 flex justify-between items-center text-xs md:text-sm">
          <span className={`${
            !change || change === '' 
              ? 'hidden'
              : change === '0' 
                ? 'hidden' 
                : change.startsWith('+') 
                  ? 'text-green-600' 
                  : change.startsWith('-') 
                    ? 'text-red-600' 
                    : 'text-gray-600'
          }`}>
            {change}
          </span>
          <div className="ml-auto">
            <Link to={link} className="text-purple-600 hover:underline">View</Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
