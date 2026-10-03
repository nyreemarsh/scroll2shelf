import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { MissionStepProvider } from "@/components/mission/MissionStepContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "scroll2shelf · AI retail intelligence",
  description:
    "Scroll2Shelf turns emerging social trends into predicted shopping behaviour and retail recommendations.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="antialiased">
      <body>
        <MissionStepProvider>
          <AppShell>{children}</AppShell>
        </MissionStepProvider>
      </body>
    </html>
  );
}
