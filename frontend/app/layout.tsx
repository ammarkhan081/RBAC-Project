import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/authContext";
import AuthGuard from "@/components/AuthGuard";
import FloatingNavMenu from "@/components/FloatingNavMenu";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Secure Role-Based AI Assistant for Enterprise Finance",
  description: "Enterprise-Grade, Role-Scoped AI Financial Intelligence & Hybrid Fusion Engine",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#f3f5fa] text-slate-900 min-h-screen antialiased flex flex-col`}>
        <AuthProvider>
          <AuthGuard>
            <main className="flex-1 min-h-screen">{children}</main>
            <FloatingNavMenu />
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}