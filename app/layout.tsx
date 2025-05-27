import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aurora Simula",
  description: "Ito na ang Simula!",
  openGraph: {
    title: "Aurora Simula",
    description: "Ito na ang Simula!",
    url: "https://aurora.io",
    siteName: "Aurora Simula",
    images: [
      {
        url: "https://aurora.io/assets/icons/logo.ico",
        width: 1200,
        height: 630,
        alt: "Aurora Simula Banner",
      },
    ],
    type: "website",
  },
};

const roboto = Poppins({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "700"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={roboto.className}>
      <body>
        <main>
          {/* <RouterTransition /> */}
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
