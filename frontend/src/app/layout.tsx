import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "December - Your Personal Full Stack Engineer",
  description:
    "Idea to app in seconds, with your personal full stack engineer. Build, deploy, and manage containerized applications with AI assistance.",
  keywords: [
    "AI",
    "full stack",
    "development",
    "containers",
    "Next.js",
    "deployment",
    "coding assistant",
  ],
  authors: [{ name: "December" }],
  creator: "December",
  publisher: "December",
  openGraph: {
    title: "December - Your Personal Full Stack Engineer",
    description:
      "Idea to app in seconds, with your personal full stack engineer",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-december.png",
        width: 1200,
        height: 630,
        alt: "December - Your Personal Full Stack Engineer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "December - Your Personal Full Stack Engineer",
    description:
      "Idea to app in seconds, with your personal full stack engineer",
    images: ["/og-december.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: "width=device-width, initial-scale=1",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning={true} lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('december-theme') || 'system';
                if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.add('light');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body
        suppressHydrationWarning={true}
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster
          position="top-right"
          toastOptions={{
            className: "bg-gray-800 text-white",
            style: {
              fontFamily: "var(--font-geist-sans)",
              fontSize: "14px",
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
