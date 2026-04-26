import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';

import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Simulate from './pages/Simulate';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ClientDashboard from './pages/Dashboard/ClientDashboard';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import CreateEvent from './pages/Event/CreateEvent';
import CustomizeRoom from './pages/Event/CustomizeRoom';
import EventSummary from './pages/Event/EventSummary';
import Suggestions from './pages/Suggestions';
import Simulator3D from './pages/Simulator3D';

// Composant de protection des routes
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding:'2rem', textAlign:'center' }}>Chargement...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

const AppRoutes = () => (
  <>
    <Navbar />
    <Routes>
      {/* Publiques */}
      <Route path="/"          element={<Home />} />
      <Route path="/simulate"  element={<Simulate />} />
      <Route path="/simulator-3d" element={<Simulator3D />} />
      <Route path="/login"     element={<Login />} />
      <Route path="/register"  element={<Register />} />

      {/* Protégées — client */}
      <Route path="/dashboard" element={<ProtectedRoute><ClientDashboard /></ProtectedRoute>} />
      <Route path="/suggestions" element={<ProtectedRoute><Suggestions /></ProtectedRoute>} />
      <Route path="/events/create" element={<ProtectedRoute><CreateEvent /></ProtectedRoute>} />
      <Route path="/events/:id/customize" element={<ProtectedRoute><CustomizeRoom /></ProtectedRoute>} />
      <Route path="/events/:id/summary"   element={<ProtectedRoute><EventSummary /></ProtectedRoute>} />

      {/* Protégées — admin */}
      <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </>
);

const App = () => (
  <AuthProvider>
    <Router>
      <AppRoutes />
    </Router>
  </AuthProvider>
);

export default App;
