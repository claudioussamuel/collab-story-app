import type { Metadata } from "next";
import "./globals.css";
import "./theme.css";
import "./dribbble-theme.css";
import { Providers } from "./providers";
import Header from "./components/Header";
import { type ReactNode } from "react";



export const metadata: Metadata = {
  title: "Bernice",
  description: "Pure Creative Freedom",
};

export default function RootLayout(props: { children: ReactNode }) {
  return (
      <html lang="en">
          <head>
              <link rel="icon" href="/T-Sender.svg" sizes="any" />
          </head>
          <body className="bg-zinc-50">
              <Providers>
                  <Header />
                  {props.children}
              </Providers>
          </body>
      </html>
  )
}
