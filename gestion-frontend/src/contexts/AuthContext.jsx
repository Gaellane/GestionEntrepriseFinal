import React, { useState } from 'react';
import { AuthContext } from '../config/permissions';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  
  const login = (userData) => {
      localStorage.setItem('user', JSON.stringify(userData.user));
      localStorage.setItem('token', JSON.stringify(userData.token));
      setUser(userData.user);
  };
  
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };
  
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
