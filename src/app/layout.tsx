import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ClientProviders } from "@/providers/ClientProviders";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "sonner";
import { RpcHealthBanner } from "@/components/common/RpcHealthBanner";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gather3 — Own Your Events",
  description:
    "A web3-native event platform where events, RSVPs, and attendance are owned by users, not platforms. Built on Arkiv.",
  keywords: ["web3", "events", "arkiv", "decentralized", "RSVP", "blockchain"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} antialiased min-h-screen flex flex-col`}
      >
        <ClientProviders>
          <Header />
          <RpcHealthBanner />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster
            theme="dark"
            position="bottom-right"
            toastOptions={{
              style: {
                background: "rgba(15, 15, 30, 0.9)",
                border: "1px solid rgba(255,255,255,0.1)",
                backdropFilter: "blur(16px)",
              },
            }}
          />
        </ClientProviders>
      </body>
    </html>
  );
}
