import type { Metadata } from "next";
import { AuthProvider } from "@/app/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Acadence — Academic Timetable Planner",
  description:
    "A thoughtful workspace to plan, generate, review, and export balanced academic timetables.",
  keywords:
    "timetable, scheduling, education, class management, academic planning",
  authors: [{ name: "Class Scheduling Team" }],
  robots: "index, follow",
  openGraph: {
    title: "Acadence — Academic Timetable Planner",
    description: "Plan your academic week with a clear, balanced timetable.",
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
