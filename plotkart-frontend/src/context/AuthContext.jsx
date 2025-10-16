import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('plotkart_user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setUserRole(userData.role || null);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('plotkart_user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  // Login function - calls backend API
  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      const { user, token, refreshToken } = response.data;
      
      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('plotkart_user', JSON.stringify(user));
      
      setUser(user);
      setUserRole(user.role || null);
      
      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed. Please check your credentials.' 
      };
    }
  };

  // Register function - calls backend API
  const register = async (name, email, password, phone) => {
    try {
      const response = await authAPI.register(name, email, password, phone);
      const { user, token, refreshToken } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('plotkart_user', JSON.stringify(user));
      
      setUser(user);
      setUserRole(user.role || null);
      
      return { success: true, user };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed. Please try again.' 
      };
    }
  };

  // Select role function - calls backend API
  const selectRole = async (role) => {
    try {
      const response = await authAPI.setRole(role);
      const updatedUser = response.data.user;
      
      localStorage.setItem('plotkart_user', JSON.stringify(updatedUser));
      localStorage.setItem('plotkart_role', updatedUser.role);
      
      setUser(updatedUser);
      setUserRole(updatedUser.role);
      
      return { success: true };
    } catch (error) {
      console.error('Role selection error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Role selection failed.' 
      };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('plotkart_user');
    localStorage.removeItem('plotkart_role');
    setUser(null);
    setUserRole(null);
  };

  const value = {
    user,
    userRole,
    loading,
    login,
    register,
    logout,
    selectRole,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
