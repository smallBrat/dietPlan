import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { LoginPage } from './pages/Auth';
import { RegisterPage } from './pages/Register';
import { CreatePlan } from './pages/CreatePlan';
import { UploadPlan } from './pages/UploadPlan';
import { DietPlanViewer } from './pages/DietPlanViewer';
import { WhatsAppContext } from './pages/WhatsAppContext';
import { useAuthStore } from './store/authStore';

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth);
  if (isCheckingAuth) {
    return null;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Layout>{children}</Layout>;
};

const AuthRedirect: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth);

  if (isCheckingAuth) {
    return null;
  }

  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
};

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/create-plan" element={<ProtectedRoute><CreatePlan /></ProtectedRoute>} />
        <Route path="/upload-plan" element={<ProtectedRoute><UploadPlan /></ProtectedRoute>} />
        <Route path="/diet-plan" element={<ProtectedRoute><DietPlanViewer /></ProtectedRoute>} />
        <Route path="/whatsapp-context" element={<ProtectedRoute><WhatsAppContext /></ProtectedRoute>} />
        
        {/* Default Redirect */}
        <Route path="/" element={<AuthRedirect />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
