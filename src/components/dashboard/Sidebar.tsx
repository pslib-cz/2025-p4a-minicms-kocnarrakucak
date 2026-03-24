"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { ThemeSwitch } from "@/components/theme-switch";
import { FaHome, FaList, FaTags, FaRobot, FaSignOutAlt, FaCog, FaLayerGroup } from "react-icons/fa";

const navItems = [
  { name: "Overview", href: "/dashboard", icon: FaHome },
  { name: "My Prompts", href: "/dashboard/prompts", icon: FaList },
  { name: "Tags", href: "/dashboard/tags", icon: FaTags },
  { name: "AI Models", href: "/dashboard/ai-models", icon: FaRobot },
  { name: "Prompt Types", href: "/dashboard/prompt-types", icon: FaLayerGroup },
  { name: "Settings", href: "/dashboard/settings", icon: FaCog },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="flex flex-col w-64 bg-zinc-50 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 h-screen fixed">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          PromptVault
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.filter(item => session?.user?.role === "ADMIN" || !["/dashboard/tags", "/dashboard/ai-models", "/dashboard/prompt-types"].includes(item.href)).map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              <item.icon className={isActive ? "text-blue-600 dark:text-blue-400" : ""} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
        <div className="flex items-center space-x-3 px-4">
          <ThemeSwitch />
        </div>
        <div className="flex items-center space-x-3 px-4">
          {session?.user?.image && (
            <img
              src={session.user.image}
              alt="User Avatar"
              className="w-8 h-8 rounded-full"
            />
          )}
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium truncate">
              {session?.user?.name || "User"}
            </span>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center space-x-3 px-4 py-2 w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
        >
          <FaSignOutAlt />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
