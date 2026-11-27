
"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { useAuth } from "@/lib/hooks/use-auth";
import { getFirebaseClients } from "@/lib/firebase/client";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TopBar } from "@/components/dashboard/topbar";
import { ChatWidget } from "@/components/dashboard/chat-widget";
import { ActivityToast } from "@/components/dashboard/activity-toast";
import { SignOutModal } from "@/components/dashboard/sign-out-modal";

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/fixed-deposit/new": "Fixed Deposit",
  "/dashboard/fixed-deposits": "My Fixed Deposits",
  "/dashboard/deposit/new": "New Deposit",
  "/dashboard/deposits": "Deposit List",
  "/dashboard/send": "Send Money",
  "/dashboard/transfers": "Transfer List",
  "/dashboard/request/new": "Request Money",
  "/dashboard/requests": "All Request",
  "/dashboard/swap": "Swap Assets",
  "/dashboard/swaps": "All Swap",
  "/dashboard/escrow/new": "Create Escrow",
  "/dashboard/escrows": "Escrow List",
  "/dashboard/dispute": "Dispute",
  "/dashboard/qr-payment": "QR Payment & Scan to Pay",
  "/dashboard/qr-payments": "QR Payment List",
  "/dashboard/qfs-card": "Web3 Crypto Cards",
  "/dashboard/voucher/create": "Create Voucher",
  "/dashboard/voucher/redeem": "Redeem Voucher",
  "/dashboard/vouchers": "Voucher List",
  "/dashboard/invoice/create": "Create Invoice",
  "/dashboard/invoices": "Invoice List",
  "/dashboard/bill/pay": "Pay Bill",
  "/dashboard/bills": "Bill List",
  "/dashboard/payout/request": "Request Payout",
  "/dashboard/payouts": "Payout List",
  "/dashboard/tickets": "Support",
  "/dashboard/kyc": "KYC Verification",
  "/dashboard/security": "Google Authenticator & Wallet Security",
  "/dashboard/notifications": "Settings",
  "/dashboard/profile": "Profile Settings",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const title = pathname
    ? TITLES[pathname] ?? "Dashboard"
    : "Dashboard";

  const [signOutOpen, setSignOutOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  // Allow Escape to dismiss the mobile drawer.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setNavOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  // Prevent the page behind the mobile drawer from scrolling.
  useEffect(() => {
    if (!navOpen) return;

    const previous = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, [navOpen]);

  // Reset the drawer when the viewport reaches desktop size.
  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");

    function onChange() {
      if (query.matches) {
        setNavOpen(false);
      }
    }

    onChange();

    query.addEventListener("change", onChange);

    return () => {
      query.removeEventListener("change", onChange);
    };
  }, []);

  // Sign out the current user.
  async function confirmSignOut() {
    try {
      const { auth } = getFirebaseClients();

      await signOut(auth);
    } catch {
      // If Firebase isn't configured, still route back to home.
    } finally {
      setSignOutOpen(false);
      router.push("/");
    }
  }

  // ==========================================
  // AUTHENTICATION & EMAIL VERIFICATION GUARD
  // ==========================================

  useEffect(() => {
    if (auth.status === "signed-out") {
      router.replace("/login");
    }

    if (auth.status === "unverified") {
      router.replace("/verify-email");
    }
  }, [auth.status, router]);

  // ==========================================
  // LOADING STATE
  // ==========================================

  if (auth.status === "loading") {
    return (
      <div className="dash-shell flex min-h-screen items-center justify-center">
        <p className="text-sm text-slate-500">
          Loading your dashboard…
        </p>
      </div>
    );
  }

  // ==========================================
  // AUTHENTICATION ERROR
  // ==========================================

  if (auth.status === "error") {
    return (
      <div className="dash-shell flex min-h-screen items-center justify-center px-6">
        <div className="dash-card max-w-md p-6 text-center">
          <h2 className="text-lg font-bold text-slate-900">
            Dashboard unavailable
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            {auth.message}
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // BLOCK UNAUTHENTICATED AND UNVERIFIED USERS
  // ==========================================

  if (
    auth.status === "signed-out" ||
    auth.status === "unverified"
  ) {
    return null;
  }

  // ==========================================
  // AUTHENTICATED & VERIFIED DASHBOARD
  // ==========================================

  return (
    <div className="dash-shell min-h-screen">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <Sidebar
        open={navOpen}
        onClose={() => setNavOpen(false)}
        onLogout={() => setSignOutOpen(true)}
      />

      {navOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setNavOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
        />
      )}

      <div className="lg:pl-[248px]">
        <TopBar
          title={title}
          navOpen={navOpen}
          onOpenNav={() => setNavOpen(true)}
          onOpenSignOut={() => setSignOutOpen(true)}
        />

        <main
          id="main-content"
          className="px-4 py-5 sm:px-6 sm:py-6 lg:px-7"
        >
          {children}
        </main>
      </div>

      <ChatWidget />

      <ActivityToast />

      <SignOutModal
        open={signOutOpen}
        onCancel={() => setSignOutOpen(false)}
        onConfirm={confirmSignOut}
      />
    </div>
  );
}
