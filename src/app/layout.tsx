/* eslint-disable @next/next/no-page-custom-font -- App Router: fonte compartilhada no root layout. */
import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Providers } from "@/lib/trpc";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "EmpresTI",
  description: "Empréstimo de equipamentos internos",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/fill/style.css"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
