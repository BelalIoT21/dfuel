'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/courses">
          <div className="p-6 border rounded-lg hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold">Course Management</h2>
            <p className="text-gray-600 mt-2">Manage and monitor all courses</p>
          </div>
        </Link>

        <Link href="/admin/machines">
          <div className="p-6 border rounded-lg hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold">Machine Management</h2>
            <p className="text-gray-600 mt-2">Manage and monitor all machines</p>
          </div>
        </Link>

        <Link href="/admin/users">
          <div className="p-6 border rounded-lg hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold">User Management</h2>
            <p className="text-gray-600 mt-2">Manage user accounts and permissions</p>
          </div>
        </Link>

        <Link href="/admin/bookings">
          <div className="p-6 border rounded-lg hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold">Booking Management</h2>
            <p className="text-gray-600 mt-2">View and manage machine bookings</p>
          </div>
        </Link>
      </div>
    </div>
  );
} 