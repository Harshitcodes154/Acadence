"use client";
import { useAuth } from "@/app/AuthContext";
import { LoginForm } from "@/components/login-form";
import { Dashboard } from "@/components/dashboard";

export default function Home() {
  const { user, logout, isLoading } = useAuth();
  if (isLoading)
    return (
      <main
        className="flex min-h-screen items-center justify-center"
        role="status"
      >
        <p className="text-sm text-muted-foreground">Opening your workspace…</p>
      </main>
    );
  return user ? (
    <Dashboard key={user.id} user={user} onLogout={logout} />
  ) : (
    <LoginForm />
  );
}
