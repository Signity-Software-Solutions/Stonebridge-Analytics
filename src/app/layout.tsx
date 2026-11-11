import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { AppProvider } from "@/components/AppProvider";
import { WorkspaceProvider } from "@/components/WorkspaceProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jbMono = JetBrains_Mono({
  variable: "--font-jbmono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stonebridge Analytics, every claim accounted for",
  description:
    "Governed claims reporting for corporate insurance programs: curated finance and operations reports with a plain English question dock on every one.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${jbMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <AppProvider>
          <WorkspaceProvider>{children}</WorkspaceProvider>
        </AppProvider>
      </body>
    </html>
  );
}
