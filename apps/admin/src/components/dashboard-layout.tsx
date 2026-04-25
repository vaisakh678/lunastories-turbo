import { Outlet } from "react-router-dom";

import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export function DashboardLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="bg-background/70 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-20 flex h-12 items-center gap-2 border-b px-4 backdrop-blur">
          <SidebarTrigger />
        </header>
        <div className="mx-auto w-full max-w-7xl p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
