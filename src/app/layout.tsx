import type { Metadata } from "next";
import { Inclusive_Sans } from "next/font/google";
import { AppShell } from "@/components/layout/AppShell";
import { MissionStepProvider } from "@/components/mission/MissionStepContext";
import "./globals.css";

const inclusiveSans = Inclusive_Sans({
  variable: "--font-inclusive-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "scroll2shelf · AI retail intelligence",
  description:
    "Scroll2Shelf turns emerging social trends into predicted shopping behaviour and retail recommendations.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inclusiveSans.variable} antialiased`}>
      <body>
        <MissionStepProvider>
          <AppShell>{children}</AppShell>
        </MissionStepProvider>
      </body>
    </html>
  );
}
