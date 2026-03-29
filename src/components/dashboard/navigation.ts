import {
  FaCog,
  FaHome,
  FaLayerGroup,
  FaList,
  FaRobot,
  FaTags,
} from "react-icons/fa";

export type DashboardRole = "ADMIN" | "USER" | undefined;

export type DashboardNavItem = {
  name: string;
  href: string;
  icon: typeof FaHome;
  adminOnly?: boolean;
};

export const dashboardNavItems: DashboardNavItem[] = [
  { name: "Overview", href: "/dashboard", icon: FaHome },
  { name: "My Prompts", href: "/dashboard/prompts", icon: FaList },
  { name: "Tags", href: "/dashboard/tags", icon: FaTags, adminOnly: true },
  { name: "AI Models", href: "/dashboard/ai-models", icon: FaRobot, adminOnly: true },
  { name: "Prompt Types", href: "/dashboard/prompt-types", icon: FaLayerGroup, adminOnly: true },
  { name: "Settings", href: "/dashboard/settings", icon: FaCog },
];

export function getDashboardNavItems(role: DashboardRole) {
  if (role === "ADMIN") {
    return dashboardNavItems;
  }

  return dashboardNavItems.filter((item) => !item.adminOnly);
}
