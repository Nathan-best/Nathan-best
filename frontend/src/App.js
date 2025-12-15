import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import LandingPagePro from './pages/LandingPagePro';
import DashboardIndustrial from './pages/DashboardIndustrial';
import JobDetails from './pages/JobDetails';
import PaymentSuccess from './pages/PaymentSuccess';
import PricingPage from './pages/PricingPage';
import RevenueDashboard from './pages/RevenueDashboard';
import { Toaster } from './components/ui/sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
  withCredentials: true
});

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen tech-grid-bg flex items-center justify-center">
        <div className="tech-spinner"></div>
      </div>
    );
  }

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route 
            path="/" 
            element={user ? <Navigate to="/dashboard" /> : <LandingPagePro setUser={setUser} />} 
          />
          <Route 
            path="/dashboard" 
            element={user ? <DashboardIndustrial user={user} setUser={setUser} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/jobs/:jobId" 
            element={user ? <JobDetails user={user} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/payment-success" 
            element={user ? <PaymentSuccess user={user} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/pricing" 
            element={user ? <PricingPage user={user} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/admin/revenue" 
            element={user ? <RevenueDashboard user={user} /> : <Navigate to="/" />} 
          />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors theme="dark" />
    </div>
  );
}

export default App;
