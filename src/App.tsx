
import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "./components/ui/sonner";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Booking from "./pages/Booking";
import AdminDashboard from "./pages/AdminDashboard";
import ActiveBookings from "./pages/ActiveBookings";
import Course from "./pages/Course";
import Quiz from "./pages/Quiz";
import MachineDetail from "./pages/MachineDetail";
import AdminUsers from "./pages/AdminUsers";
import AdminMachines from "./pages/AdminMachines";
import AdminMachineEdit from "./pages/AdminMachineEdit";
import AdminCourses from "./pages/AdminCourses";
import AdminCourseEdit from "./pages/AdminCourseEdit";
import AdminQuizzes from "./pages/AdminQuizzes";
import AdminQuizEdit from "./pages/AdminQuizEdit";

function App() {
  console.log("Routes initialized, including /bookings for ActiveBookings page");
  
  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/booking/:id" element={<Booking />} />
        <Route path="/bookings" element={<ActiveBookings />} />
        <Route path="/course/:id" element={<Course />} />
        <Route path="/quiz/:id" element={<Quiz />} />
        <Route path="/machine/:id" element={<MachineDetail />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/machines" element={<AdminMachines />} />
        <Route path="/admin/machines/new" element={<AdminMachineEdit />} />
        <Route path="/admin/machines/edit/:id" element={<AdminMachineEdit />} />
        <Route path="/admin/courses" element={<AdminCourses />} />
        <Route path="/admin/courses/new" element={<AdminCourseEdit />} />
        <Route path="/admin/courses/edit/:id" element={<AdminCourseEdit />} />
        <Route path="/admin/quizzes" element={<AdminQuizzes />} />
        <Route path="/admin/quizzes/new" element={<AdminQuizEdit />} />
        <Route path="/admin/quizzes/edit/:id" element={<AdminQuizEdit />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
