import type { Metadata } from "next";
import SessionWrapper from "@/components/SessionWrapper";
import "./globals.css";

export const metadata: Metadata = {
  title: "teoinbio",
  description: "Your link in bio page",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionWrapper>{children}</SessionWrapper>
      </body>
    </html>
  );
}
