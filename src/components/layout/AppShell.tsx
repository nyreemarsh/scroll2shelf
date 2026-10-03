import type { ReactNode } from "react";
import { TopBar } from "./TopBar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <TopBar />
      <main className="mx-auto w-full max-w-[1280px] px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
        {children}
      </main>
    </div>
  );
}
