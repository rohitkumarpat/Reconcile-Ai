import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import DashboardLayout from "./layouts/DashboardLayout";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import Documents from "./pages/Documents";
import Transactions from "./pages/Transactions";
import Agent from "./pages/Agent";
import Subscriptions from "./pages/Subscriptions";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login/*" element={<Login />} />
      <Route path="/signup/*" element={<Signup />} />
      {/* Protected application */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
         <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/agent" element={<Agent />} />
        <Route path="/subscriptions" element={<Subscriptions />} />
      </Route>

      {/* Fallback */}
      <Route
        path="*"
        element={<Navigate to="/dashboard" replace />}
      />
    </Routes>
  );
}

export default App;