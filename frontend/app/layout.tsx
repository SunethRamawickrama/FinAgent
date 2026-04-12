import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "FinAgent",
  description: "AI-powered financial intelligence",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ display: "flex", minHeight: "100vh" }}>
        <Nav />
        <main style={{ marginLeft: "200px", flex: 1 }}>{children}</main>
      </body>
    </html>
  );
}
