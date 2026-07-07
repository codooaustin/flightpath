import type { Metadata } from "next";
import { B612, B612_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const b612 = B612({
  variable: "--font-b612",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const b612Mono = B612_Mono({
  variable: "--font-b612-mono",
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
      className={`${b612.variable} ${b612Mono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
