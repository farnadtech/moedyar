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
      console.log("Checking auth status...", {
        isAuthenticated: apiService.isAuthenticated(),
        hasToken: !!localStorage.getItem("authToken")
      });

      if (apiService.isAuthenticated()) {
        const response = await apiService.getCurrentUser();
        console.log("getCurrentUser response:", response);

        if (response.success && response.data) {
          setUser(response.data.user);
          console.log("User set successfully:", response.data.user);
        } else {
          console.log("Auth check failed, response:", response);
          // Only logout if it's a clear auth failure, not a network error
          if (!response.message?.includes("خطا در ارتباط")) {
            console.log("Logging out due to auth failure");
            apiService.logout();
          }
        }
      } else {
        console.log("No auth token found");
      }
    } catch (error) {
      console.error("Auth check error:", error);
      // Only logout for non-network errors
      if (!(error instanceof TypeError && error.message.includes("fetch"))) {
        console.error("Auth check failed:", error);
        apiService.logout();
      } else {
        console.warn("Network error during auth check, keeping user logged in");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiService.login({ email, password });
      if (response.success && response.data) {
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
        setUser(response.data.user);
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
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
