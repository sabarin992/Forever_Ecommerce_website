// import React from "react";
// import { USER_ACCESS_TOKEN } from "../constants";
// import { Navigate } from "react-router-dom";

// const PrivateRoute = ({ children }) => {
//   const getAccessToken = () => {
//     const token = localStorage.getItem(USER_ACCESS_TOKEN);
//     console.log(token);
//   };
//   const token = localStorage.getItem(USER_ACCESS_TOKEN);

//   if (!token) {
//     return <Navigate to="/login" replace />;
//   }

//   return children;
// };

// export default PrivateRoute;


import api from "@/api";
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  console.log('privateRoute');
  

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await api.get("/check-auth/");  // A simple API endpoint to verify token
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
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;

