import type { Metadata, Viewport } from "next";
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import Footer from "@/components/layout/Footer";
import ServiceWorkerRegister from "@/components/pwa/ServiceWorkerRegister";
import "@/app/globals.css";
import { KOS_NAME, KOS_SLOGAN } from "@/lib/constants";

export const metadata: Metadata = {
  title: `${KOS_NAME} - Mobile PWA Kos App`,
  description: KOS_SLOGAN,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: KOS_NAME,
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#8D6E63",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="bg-cream text-espresso min-h-screen antialiased selection:bg-caramel selection:text-espresso">
        {/* Mobile App Viewport Container */}
        <div className="mobile-app-shell flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 px-4 py-5 pb-24 sm:pb-28 space-y-6">
            {children}
          </main>
          <ServiceWorkerRegister />
          <Footer />
          <BottomNav />
        </div>
      </body>
    </html>
  );
}

