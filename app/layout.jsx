import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "OperaDesk",
  description: "Central de chamados OperaDesk"
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
