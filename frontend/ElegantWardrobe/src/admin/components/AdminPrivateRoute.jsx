// Example: AdminRoute.jsx
// import { ADMIN_ACCESS_TOKEN } from '@/constants';
// import React from 'react';
// import { Navigate } from 'react-router-dom';

// const AdminPrivateRoute = ({ children }) => {
//   const token = localStorage.getItem(ADMIN_ACCESS_TOKEN);  
//   return token ? children : <Navigate to="/admin-login" />;
// };

// export default AdminPrivateRoute;


import api from "@/api";
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const AdminPrivateRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  console.log('AdminPrivateRoute');
  console.log('isAuthenticated =',isAuthenticated);

  useEffect(() => {
    
    const checkAuth = async () => {
      try {
        await api.get("/check-admin-auth/");  // A simple API endpoint to verify token
        setIsAuthenticated(true);
        console.log('success');
        
      } catch {
        setIsAuthenticated(false);
        console.log('failure');
        
      }
    };
    checkAuth();
  }, []);

  if (isAuthenticated === null) return <p>Loading...</p>;
  return isAuthenticated ? children : <Navigate to="/admin-login" />;
};

export default AdminPrivateRoute;
