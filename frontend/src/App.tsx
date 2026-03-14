import { Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PendingFixes from "./pages/PendingFixes";
import ActiveFixes from "./pages/ActiveFixes";
import ResolvedFixes from "./pages/ResolvedFixes";
import FailureDetail from "./pages/FailureDetail";
import Repositories from "./pages/Repositories";
import Settings from "./pages/Settings";

import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layout/AppLayout";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      {/* Protected routes */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pending" element={<PendingFixes />} />
        <Route path="/active" element={<ActiveFixes />} />
        <Route path="/resolved" element={<ResolvedFixes />} />
        <Route path="/failure/:id" element={<FailureDetail />} />
        <Route path="/repositories" element={<Repositories />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;
