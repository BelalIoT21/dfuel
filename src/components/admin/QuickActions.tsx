
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Download, Users, Settings, Database } from "lucide-react";

export const QuickActions = () => {
  return (
    <Card className="border-purple-100">
      <CardHeader className="p-4 md:p-6">
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
          <Database className="h-5 w-5 text-purple-600" />
          Quick Actions
        </CardTitle>
        <CardDescription>Common administrative tasks</CardDescription>
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-0">
        <div className="space-y-2">
          <Button className="w-full justify-start" variant="outline">
            <Users className="mr-2 h-4 w-4" />
            Manage Users
          </Button>
          <Button className="w-full justify-start" variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Manage Machines
          </Button>
          <Button className="w-full justify-start" variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Also export as default to maintain backward compatibility
export default QuickActions;
