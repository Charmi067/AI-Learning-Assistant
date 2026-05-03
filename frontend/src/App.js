// src/App.js
// LoginWithPhone route removed — backend only supports email/password auth
import React from "react";
import SignUp from "./components/authentication/SignUp";
import { Login } from "./components/authentication/login";
import AiDashboard from "./components/AiDashboard";
import ProtectedRoute from "./components/authentication/ProtectedRoute";
import Forgot from "./components/authentication/forgot";
import ResetPassword from "./components/authentication/ResetPassword";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

function App() {
  const myrouter = createBrowserRouter([
    { path: "/", element: <Login /> },
    { path: "/login", element: <Login /> },
    { path: "/signUp", element: <SignUp /> },
    { path: "/forgot", element: <Forgot /> },
    { path: "/reset-password", element: <ResetPassword /> },
    {
      path: "/AiDashboard",
      element: (
        <ProtectedRoute>
          <AiDashboard />
        </ProtectedRoute>
      ),
    },
  ]);

  return <RouterProvider router={myrouter} />;
}

export default App;
