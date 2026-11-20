"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAdmin } from "@/lib/hooks/use-admin";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopBar } from "@/components/admin/admin-topbar";

const TITLES: Record<string, string> = {
  "/admin": "Dashboard Overview",
  "/admin/users": "User Management",
  "/admin/activities": "Activity Monitor",
  "/admin/requests": "Money Requests",
  "/admin/deposit-addresses": "Deposit Receiving Addresses",
  "/admin/content": "Site Content & Events",
  "/admin/announcements": "Announcements",
  "/admin/security": "Security Log",
  "/admin/settings": "Admin Settings",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = useAdmin();
  const router = useRouter();
  const pathname = usePathname();
  const title = pathname ? TITLES[pathname] ?? "Admin" : "Admin";
  const isLoginRoute = pathname === "/admin/login";
  const [navOpen, setNavOpen] = useState(false);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  // Allow Escape to dismiss the mobile drawer.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setNavOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (isLoginRoute) return;
    if (admin.status === "signed-out" || admin.status === "not-admin") {
      router.replace("/admin/login");
    }
  }, [admin.status, router, isLoginRoute]);

  // The sign-in page renders on its own, without the admin guard or shell.
  if (isLoginRoute) {
    return <>{children}</>;
  }

  if (admin.status === "loading") {
    return (
      <div className="dash-shell flex min-h-screen items-center justify-center">
        <p className="text-sm text-slate-500">Verifying admin access…</p>
      </div>
    );
  }

  if (admin.status === "error") {
    return (
      <div className="dash-shell flex min-h-screen items-center justify-center px-6">
        <div className="dash-card max-w-md p-6 text-center">
          <h2 className="text-lg font-bold text-slate-900">Admin access unavailable</h2>
          <p className="mt-2 text-sm text-slate-600">{admin.message}</p>
        </div>
      </div>
    );
  }

  if (admin.status === "signed-out" || admin.status === "not-admin") {
    return null;
  }

  return (
    <div className="dash-shell min-h-screen">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <AdminSidebar open={navOpen} onClose={() => setNavOpen(false)} />
      {navOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setNavOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
        />
      )}
      <div className="lg:pl-[248px]">
        <AdminTopBar
          title={title}
          navOpen={navOpen}
          onOpenNav={() => setNavOpen(true)}
        />
        <main id="main-content" className="px-4 py-5 sm:px-6 sm:py-6 lg:px-7">
          {children}
        </main>
      </div>
    </div>
  );
}
