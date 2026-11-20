import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import DiseaseDetection from './pages/DiseaseDetection';
import YieldPrediction from './pages/YieldPrediction';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import { LanguageProvider } from './context/LanguageContext';
import { TourProvider } from './context/TourContext';
import GuidedTour from './components/GuidedTour';
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
  const navigate = useNavigate();
  const isDashboard = location.pathname === '/dashboard';
  const isDiseaseDetection = location.pathname === '/disease-detection';
  const isHome = location.pathname === '/';
  const isAdmin = location.pathname.startsWith('/admin') && location.pathname !== '/admin/login';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname.startsWith('/admin');

  // Login Gating: Redirect unauthenticated first-time users to /login unless guest mode is chosen
  useEffect(() => {
    const token = localStorage.getItem('token');
    const isGuest = localStorage.getItem('agrovision_guest_mode') === 'true';
    if (!token && !isGuest && !isAuthPage) {
      navigate('/login');
    }
  }, [location.pathname, isAuthPage, navigate]);

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
    <div className="relative z-10 flex flex-col h-screen overflow-hidden print:h-auto print:overflow-visible print:block">
      <Navbar />
      <main className={`flex-1 flex flex-col ${
        isDashboard ? 'p-0 overflow-auto' :
        isHome ? 'p-2 sm:p-4 overflow-hidden justify-center' :
        isDiseaseDetection ? 'p-1.5 sm:p-2 md:p-2.5 overflow-auto' :
        'p-4 md:p-8 overflow-auto'
      } print:overflow-visible print:h-auto print:block print:p-0`}>
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
      <GuidedTour />
      {!isDashboard && <div className="print:hidden"><AIAssistant /></div>}
    </div>
  );
};

function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-farm-dark text-white relative print:bg-white print:text-black print:min-h-0">
      {!isAdmin && (
        <div
          className="fixed top-0 left-0 w-full h-full z-0 print:hidden"
          style={{
            backgroundImage: `linear-gradient(rgba(7,12,24,0.78), rgba(4,8,16,0.88)), url(${heroBg})`,
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
        <TourProvider>
          <App />
        </TourProvider>
      </Router>
    </LanguageProvider>
  );
}

export default RootApp;