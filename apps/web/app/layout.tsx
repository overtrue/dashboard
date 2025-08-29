import { Inter } from "next/font/google";
import { AIChatContainer } from "@/components/ai-chat-container";
import { ThemeProvider } from "@/components/theme-provider";

import "./globals.css";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontSans.variable} font-sans antialiased`}>
        <ThemeProvider
          defaultTheme="system"
          enableSystem
        >
          {children}
          <AIChatContainer />
        </ThemeProvider>
      </body>
    </html>
  );
}
