import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const BackToAdminButton = () => {
  const navigate = useNavigate();

  return (
    <Button
      variant="outline"
      onClick={() => navigate('/admin')}
      className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 border border-purple-200 flex items-center font-medium"
    >
      <ChevronLeft className="h-4 w-4 mr-1" />
      Back to Admin
    </Button>
  );
}; 