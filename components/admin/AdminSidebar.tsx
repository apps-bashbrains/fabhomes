"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const nav = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Properties", href: "/admin/properties" },
  { label: "Leads", href: "/admin/leads" },
  { label: "User Queries", href: "/admin/user-queries" },
  { label: "Listing Requests", href: "/admin/listing-requests" },
  { label: "Users", href: "/admin/users" },
  { label: "Settings", href: "/admin/settings" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 flex-shrink-0 bg-gray-900 text-white min-h-screen flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <Link href="/admin" className="font-semibold text-lg">FabHomes Admin</Link>
      </div>
      <nav className="p-4 flex-1">
        <ul className="space-y-1">
          {nav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block px-4 py-2 rounded-lg ${
                  pathname === item.href ? "bg-primary text-white" : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-700">
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="w-full text-left px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
