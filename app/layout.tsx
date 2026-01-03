import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Popup-Max - Popup & Lead Capture Platform",
  description: "Create and manage popups with lead capture functionality",
};

import AuthProvider from '@/components/auth/AuthProvider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

