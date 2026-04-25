import { useClerk, useUser } from "@clerk/clerk-react";
import {
  BookOpen,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  PersonStanding,
  Users,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

import { cn } from "@/lib/cn";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/users", label: "Users", icon: Users, end: false },
  { to: "/stories", label: "Stories", icon: BookOpen, end: false },
  { to: "/characters", label: "Characters", icon: PersonStanding, end: false },
  { to: "/feedback", label: "Feedback", icon: MessageSquare, end: false },
];

export function AdminLayout() {
  const { user } = useUser();
  const { signOut } = useClerk();

  return (
    <div className="flex h-full">
      <aside className="flex w-60 shrink-0 flex-col border-r border-gray-200 bg-white">
        <div className="px-5 py-5">
          <h1 className="text-lg font-bold text-gray-900">Milo Tales</h1>
          <p className="text-xs text-gray-500">Admin Console</p>
        </div>

        <nav className="flex-1 px-3">
          <ul className="space-y-1">
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 text-sm",
                      isActive
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "text-gray-700 hover:bg-gray-50",
                    )
                  }
                >
                  <item.icon className="size-4" />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-gray-200 p-3">
          <div className="mb-2 truncate px-2 text-xs text-gray-500">
            {user?.primaryEmailAddress?.emailAddress ?? user?.firstName ?? "Admin"}
          </div>
          <button
            type="button"
            onClick={() => signOut()}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
