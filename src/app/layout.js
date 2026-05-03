import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import DashboardLayout from "@/components/layout/DashboardLayout";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata = {
  title: "Architectural Studio CMS",
  description: "Admin dashboard and content management portal for architectural projects.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-surface-alt font-sans text-on-surface">
        <DashboardLayout>
          {children}
        </DashboardLayout>
      </body>
    </html>
  );
}
