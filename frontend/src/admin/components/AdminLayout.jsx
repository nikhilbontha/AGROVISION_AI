import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { useAdmin } from '../context/AdminContext';

const AdminLayout = () => {
  const { sidebarCollapsed } = useAdmin();

  return (
    <div className="min-h-screen bg-farm-dark text-white font-sans flex relative overflow-x-hidden">
      {/* Responsive Collapsible Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
        }`}
      >
        <AdminHeader />

        <main className="flex-1 p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
