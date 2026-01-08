"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  LogOut,
  User,
  Flame,
  Home,
  AlertTriangle,
  Building2,
  Truck,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/incidents", label: "Incidents", icon: AlertTriangle },
  { href: "/fire-stations", label: "Centres", icon: Building2 },
  { href: "/vehicles", label: "Véhicules", icon: Truck },
];

export function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const user = session?.user;

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="border-b border-primary/20 sticky top-0 z-40 bg-gradient-to-r from-primary/5 via-background to-primary/5 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold hover:opacity-80 transition-opacity"
        >
          <div className="p-1.5 bg-primary rounded-lg">
            <Flame className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent hidden sm:inline">
            SDMIS Terrain
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}>
              <Button
                variant={isActive(href) ? "secondary" : "ghost"}
                size="sm"
                className={`gap-2 ${
                  isActive(href)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Button>
            </Link>
          ))}
        </nav>

        {/* User Menu & Mobile Menu */}
        <div className="flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.name}
                    </p>
                    {user.email && (
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth/signin">
              <Button variant="default" size="sm">
                <User className="w-4 h-4 mr-2" />
                Connexion
              </Button>
            </Link>
          )}

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Ouvrir le menu"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <div className="p-1.5 bg-primary rounded-lg">
                    <Flame className="w-4 h-4 text-primary-foreground" />
                  </div>
                  SDMIS Terrain
                </SheetTitle>
              </SheetHeader>
              <Separator className="my-4" />
              <nav className="flex flex-col gap-2">
                {navItems.map(({ href, label, icon: Icon }) => (
                  <Link key={href} href={href}>
                    <Button
                      variant={isActive(href) ? "secondary" : "ghost"}
                      className={`w-full justify-start gap-3 ${
                        isActive(href)
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {label}
                    </Button>
                  </Link>
                ))}
              </nav>
              {user && (
                <>
                  <Separator className="my-4" />
                  <div className="px-2 py-3 rounded-lg bg-muted/50">
                    <p className="text-sm font-medium">{user.name}</p>
                    {user.email && (
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    )}
                  </div>
                </>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
