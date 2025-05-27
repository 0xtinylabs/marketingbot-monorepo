import "./globals.css";
import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import { Toaster } from "react-hot-toast";

import { AppKit } from "@/app.kit";
import Wrapper from "@/components/container/wrapper";

const inter = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "TinyTrades",
  description: "TinyLabs TinyTradesmus",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased`}>
        <Toaster position="top-center" />
        <AppKit>
          <Wrapper>{children}</Wrapper>
        </AppKit>
      </body>
    </html>
  );
}
