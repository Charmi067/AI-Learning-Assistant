import React from 'react';
import SignUp from './components/authentication/SignUp';
import { Login } from './components/authentication/login';
import AiDashboard from './components/AiDashboard';
import ProtectedRoute from './components/authentication/ProtectedRoute';
import Forgot from './components/authentication/forgot'; 
import ResetPassword from './components/authentication/ResetPassword';
import LoginWithPhone from './components/authentication/LoginWithPhone';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';

function App() {
  const myrouter = createBrowserRouter([
    { path: '/signUp', element: <SignUp /> },
    { path: '/login', element: <Login /> },
    { path: '/forgot', element: <Forgot /> },
    { path: '/reset-password', element: <ResetPassword /> },
    { path: '/login-with-phone', element: <LoginWithPhone /> },
    { path: '/AiDashboard', element: <ProtectedRoute><AiDashboard /></ProtectedRoute> },
  ]);
  return (
    <>
      <RouterProvider router={myrouter} />
    </>
  );
}

export default App;
