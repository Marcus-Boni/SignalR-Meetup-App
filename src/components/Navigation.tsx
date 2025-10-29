"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../hooks/useAuth";

const Navigation = () => {
  const pathname = usePathname();
  const { username, logout } = useAuth();

  const links = [
    { href: "/tracking", label: "🚗 Tracking", icon: "🚗" },
    { href: "/chat", label: "💬 Chat", icon: "💬" },
    { href: "/payment", label: "💳 Payment", icon: "💳" },
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/tracking" className="flex items-center space-x-2">
            <span className="text-2xl">⚡</span>
            <span className="font-bold text-lg">SignalR Demo</span>
          </Link>

          {/* Links de navegação */}
          <div className="flex space-x-1">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <span className="hidden sm:inline">{link.label}</span>
                  <span className="sm:hidden">{link.icon}</span>
                </Link>
              );
            })}
          </div>

          {/* User Info + Logout */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {username || "Online"}
              </span>
            </div>

            <button
              onClick={logout}
              className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Sair"
            >
              🚪 Sair
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
