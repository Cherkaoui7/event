import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Suspense, lazy } from "react";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./hooks/useAuth";

import Navbar from "./components/layout/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";

// Optimisation : Lazy loading (Code Splitting) pour ne charger la 3D et les pages lourdes que lorsque nécessaire
const Simulate = lazy(() => import("./pages/Simulate"));
const Simulator3D = lazy(() => import("./pages/Simulator3D"));
const ClientDashboard = lazy(() => import("./pages/Dashboard/ClientDashboard"));
const AdminDashboard = lazy(() => import("./pages/Dashboard/AdminDashboard"));
const CreateEvent = lazy(() => import("./pages/Event/CreateEvent"));
const CustomizeRoom = lazy(() => import("./pages/Event/CustomizeRoom"));
const EventSummary = lazy(() => import("./pages/Event/EventSummary"));
const Suggestions = lazy(() => import("./pages/Suggestions"));

// Spinner de chargement global élégant
const PageLoader = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "80vh",
      color: "#b76e4b",
      fontFamily: "Poppins, sans-serif",
    }}
  >
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          width: "50px",
          height: "50px",
          border: "4px solid #efe3d3",
          borderTopColor: "#b76e4b",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          margin: "0 auto 15px",
        }}
      ></div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      <h3 style={{ margin: 0 }}>Chargement de l'expérience...</h3>
      <p style={{ color: "#7d8c7a", fontSize: "0.9rem" }}>
        Préparation des éléments graphiques
      </p>
    </div>
  </div>
);

// Composant de protection des routes
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== "admin") return <Navigate to="/" replace />;
  return children;
};

const AppRoutes = () => (
  <>
    <Navbar />
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Publiques (chargées immédiatement) */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Publiques (Lazy loaded) */}
        <Route path="/simulate" element={<Simulate />} />
        <Route path="/simulator-3d" element={<Simulator3D />} />

        {/* Protégées — client (Lazy loaded) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <ClientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/suggestions"
          element={
            <ProtectedRoute>
              <Suggestions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/create"
          element={
            <ProtectedRoute>
              <CreateEvent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/:id/customize"
          element={
            <ProtectedRoute>
              <CustomizeRoom />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/:id/summary"
          element={
            <ProtectedRoute>
              <EventSummary />
            </ProtectedRoute>
          }
        />

        {/* Protégées — admin (Lazy loaded) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
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
