"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Menu, LogOut, User, Flame } from "lucide-react";

const navItems = [
  { href: "/", label: "Accueil" },
  { href: "/fire-stations", label: "Centres de secours" },
  { href: "/vehicles", label: "Véhicules" },
];

export function Header() {
  const { data: session } = useSession();
  const user = session?.user;
  const navLinkClass =
    "text-sm hover:text-primary transition-colors font-medium";

  return (
    <header className="border-b border-primary/20 sticky top-0 z-40 bg-gradient-to-r from-primary/5 via-background to-primary/5 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-2xl font-bold hover:opacity-80 transition-opacity"
        >
          <div className="p-1.5 bg-primary rounded-lg">
            <Flame className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            SDMIS Terrain
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navItems.map(({ href, label }) => (
            <Link key={href} href={href} className={navLinkClass}>
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <div className="text-sm text-right hidden sm:block">
                <p className="font-medium">{user.name}</p>
                {user.email ? (
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                ) : null}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (process.env.NEXT_PUBLIC_DISABLE_AUTH === "1") {
                    window.location.href = "/auth/signin";
                    return;
                  }

                  signOut({ callbackUrl: "/auth/signin" });
                }}
                className="text-sm"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Sign Out
              </Button>
            </>
          ) : (
            <Link href="/auth/signin">
              <Button variant="default" size="sm">
                <User className="w-4 h-4 mr-1" />
                Sign In
              </Button>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
