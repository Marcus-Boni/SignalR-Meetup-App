"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import { Car, MessageCircle, CreditCard, LogOut, Wifi, Circle } from "lucide-react";

const Navigation = () => {
  const pathname = usePathname();
  const { username, logout } = useAuth();

  const links = [
    { href: "/tracking", label: "Tracking", icon: Car },
    { href: "/chat", label: "Chat", icon: MessageCircle },
    { href: "/payment", label: "Payment", icon: CreditCard },
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 border-b-2 border-[#ff6b35] dark:border-[#e85a2a] sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/tracking" className="flex items-center space-x-3 group">
            <div className="bg-linear-to-br from-[#ff6b35] to-[#e85a2a] rounded-xl p-2 group-hover:scale-110 transition-transform">
              <Wifi className="w-6 h-6 text-white" />
            </div>
            <div className="hidden md:block">
              <div className="font-bold text-lg text-gray-900 dark:text-white">SignalR Meetup</div>
              <div className="text-xs text-[#ff6b35] font-semibold">Optsolv</div>
            </div>
          </Link>

          <div className="flex space-x-1">
            {links.map((link) => {
              const isActive = pathname === link.href;
              const IconComponent = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    isActive
                      ? "bg-linear-to-r from-[#ff6b35] to-[#e85a2a] text-white shadow-lg"
                      : "text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-[#ff6b35]"
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="hidden sm:inline">{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Circle className="h-2 w-2 fill-green-500 text-green-500 animate-pulse" />
              <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                {username || "Online"}
              </span>
            </div>

            <button
              onClick={logout}
              className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-2 group"
              title="Sair"
            >
              <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
