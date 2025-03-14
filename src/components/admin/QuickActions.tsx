
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const QuickActions = () => {
  return (
    <Card className="border-purple-100">
      <CardHeader className="p-4 md:p-6">
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
          <BookOpen className="h-5 w-5 text-purple-600" />
          Quick Actions
        </CardTitle>
        <CardDescription>Common administrative tasks</CardDescription>
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-0 space-y-3">
        <Button className="w-full justify-start bg-purple-600 hover:bg-purple-700 text-sm" asChild>
          <Link to="/admin/users">Manage Users</Link>
        </Button>
        <Button className="w-full justify-start bg-purple-600 hover:bg-purple-700 text-sm" asChild>
          <Link to="/admin/machines">Manage Machines</Link>
        </Button>
      </CardContent>
    </Card>
  );
};
