import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Contacts from "./pages/Contacts";
import Services from "./pages/Services";
import Reminders from "./pages/Reminders";
import Tickets from "./pages/Tickets";
import CRM from "./pages/CRM";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import Contact from "./pages/Contact";
import ProtectedRoute from "./components/ProtectedRoute"; // 👈 nuevo
import Configuration from "./pages/Configuration";

function App() {
  const token = localStorage.getItem("token");

  return (
    <Router>
      <Routes>
        {/* Default → redirige a /home */}
        <Route path="/" element={<Navigate to="/home" replace />} />

        {/* Home */}
        <Route path="/home" element={<Home />} />

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Páginas públicas */}
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />

        {/* Admin only */}
        <Route
          path="/reminders"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Reminders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contacts"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Contacts />
            </ProtectedRoute>
          }
        />
        // frontend/src/App.jsx (ya lo tienes así)
        <Route
          path="/configuration"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Configuration />
            </ProtectedRoute>
          }
        />


        {/* Worker only */}
        <Route
          path="/tickets"
          element={
            <ProtectedRoute allowedRoles={["admin", "worker"]}>
              <Tickets />
            </ProtectedRoute>
          }
        />

        {/* Acceso general */}
        <Route
          path="/crm"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <CRM />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["admin", "worker", "client"]}>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route
          path="*"
          element={<Navigate to={token ? "/home" : "/login"} replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;
