import { useClerk, useUser } from "@clerk/clerk-react";
import {
  BookOpen,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  PersonStanding,
  Sparkles,
  Users,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface NavLeaf {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV: NavLeaf[] = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Users", href: "/users", icon: Users },
  { title: "Stories", href: "/stories", icon: BookOpen },
  { title: "Characters", href: "/characters", icon: PersonStanding },
  { title: "Feedback", href: "/feedback", icon: MessageSquare },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const { signOut } = useClerk();

  function isActive(href: string) {
    if (href === "/") return location.pathname === "/";
    return location.pathname === href || location.pathname.startsWith(href + "/");
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="pointer-events-none">
              <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Sparkles className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold">Milo Tales</span>
                <span className="text-xs text-muted-foreground">Admin</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    className="cursor-pointer"
                    isActive={isActive(item.href)}
                    onClick={() => navigate(item.href)}
                  >
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="px-2 py-1 text-xs text-muted-foreground truncate">
              {user?.primaryEmailAddress?.emailAddress ?? user?.firstName ?? "Admin"}
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="cursor-pointer"
              onClick={() => signOut()}
            >
              <LogOut className="size-4" />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
