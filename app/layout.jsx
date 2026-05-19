import "./globals.css";
import "../src/styles/index.css";
import AppProviders from "@/providers/AppProviders";
import { Outfit, Source_Sans_3 } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
  variable: "--font-outfit"
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-source-sans"
});

export const metadata = {
  title: {
    default: "OperaDesk",
    template: "%s · OperaDesk"
  },
  description: "Gestão inteligente de chamados — OperaDesk",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    title: "OperaDesk"
  }
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="pt-BR"
      className={`${outfit.variable} ${sourceSans.variable}`}
      suppressHydrationWarning
    >
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
