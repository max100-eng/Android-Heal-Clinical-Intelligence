
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the User type. 
// When using Firebase/Supabase, you will map their user object to this structure.
interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // 1. INITIALIZATION CHECK
    // In a real app (Firebase/Supabase), use the `onAuthStateChanged` listener here.
    const storedUser = localStorage.getItem('clinical_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        console.log('AuthContext: Session restored for', parsedUser.email);
      } catch (e) {
        console.warn('AuthContext: Failed to parse stored user', e);
        localStorage.removeItem('clinical_user');
      }
    } else {
        console.log('AuthContext: No active session found.');
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password?: string) => {
    console.log('AuthContext: Attempting login for', email);
    
    // 2. LOGIN LOGIC
    // Replace the lines below with your provider's SDK:
    // const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    // if (error) throw error;
    
    // Simulation delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock user object
    const newUser = {
      id: 'usr_' + Math.random().toString(36).substr(2, 9),
      email: email,
      name: email.split('@')[0] || 'Medical Professional'
    };
    
    setUser(newUser);
    localStorage.setItem('clinical_user', JSON.stringify(newUser));
    console.log('AuthContext: Login successful', newUser);
  };

  const logout = () => {
    console.log('AuthContext: Logging out');
    
    // 3. LOGOUT LOGIC
    // await supabase.auth.signOut();
    
    setUser(null);
    localStorage.removeItem('clinical_user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
