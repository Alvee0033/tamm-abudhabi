import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Verify Economic Licence | TAHAQAQ",
  description:
    "Ensure that the facility you are dealing with is licenced by ADDED and whether it is a micro, small or medium enterprise by using TAHAQAQ tool.",
  icons: { icon: "/favicon.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
