import { Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login.tsx";
import Dashboard from "./pages/Dashboard";
import PendingFixes from "./pages/PendingFixes";
// import ActiveFixes from "./pages/ActiveFixes";
import ResolvedFixes from "./pages/ResolvedFixes";
import ResolvedFixDetail from "./pages/ResolvedFixDetail";
import FailureDetail from "./pages/FailureDetail";
// import Repositories from "./pages/Repositories";

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
        {/* <Route path="/active" element={<ActiveFixes />} /> */}
        <Route path="/resolved" element={<ResolvedFixes />} />
        <Route path="/resolved-detail" element={<ResolvedFixDetail />} />
        <Route path="/failure" element={<FailureDetail />} />
        {/* <Route path="/repositories" element={<Repositories />} /> */}
      </Route>
    </Routes>
  );
}

export default App;
