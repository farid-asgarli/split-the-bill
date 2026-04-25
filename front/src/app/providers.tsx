"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "@/hooks/use-theme";
import { I18nProvider } from "@/hooks/use-i18n";
import { OfflineBanner } from "@/components/ui/offline-banner";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <I18nProvider>
        <OfflineBanner />
        {children}
      </I18nProvider>
    </ThemeProvider>
  );
}
