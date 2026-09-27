"use client";
import {
  createContext,
  useState,
  useEffect,
  useContext,
  type ReactNode,
} from "react";
import { auth } from "@/lib/firebaseClient";
import { onAuthStateChanged, signOut } from "firebase/auth";

export type UserType = {
  id: string;
  name: string;
  role: string;
  isDemo?: boolean;
};
type AuthContextType = {
  user: UserType | null;
  isLoading: boolean;
  error: string;
  startDemo: () => void;
  logout: () => Promise<void>;
};
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(!!auth);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(
      auth,
      (fbUser) => {
        setUser(
          fbUser
            ? {
                id: fbUser.uid,
                name: fbUser.displayName || fbUser.email || "Planner",
                role: "Personal workspace",
              }
            : null,
        );
        setIsLoading(false);
      },
      () => {
        setError("We couldn’t restore your session. Please sign in again.");
        setIsLoading(false);
      },
    );
  }, []);
  const logout = async () => {
    setError("");
    try {
      if (auth && !user?.isDemo) await signOut(auth);
      setUser(null);
    } catch {
      setError("Sign out failed. Check your connection and try again.");
    }
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        startDemo: () => {
          setError("");
          setUser({
            id: "demo",
            name: "Alex Morgan",
            role: "Demo workspace",
            isDemo: true,
          });
        },
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
