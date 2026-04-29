import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Oak Tree Farm | Booking Calendar",
  description: "Book private group slots at Oak Tree Farm.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      dir="rtl"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
