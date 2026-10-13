import type { Metadata } from "next";
import { Header, Footer } from "@/components/Site";
import "./globals.css";
export const metadata: Metadata = { title: { default: "Shanni Jin — places & small observations", template: "%s · Shanni Jin" }, description: "A quiet collection of places, photographs, and everyday observations. A visual prototype with sample content." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body><a className="skip" href="#main">Skip to content</a><Header/><main id="main">{children}</main><Footer/></body></html>; }
