import type { Metadata } from "next";

import { I18nProvider } from "@/lib/i18n/i18n-provider";
import { getCurrentLocale } from "@/lib/i18n/server";
import { TooltipProvider } from "@/components/ui/tooltip";

import "./globals.css";

export const metadata: Metadata = {
  title: "StockWise",
  description:
    "Modern inventory intelligence dashboard foundation for warehouse operations.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getCurrentLocale();

  return (
    <html
      lang={locale}
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        <I18nProvider initialLocale={locale}>
          <TooltipProvider>{children}</TooltipProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
