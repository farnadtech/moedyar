import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { apiService } from "@/lib/api";

interface User {
  id: string;
  fullName: string;
  email: string;
  accountType: string;
  subscriptionType: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      if (apiService.isAuthenticated()) {
        const response = await apiService.getCurrentUser();

        if (response.success && response.data) {
          console.log("RefreshUser: Setting user data:", {
            id: response.data.user.id,
            email: response.data.user.email,
            subscriptionType: response.data.user.subscriptionType,
            teamId: response.data.user.teamId,
          });
          setUser(response.data.user);
        } else {
          // Only logout if it's a clear auth failure, not a network error
          if (
            !response.message?.includes("خطا در ارتباط") &&
            !response.message?.includes("سرور")
          ) {
            apiService.logout();
          }
        }
      }
    } catch (error) {
      // Only logout for non-network errors
      if (!(error instanceof TypeError && error.message.includes("fetch"))) {
        console.error("Auth check failed:", error);
        // Don't auto-logout on server errors
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiService.login({ email, password });
      if (response.success && response.data) {
        console.log("Login: Setting user data:", {
          id: response.data.user.id,
          email: response.data.user.email,
          subscriptionType: response.data.user.subscriptionType,
          teamId: response.data.user.teamId,
        });
        setUser(response.data.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const response = await apiService.getCurrentUser();
      if (response.success && response.data) {
        console.log("Auth: Setting user data:", {
          id: response.data.user.id,
          email: response.data.user.email,
          subscriptionType: response.data.user.subscriptionType,
          teamId: response.data.user.teamId,
        });
        setUser(response.data.user);
      } else {
        // If refresh fails and it's not a network error, logout
        if (
          !response.message?.includes("خطا در ارتباط") &&
          !response.message?.includes("سرور")
        ) {
          console.log("User refresh failed, logging out:", response.message);
          logout();
        }
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
      // Don't logout on network errors
      if (!(error instanceof TypeError && error.message.includes("fetch"))) {
        logout();
      }
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
