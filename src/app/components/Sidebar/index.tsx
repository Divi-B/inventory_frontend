"use client";

import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsSidebarCollapsed } from "@/state";
import Image from "next/image";
import { LayoutDashboard } from "lucide-react";
import {Archive, CircleDollarSign,
  Clipboard,
  Layout,
  LucideIcon,
  Menu,
  SlidersHorizontal,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

interface SidebarLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
  isCollapsed: boolean;
}

const SidebarLink = ({
  href,
  icon: Icon,
  label,
  isCollapsed,
}: SidebarLinkProps) => {
  const pathname = usePathname();
  const isActive =
    pathname === href || (pathname === "/" && href === "/dashboard");

  return (
     <Link href={href}>
            <div
                className={`cursor-pointer flex items-center rounded-xl mx-2 my-1 ${
                    isCollapsed ? "justify-center py-4" : "justify-start px-6 py-4"
                }
                gap-6 transition-colors 
                hover:bg-indigo-100 
                ${isActive ? "bg-indigo-100 text-gray-950" : "text-gray-700 hover:text-gray-950"}`}
            >
                <Icon className={`w-5 h-5 ${isActive ? "!text-gray-950" : "!text-white hover:!text-gray-950"}`} />

                <span
                    className={`${
                        isCollapsed ? "hidden" : "block"
                    } font-medium ${isActive ? "text-gray-950" : "text-white hover:text-gray-950"}`}
                >
                    {label}
                </span>
            </div>
        </Link>
  );
};

const Sidebar = () => {
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );

  const toggleSidebar = () => {
    dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
  };

  const sidebarClassNames = `fixed flex flex-col ${
    isSidebarCollapsed ? "w-0 md:w-16" : "w-72 md:w-64"
  } bg-indigo-700 transition-all duration-300 overflow-hidden h-full shadow-md z-40`;

  return (
    <div className={sidebarClassNames}>
      {/* TOP LOGO */}
      <div
        className={`flex gap-3 justify-between md:justify-normal items-center pt-8 ${
          isSidebarCollapsed ? "px-5" : "px-8"
        }`}
        >
        <LayoutDashboard size={30} className="bg-indigo-200 rounded w-10" />
        <h1
          className={`${
            isSidebarCollapsed ? "hidden" : "block"
          } font-extrabold text-2xl text-white`}
        >
          StockWise
        </h1>

        <button
          className="md:hidden px-3 py-3 bg-gray-100 rounded-full hover:bg-indigo-200"
          onClick={toggleSidebar}
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {/* LINKS */}
      <div className="flex-grow mt-8 rounded-lg">
      <SidebarLink 
        href="/dashboard" 
        icon={Layout} 
        label="Dashboard" 
        isCollapsed={isSidebarCollapsed}
      />
      <SidebarLink
          href="/charts"
          icon={Archive}
          label="Charts"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/products"
          icon={Clipboard}
          label="Products"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/users"
          icon={User}
          label="Users"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/settings"
          icon={SlidersHorizontal}
          label="Settings"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/expenses"
          icon={CircleDollarSign}
          label="Expenses"
          isCollapsed={isSidebarCollapsed}
        />
      </div>
      

      {/* FOOTER */}
      <div className={`${isSidebarCollapsed ? "hidden" : "block"} mb-10`}>
        <p className="text-center text-xs text-white">&copy; 2025 StockWise</p>
      </div>
    </div>
  );
};

export default Sidebar;