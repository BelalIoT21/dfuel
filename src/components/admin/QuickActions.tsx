
import { Button } from "@/components/ui/button";
import { Building2, GraduationCap, CheckSquare, Users, BookOpen, Cog } from "lucide-react";
import { Link } from "react-router-dom";

export function QuickActions() {
  return (
    <div className="space-y-2">
      <h2 className="text-xl font-semibold">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <Button variant="outline" asChild className="justify-start">
          <Link to="/admin/users">
            <Users className="mr-2 h-4 w-4" />
            Manage Users
          </Link>
        </Button>
        <Button variant="outline" asChild className="justify-start">
          <Link to="/admin/machines">
            <Building2 className="mr-2 h-4 w-4" />
            Manage Machines
          </Link>
        </Button>
        <Button variant="outline" asChild className="justify-start">
          <Link to="/admin/courses">
            <BookOpen className="mr-2 h-4 w-4" />
            Manage Courses
          </Link>
        </Button>
        <Button variant="outline" asChild className="justify-start">
          <Link to="/admin/quizzes">
            <CheckSquare className="mr-2 h-4 w-4" />
            Manage Quizzes
          </Link>
        </Button>
        <Button variant="outline" asChild className="justify-start">
          <Link to="/admin/machines/new">
            <Cog className="mr-2 h-4 w-4" />
            Add Machine
          </Link>
        </Button>
        <Button variant="outline" asChild className="justify-start">
          <Link to="/admin/courses/new">
            <GraduationCap className="mr-2 h-4 w-4" />
            Add Course
          </Link>
        </Button>
      </div>
    </div>
  );
}
