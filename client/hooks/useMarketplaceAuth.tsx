import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { User } from "@shared/api";
import { marketplaceApi } from "@/lib/marketplace-api";

interface MarketplaceAuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<boolean>;
  checkAuth: () => Promise<void>;
}

const MarketplaceAuthContext = createContext<MarketplaceAuthContextType | undefined>(undefined);

interface MarketplaceAuthProviderProps {
  children: ReactNode;
}

export function MarketplaceAuthProvider({ children }: MarketplaceAuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      
      // Check if token exists in localStorage
      const token = marketplaceApi.getToken();
      if (!token) {
        setUser(null);
        return;
      }

      // Try to get current user from API
      const response = await marketplaceApi.getCurrentUser();
      if (response.success && response.data?.user) {
        setUser(response.data.user);
      } else {
        // Invalid token, remove it
        await logout();
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      await logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await marketplaceApi.login({ email, password });
      
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await marketplaceApi.register(userData);
      
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Registration failed:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await marketplaceApi.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
    }
  };

  const updateUser = async (userData: Partial<User>): Promise<boolean> => {
    try {
      const response = await marketplaceApi.updateProfile(userData);
      
      if (response.success) {
        // Update local user state
        setUser(prev => prev ? { ...prev, ...userData } : null);
        
        // Update localStorage
        const updatedUser = { ...user, ...userData };
        localStorage.setItem("marketplace_user", JSON.stringify(updatedUser));
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Update user failed:", error);
      return false;
    }
  };

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const value: MarketplaceAuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    checkAuth,
  };

  return (
    <MarketplaceAuthContext.Provider value={value}>
      {children}
    </MarketplaceAuthContext.Provider>
  );
}

export function useMarketplaceAuth() {
  const context = useContext(MarketplaceAuthContext);
  if (context === undefined) {
    throw new Error("useMarketplaceAuth must be used within a MarketplaceAuthProvider");
  }
  return context;
}

export default useMarketplaceAuth;