import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "./providers";
import { ThemeProvider } from "@/components/layout/theme-provider";

export const metadata: Metadata = {
  title: "InterviewAI — Master Your Practice Voice Interviews",
  description:
    "Simulate realistic behavioral, technical, and system design interviews with an expert AI coach. Get real-time audio feedback, progression tracking, and interactive reports.",
  icons: {
    icon: "/logo_icon.png",
    shortcut: "/logo_icon.png",
    apple: "/logo_icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        "dark",
        "font-sans",
      )}
    >
      <body>
        <ThemeProvider>
          <Providers>{children}</Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
