
import React from 'react';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { DashboardContent } from '../.././server/src/components/admin/dashboard/DashboardContent';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is not admin and redirect if needed
    if (user && !user.isAdmin) {
      console.log('Non-admin user attempted to access admin dashboard, redirecting...');
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // If user is not logged in or not admin, don't render the dashboard
  if (!user || !user.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4">
      <DashboardContent />
    </div>
  );
};

export default AdminDashboard;
