import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import DiseaseDetection from './pages/DiseaseDetection';
import YieldPrediction from './pages/YieldPrediction';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import { LanguageProvider } from './context/LanguageContext';
import AIAssistant from './components/AIAssistant';
import heroBg from './assets/hero-bg.png';

// Admin imports
import { AdminProvider } from './admin/context/AdminContext';
import AdminLogin from './admin/pages/AdminLogin';
import AdminLayout from './admin/components/AdminLayout';
import AdminDashboard from './admin/pages/AdminDashboard';
import UserManagement from './admin/pages/UserManagement';
import CropManagement from './admin/pages/CropManagement';
import DiseaseManagement from './admin/pages/DiseaseManagement';
import DetectionRecords from './admin/pages/DetectionRecords';
import PredictionRecords from './admin/pages/PredictionRecords';
import DedicatedAnalytics from './admin/pages/DedicatedAnalytics';
import ModelManagement from './admin/pages/ModelManagement';
import FeedbackManagement from './admin/pages/FeedbackManagement';
import AdminSettings from './admin/pages/AdminSettings';

const MainContent = () => {
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';
  const isAdmin = location.pathname.startsWith('/admin') && location.pathname !== '/admin/login';

  if (isAdmin) {
    return (
      <AdminProvider>
        <Routes>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="crops" element={<CropManagement />} />
            <Route path="diseases" element={<DiseaseManagement />} />
            <Route path="detections" element={<DetectionRecords />} />
            <Route path="predictions" element={<PredictionRecords />} />
            <Route path="analytics" element={<DedicatedAnalytics />} />
            <Route path="model" element={<ModelManagement />} />
            <Route path="feedback" element={<FeedbackManagement />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </AdminProvider>
    );
  }

  return (
    <div className="relative z-10 flex flex-col h-screen overflow-hidden">
      <Navbar />
      <main className={`flex-1 overflow-auto flex flex-col ${isDashboard ? 'p-0' : 'p-4 md:p-8'}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/disease-detection" element={<DiseaseDetection />} />
          <Route path="/yield-prediction" element={<YieldPrediction />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
      {!isDashboard && <AIAssistant />}
    </div>
  );
};

function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-farm-dark text-white relative">
      {!isAdmin && (
        <div
          className="fixed top-0 left-0 w-full h-full z-0"
          style={{
            backgroundImage: `linear-gradient(rgba(7,12,28,0.35), rgba(7,12,28,0.45)), url(${heroBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center center",
            backgroundRepeat: "no-repeat",
            backgroundAttachment: "fixed",
          }}
        ></div>
      )}
      <MainContent />
    </div>
  );
}

function RootApp() {
  return (
    <LanguageProvider>
      <Router>
        <App />
      </Router>
    </LanguageProvider>
  );
}

export default RootApp;