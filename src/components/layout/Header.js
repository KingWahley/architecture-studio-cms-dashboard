"use client";

import React from "react";
import { Search, Bell, User } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  
  // Format pathname to a readable title
  const title = pathname === "/" 
    ? "Dashboard" 
    : pathname.split('/')[1].charAt(0).toUpperCase() + pathname.split('/')[1].slice(1);

  return (
    <header className="h-16 bg-surface-main border-b border-border-subtle flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex items-center">
        <h1 className="font-display font-semibold text-xl text-on-surface">
          {title.replace('-', ' ')}
        </h1>
      </div>

      <div className="flex items-center gap-6">
       

        <div className="flex items-center gap-3 border-l border-border-subtle pl-6 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-surface-tint flex items-center justify-center text-white font-medium text-sm">
            <User size={16} />
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-medium text-on-surface leading-none">Admin User</p>
            <p className="text-xs text-text-secondary mt-1">admin@pieach.com</p>
          </div>
        </div>
      </div>
    </header>
  );
}
