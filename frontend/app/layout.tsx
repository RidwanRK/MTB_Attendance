import type { Metadata } from "next";
import "./globals.css";
import NavBar from "./components/NavBar";

export const metadata: Metadata = {
  title: "Attendance Manager",
  description: "Personal daily check-in / check-out attendance tracker",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <NavBar />
        <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-6 pb-24">
          {children}
        </main>
      </body>
    </html>
  );
}
