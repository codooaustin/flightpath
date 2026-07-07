import type { Metadata } from "next";
import { Istok_Web } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const istokWeb = Istok_Web({
  variable: "--font-istok-web",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Flight Path",
  description:
    "Your personal aviation career companion — from first flight to airline captain.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${istokWeb.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
