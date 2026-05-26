import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <LanguageProvider>
      <Router>
        <div className="min-h-screen bg-farm-dark text-white relative">
          <div 
            className="fixed top-0 left-0 w-full h-full z-0"
            style={{
              backgroundImage: `linear-gradient(rgba(7,12,28,0.72), rgba(7,12,28,0.78)), url(${heroBg})`,
              backgroundSize: "cover",
              backgroundPosition: "center center",
              backgroundRepeat: "no-repeat",
              backgroundAttachment: "fixed",
            }}
          ></div>
          <div className="relative z-10">
            <Navbar />
            <main className="p-4 md:p-8">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/disease-detection" element={<DiseaseDetection />} />
                <Route path="/yield-prediction" element={<YieldPrediction />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Routes>
            </main>
            <AIAssistant />
          </div>
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App;