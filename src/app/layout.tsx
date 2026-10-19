import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EmpresTI",
  description: "Empréstimo de equipamentos internos",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <head>
        <link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css" />
        <link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/fill/style.css" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
