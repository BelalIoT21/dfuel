
import { Button } from "@/components/ui/button";
import { Building2, CheckSquare, Users, BookOpen, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

export function QuickActions() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Quick Actions</h2>
      <div className="grid grid-cols-1 gap-4">
        <Button variant="outline" asChild className="justify-start h-12">
          <Link to="/admin/users">
            <Users className="mr-3 h-5 w-5" />
            Manage Users
          </Link>
        </Button>
        <Button variant="outline" asChild className="justify-start h-12">
          <Link to="/admin/machines">
            <Building2 className="mr-3 h-5 w-5" />
            Manage Machines
          </Link>
        </Button>
        <Button variant="outline" asChild className="justify-start h-12">
          <Link to="/admin/courses">
            <BookOpen className="mr-3 h-5 w-5" />
            Manage Courses
          </Link>
        </Button>
        <Button variant="outline" asChild className="justify-start h-12">
          <Link to="/admin/quizzes">
            <CheckSquare className="mr-3 h-5 w-5" />
            Manage Quizzes
          </Link>
        </Button>
        <Button variant="outline" asChild className="justify-start h-12">
          <Link to="/bookings">
            <Calendar className="mr-3 h-5 w-5" />
            Active Bookings
          </Link>
        </Button>
      </div>
    </div>
  );
}
