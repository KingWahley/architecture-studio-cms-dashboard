"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  FolderKanban, 
  Users, 
  Briefcase, 
  MessageSquare, 
  Calendar, 
  BookOpen, 
  Settings,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Projects", href: "/projects", icon: FolderKanban },
  { name: "Team", href: "/team", icon: Users },
  { name: "Vacancies", href: "/vacancies", icon: Briefcase },
  { name: "Messages", href: "/messages", icon: MessageSquare },
  { name: "Appointments", href: "/appointments", icon: Calendar },
  { name: "Blog Posts", href: "/blog", icon: BookOpen },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 260 }}
      className="h-screen sticky top-0 bg-surface-main border-r border-border-subtle flex flex-col z-20 transition-all duration-300"
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-border-subtle">
        {!isCollapsed && (
          <span className="font-display font-bold text-lg text-accent-deep-blue whitespace-nowrap overflow-hidden">
            Studio CMS
          </span>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-md hover:bg-surface-alt text-text-secondary transition-colors"
          aria-label="Toggle Sidebar"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-3">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors whitespace-nowrap overflow-hidden",
                isActive 
                  ? "bg-accent-deep-blue text-white" 
                  : "text-text-secondary hover:bg-surface-alt hover:text-on-surface"
              )}
            >
              <item.icon size={20} className="shrink-0" />
              {!isCollapsed && <span className="font-medium text-sm">{item.name}</span>}
            </Link>
          );
        })}
      </div>

      <div className="p-3 border-t border-border-subtle">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-md text-text-secondary hover:bg-surface-alt hover:text-on-surface transition-colors whitespace-nowrap overflow-hidden"
        >
          <Settings size={20} className="shrink-0" />
          {!isCollapsed && <span className="font-medium text-sm">Settings</span>}
        </Link>
      </div>
    </motion.aside>
  );
}
