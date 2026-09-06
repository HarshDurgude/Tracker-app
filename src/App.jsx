import React from "react";
import { Routes, Route, Navigate } from "react-router";
import Tasks from "./pages/Tasks";
import Archives from "./pages/Archives";
import Settings from "./pages/Settings";
import useAuth from "./hooks/useAuth";
import Login from "./components/Login";
import AppLayout from "./components/AppLayout";
import { useOnlineStatus } from "./hooks/useOnlineStatus";



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
  const isOnline = useOnlineStatus();

  return (
    <>

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
          <Route index path='/' element={<Tasks />} />

          {/* Archive page */}
          <Route path="archive" element={<Archives />} />

          {/* Settings page */}
          <Route path="settings" element={<Settings />} />

        </Route>

      </Routes>

      {/* toast msg which shows when user is offline */}
      {isOnline === false && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 max-w-xs text-center shadow-2xl border border-gray-200">
            <p className="text-gray-800 font-bold text-base">You are Offline!!!</p>
            <p className="text-sm text-gray-800">Please turn on internet.</p>
          </div>
        </div>
      )}


    </>
  );
}

export default App;