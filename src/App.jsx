import React from "react";
import { Routes, Route, Navigate } from "react-router";
import Tasks from "./pages/Tasks";
import Archive from "./pages/Archive";
import useAuth from "./hooks/useAuth";
import Login from "./components/Login";
import AppLayout from "./components/AppLayout";


// Protects pages that require a logged-in user
function ProtectedRoute({ children }) {

  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}


// Prevents logged-in users from accessing the login page
function PublicRoute({ children }) {

  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
}


function App() {

  return (
    <Routes>

      {/* Login is only for logged-out users */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />


      {/* Everything here requires login */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >

        {/* Main Tasks page */}
        <Route index element={<Tasks />} />

        {/* Archive page */}
        <Route path="archive" element={<Archive />} />

      </Route>

    </Routes>
  );
}

export default App;